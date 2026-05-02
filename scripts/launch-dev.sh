#!/usr/bin/env bash
# scripts/launch-dev.sh
#
# Boots the Beaverworks dev stack and opens it in a browser.
#   - backend:  http://localhost:3002  (express, tsx watch)
#   - frontend: http://localhost:5173  (vite, proxies /api -> :3002)
#
# Usage:
#   bash scripts/launch-dev.sh                # both servers + open browser
#   bash scripts/launch-dev.sh --no-open      # skip auto-open
#   bash scripts/launch-dev.sh --playwright   # also drive a headed Playwright window
#
# Ctrl-C tears everything down.

set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

OPEN_BROWSER=1
RUN_PLAYWRIGHT=0
for arg in "$@"; do
  case "$arg" in
    --no-open)    OPEN_BROWSER=0 ;;
    --playwright) RUN_PLAYWRIGHT=1 ;;
    -h|--help)    sed -n '1,15p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }

BACKEND_PORT="${BACKEND_PORT:-3002}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

LOG_DIR="$(mktemp -d)"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
echo "Logs: $LOG_DIR"

cleanup() {
  echo
  step "Shutting down…"
  [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "${FRONTEND_PID:-}" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  ok "Stopped."
}
trap cleanup EXIT INT TERM

# ---- backend -----------------------------------------------------------------
step "Starting backend on :$BACKEND_PORT"
( cd backend && PORT="$BACKEND_PORT" npx tsx watch src/index.ts ) >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

for _ in $(seq 1 80); do
  if curl -sf "http://localhost:$BACKEND_PORT/api/questionnaire/submit" -X POST \
       -H 'content-type: application/json' \
       -d '{"answers":{"causes":"x","beneficiaries":"x","geography":"x","givingStyle":"x"}}' \
       >/dev/null 2>&1; then
    ok "Backend healthy"
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    warn "Backend exited early — log follows:"; cat "$BACKEND_LOG"; exit 1
  fi
  sleep 0.25
done

# ---- frontend ----------------------------------------------------------------
step "Starting frontend on :$FRONTEND_PORT"
( cd frontend && npx vite --port "$FRONTEND_PORT" --strictPort ) >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

for _ in $(seq 1 80); do
  if curl -sf "http://localhost:$FRONTEND_PORT/" >/dev/null 2>&1; then
    ok "Frontend healthy"
    break
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    warn "Frontend exited early — log follows:"; cat "$FRONTEND_LOG"; exit 1
  fi
  sleep 0.25
done

URL="http://localhost:$FRONTEND_PORT"
echo
ok "Up:"
echo "    frontend → $URL"
echo "    backend  → http://localhost:$BACKEND_PORT"
echo "    logs     → $LOG_DIR"

if [ "$OPEN_BROWSER" -eq 1 ]; then
  if command -v open >/dev/null;     then open "$URL"
  elif command -v xdg-open >/dev/null; then xdg-open "$URL"
  else warn "Open this manually: $URL"; fi
fi

if [ "$RUN_PLAYWRIGHT" -eq 1 ]; then
  step "Launching Playwright (headed)"
  node "$REPO_ROOT/scripts/playwright-tour.mjs" "$URL"
fi

step "Streaming logs (Ctrl-C to stop everything)"
tail -n +1 -f "$BACKEND_LOG" "$FRONTEND_LOG"
