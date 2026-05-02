#!/usr/bin/env bash
# scripts/test-rag-pathway.sh
#
# End-to-end smoke for the new /api/search RAG pathway:
#   1. Regenerate the charity corpus from the seed.
#   2. Run automated tests (backend Jest, frontend Vitest, type-checks).
#   3. Optionally smoke-test the live route end-to-end:
#        a. STUB mode (default, no Botpress): runs Express against a stubbed
#           bot client, hits POST /api/search, asserts a hydrated response.
#        b. AGENT mode (--with-agent): expects `adk dev` already running in
#           ./agent and OPENAI_API_KEY set; runs the real workflow.
#
# Usage:
#   bash scripts/test-rag-pathway.sh                # automated tests + STUB smoke
#   bash scripts/test-rag-pathway.sh --skip-tests   # only the smoke
#   bash scripts/test-rag-pathway.sh --with-agent   # use the real Botpress agent
#
# Exit 0 on full success; non-zero on any failure (logs printed to stdout).

set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

WITH_AGENT=0
SKIP_TESTS=0
for arg in "$@"; do
  case "$arg" in
    --with-agent) WITH_AGENT=1 ;;
    --skip-tests) SKIP_TESTS=1 ;;
    -h|--help)
      sed -n '1,25p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
step "1. Regenerate charity corpus from seed"
( cd backend && npx tsx "$REPO_ROOT/scripts/ingest-charities.ts" )
test -f agent/data/charities.metadata.json \
  || fail "ingest did not produce agent/data/charities.metadata.json"
test -d agent/data/charities \
  || fail "ingest did not produce agent/data/charities/ directory"
ok "Corpus written ($(ls agent/data/charities/*.md | wc -l | tr -d ' ') markdown files)"

# ---------------------------------------------------------------------------
if [ "$SKIP_TESTS" -eq 0 ]; then
  step "2a. Backend Jest"
  ( cd backend && npx jest )
  ok "Backend tests"

  step "2b. Backend tsc --noEmit"
  ( cd backend && npx tsc --noEmit )
  ok "Backend types"

  step "2c. Frontend Vitest (search.api + DashboardPage only — taxCalculator missing on main is unrelated)"
  ( cd frontend && npx vitest run src/__tests__/search.api.test.ts src/__tests__/DashboardPage.test.tsx )
  ok "Frontend RAG tests"
fi

# ---------------------------------------------------------------------------
step "3. Live POST /api/search smoke"

PORT=3099   # avoid clashing with a real dev server on 3002

if [ "$WITH_AGENT" -eq 1 ]; then
  echo "  Mode: AGENT (real Botpress workflow)"
  command -v adk >/dev/null || fail "adk CLI not found on PATH"
  test -n "${OPENAI_API_KEY:-}" || fail "OPENAI_API_KEY not exported"
  STUB_FLAG=""
else
  echo "  Mode: STUB (no Botpress required; bot client returns a fixture)"
  STUB_FLAG="1"
fi

# Spawn Express with our optional stub injected ahead of the route module load.
SERVER_LOG="$(mktemp)"
PORT="$PORT" RAG_TEST_STUB="$STUB_FLAG" \
  npx --prefix backend tsx -e "
    import('./backend/src/bot/client').then((mod) => {
      const { setBotClient } = mod.default ?? mod;
      if (process.env.RAG_TEST_STUB) {
        setBotClient({
          runSearch: async (req) => ({
            queryId: 'stub-q-1',
            results: [
              {
                charityId: 'montreal-heart-wellness',
                organizationName: 'Montreal Heart & Wellness Foundation',
                score: 0.92,
                rationale: 'STUB: matches \"' + req.prompt + '\" via cardiac & mental-health programs in Montreal.',
              },
              {
                charityId: 'quebec-learning-labs',
                organizationName: 'Quebec Learning Labs',
                score: 0.71,
                rationale: 'STUB: STEM and digital access for children & youth.',
              },
            ],
          }),
        });
      }
      return import('./backend/src/index');
    }).catch((e) => { console.error(e); process.exit(1); });
  " >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true; echo; echo "--- server log ---"; cat "$SERVER_LOG"' EXIT

# Wait for the server.
for _ in $(seq 1 40); do
  if curl -sf "http://localhost:$PORT/api/questionnaire/submit" -X POST \
        -H 'content-type: application/json' \
        -d '{"answers":{"causes":"x","beneficiaries":"x","geography":"x","givingStyle":"x"}}' \
        >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

step "3a. POST /api/search"
RESP="$(mktemp)"
HTTP="$(curl -s -o "$RESP" -w '%{http_code}' \
  -X POST "http://localhost:$PORT/api/search" \
  -H 'content-type: application/json' \
  -d '{
    "answers": {
      "causes": "Environment & Climate",
      "beneficiaries": "Children & Youth",
      "geography": "Quebec",
      "givingStyle": "One-time donation"
    },
    "prompt": "I want to fund tree planting near schools in Montreal."
  }')"

echo "  HTTP $HTTP"
echo "  --- body ---"
( command -v jq >/dev/null && jq . <"$RESP" ) || cat "$RESP"

[ "$HTTP" = "200" ] || fail "expected 200, got $HTTP"
grep -q '"queryId"' "$RESP" || fail "response missing queryId"
grep -q '"rationale"' "$RESP" || fail "response missing rationale"
grep -q '"score"' "$RESP" || fail "response missing score"
ok "/api/search returned hydrated results with score + rationale"

step "3b. POST /api/search rejects an empty prompt"
HTTP="$(curl -s -o "$RESP" -w '%{http_code}' \
  -X POST "http://localhost:$PORT/api/search" \
  -H 'content-type: application/json' \
  -d '{"answers":{"causes":"a","beneficiaries":"b","geography":"c","givingStyle":"d"},"prompt":""}')"
[ "$HTTP" = "400" ] || fail "expected 400 for empty prompt, got $HTTP"
ok "Empty prompt → 400"

step "ALL GREEN"
echo
echo "Next manual step (real RAG, end-to-end):"
echo "  cd agent && npm install"
echo "  adk secret:set OPENAI_API_KEY sk-..."
echo "  adk dev               # bot on :3000, console on :3001"
echo "  adk kb sync --dev     # embed the markdown corpus"
echo "  bash scripts/test-rag-pathway.sh --with-agent --skip-tests"
