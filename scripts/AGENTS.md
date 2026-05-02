# Agent Instructions (Scripts)

Dev-orchestration and pipeline scripts. None of these belong on a hot path — they boot dev servers, regenerate data, or run end-to-end smokes.

## Inventory

| Script                  | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `launch-dev.sh`         | Boot frontend + backend (and optionally ADK) and tail logs. Ctrl-C tears down.           |
| `playwright-tour.mjs`   | Headed Chromium of the frontend; takes a landing-page screenshot, stays open until killed. |
| `ingest-charities.ts`   | Read `data/charities.{csv,txt,seed.json}` → write `agent/data/charities*` artifacts.     |
| `test-rag-pathway.sh`   | Regenerate corpus → run unit tests → live-fire `POST /api/search` smoke (stub or real).  |

Human-oriented walkthrough: `[docs/local-testing.md](../docs/local-testing.md)`.

## `launch-dev.sh` — flags

```bash
bash scripts/launch-dev.sh                  # FE + BE + open browser
bash scripts/launch-dev.sh --with-agent     # also boot `adk dev` in agent/
bash scripts/launch-dev.sh --no-open        # skip auto-open
bash scripts/launch-dev.sh --playwright     # also launch the Playwright tour
```

Env: `BACKEND_PORT` (3002), `FRONTEND_PORT` (5173), `ADK_BOT_PORT` (3000), `ADK_CONSOLE_PORT` (3001). Logs go to `mktemp -d` and are `tail -f`'d in the foreground.

## `ingest-charities.ts` — usage

```bash
# From repo root:
npx tsx scripts/ingest-charities.ts
```

Resolves the first existing input among `data/charities.csv`, `data/charities.txt`, `data/charities.seed.json`. Always rewrites `data/charities.seed.json` (canonical form) **and** writes:

- `agent/data/charities.indexed.json`
- `agent/data/charities.metadata.json`
- `agent/data/charities/<id>.md` (one per record; pre-existing `*.md` are deleted first)

**Cwd:** must be runnable from any directory (uses `__dirname` to find repo root). It is also exposed as `agent/` `npm run ingest`.

After running it while `adk dev` is up, also run `cd agent && adk kb sync --dev` to refresh embeddings.

## `test-rag-pathway.sh` — flags

```bash
bash scripts/test-rag-pathway.sh                # ingest + tests + STUB smoke on :3099
bash scripts/test-rag-pathway.sh --skip-tests   # only the smoke
bash scripts/test-rag-pathway.sh --with-agent   # use the real Botpress workflow
```

- STUB mode injects a fake `BotClient` via `setBotClient(...)` before `backend/src/index.ts` is imported. No `adk` process needed.
- AGENT mode requires `adk dev` already running in `agent/` and `OPENAI_API_KEY` exported.
- Uses port **3099** to avoid clashing with a real `npm run dev` on 3002.

## Anti-patterns

- Adding a script that hard-codes `cd backend && ...` without re-anchoring to `REPO_ROOT` — breaks when invoked from any other cwd.
- Swallowing `set -euo pipefail`. All shell scripts here use strict mode; preserve it.
- Hand-rolling another bot-client stub. Reuse `setBotClient(...)` from `backend/src/bot/client.ts` (the pattern in `test-rag-pathway.sh` is the template).
- Spinning up the real `adk` CLI in CI without gating on `--with-agent` and `OPENAI_API_KEY` — the default path must remain hermetic (STUB).
- Forgetting to `chmod +x` new shell scripts (`launch-dev.sh`, `test-rag-pathway.sh` are executable).
- Editing the generated artifacts (`agent/data/charities*`) instead of the seed/CRA inputs and re-ingesting.
