#!/usr/bin/env bash
# scripts/launch-dev.sh
#
# Human-oriented guide: docs/local-testing.md
#
# Boots the Altru dev stack and opens it in a browser.
#   - backend:  http://localhost:3002  (express, tsx watch)
#   - frontend: http://localhost:5173  (vite, proxies /api -> :3002)
#   - agent (optional): Botpress ADK npm run dev in agent/ (bot :3000, console :3001)
#
# Usage:
#   bash scripts/launch-dev.sh                     # FE + BE + open browser (no ADK)
#   bash scripts/launch-dev.sh --with-agent       # FE + BE + ADK dev (one-tab logs)
#   bash scripts/launch-dev.sh --no-open           # skip auto-open
#   bash scripts/launch-dev.sh --playwright        # also drive a headed Playwright window
#
# Ctrl-C tears everything down.

set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

OPEN_BROWSER=1
RUN_PLAYWRIGHT=0
WITH_AGENT=0
for arg in "$@"; do
  case "$arg" in
    --no-open)    OPEN_BROWSER=0 ;;
    --playwright) RUN_PLAYWRIGHT=1 ;;
    --with-agent) WITH_AGENT=1 ;;
    -h|--help)    sed -n '1,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
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

_CLEANING_UP=

cleanup() {
  # INT and EXIT can both run this; only tear down once (avoids duplicate lines).
  [ -n "${_CLEANING_UP:-}" ] && return 0
  _CLEANING_UP=1
  echo
  step "Shutting down…"
  [ -n "${FRONTEND_PID:-}" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "${ADK_PID:-}" ] && kill "$ADK_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  ok "Stopped."
}
trap cleanup EXIT INT TERM

ADK_BOT_PORT="${ADK_BOT_PORT:-3000}"

# ---- ADK agent (optional) -----------------------------------------------------
if [ "$WITH_AGENT" -eq 1 ]; then
  ADK_LOG="$LOG_DIR/adk.log"
  step "Starting ADK in agent/ (targets bot :$ADK_BOT_PORT; logs → adk.log)"
  command -v adk >/dev/null || {
    warn "Botpress CLI 'adk' not on PATH — install ADK first."
    exit 1
  }
  (
    cd "$REPO_ROOT/agent" && npm run dev
  ) >>"$ADK_LOG" 2>&1 &
  ADK_PID=$!

  ADK_READY=0
  for _ in $(seq 1 320); do
    if curl -s -o /dev/null --connect-timeout 1 --max-time 3 "http://127.0.0.1:$ADK_BOT_PORT/" 2>/dev/null; then
      ok "ADK bot accepting HTTP on :$ADK_BOT_PORT"
      ADK_READY=1
      break
    fi
    if ! kill -0 "$ADK_PID" 2>/dev/null; then
      warn "ADK process exited early — log follows:"
      cat "$ADK_LOG"
      exit 1
    fi
    sleep 0.25
  done
  if [ "$ADK_READY" -ne 1 ]; then
    warn "ADK did not become ready on :$ADK_BOT_PORT within timeout — dump log:"
    cat "$ADK_LOG"
    exit 1
  fi

  warn "ADK runs in background (no interactive CLI panel). Inspect ${ADK_LOG} or multiplexed tail below."
fi

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
if [ "${WITH_AGENT:-0}" -eq 1 ]; then
  echo "    ADK bot     → http://localhost:$ADK_BOT_PORT"
  echo "    ADK console → http://localhost:${ADK_CONSOLE_PORT:-3001}"
fi
echo "    logs        → $LOG_DIR"

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
if [ "${WITH_AGENT:-0}" -eq 1 ]; then
  tail -n +1 -f "$ADK_LOG" "$BACKEND_LOG" "$FRONTEND_LOG"
else
  tail -n +1 -f "$BACKEND_LOG" "$FRONTEND_LOG"
fi
