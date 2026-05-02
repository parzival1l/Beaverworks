# Local testing — launch and verify

This guide pairs with the repo scripts so you can **boot the stack** and **prove the RAG pathway** without hunting through `architecture.md` for every flag.

| Port | Service |
|------|---------|
| 5173 | Vite frontend (`/api` proxied to Express) |
| 3002 | Express API |
| 3000 | Botpress ADK bot (`adk dev`) |
| 3001 | Botpress dev console |
| 3099 | Ephemeral port used by `test-rag-pathway.sh` only |

---

## One-shot automated check (recommended first)

Runs **ingest → backend Jest → backend `tsc` → focused frontend Vitest → live `POST /api/search`** on a throwaway server.

```bash
# From repo root
bash scripts/test-rag-pathway.sh
```

| Flag | Meaning |
|------|---------|
| *(none)* | Full pipeline; **stubs** the Botpress client (no `adk dev` required). |
| `--skip-tests` | Only ingest + HTTP smoke (faster). |
| `--with-agent` | Uses the **real** `adk workflows run searchCharities …` path. Requires **`adk dev`** already running in `agent/`, **`adk` on PATH**, and **`OPENAI_API_KEY`** in the environment (or configure secrets per `agent/README.md`). |

**Full RAG smoke (after agent is up):**

```bash
# Terminal A — agent
cd agent && npm install && npm run dev   # or: adk dev; see agent/package.json

# Terminal B — sync KB after changing charity markdown
cd agent && adk kb sync --dev

# Terminal C — run smoke against real workflow
bash scripts/test-rag-pathway.sh --with-agent --skip-tests
```

---

## Interactive dev — frontend + backend only

Starts Express and Vite; tails combined logs until **Ctrl-C**.

```bash
bash scripts/launch-dev.sh              # opens browser on macOS
bash scripts/launch-dev.sh --no-open    # no auto-open
bash scripts/launch-dev.sh --playwright # also runs headed Playwright tour
```

**Manual RAG check in the UI**

1. Sign in (demo), complete the questionnaire, land on **`/dashboard?mode=filtered`**.
2. Use **Refine your search** + **Search** — that hits **`POST /api/search`**.
3. If the agent is **not** running, Express returns **502** and the UI falls back to keyword-matched mock charities.

To exercise real RAG in the browser, run **`adk dev`** in `agent/` (and sync KB) **before** clicking Search.

---

## Prerequisites

- **Node 20+** and npm.
- **Backend / frontend deps:** `cd backend && npm install`, `cd frontend && npm install`.
- **Agent (optional, for real RAG):** [Botpress ADK CLI](https://botpress.com/docs/adk/cli-reference.md) `adk` on PATH, `cd agent && npm install`, OpenAI key via `adk secret:set` or `agent`’s `npm run secrets:sync` (see `agent/README.md`).

---

## Other test commands

```bash
cd backend && npm test
cd backend && npx tsc --noEmit
cd frontend && npm test
```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `502` on `/api/search` | `adk dev` not running, wrong `ADK_AGENT_DIR`, or workflow timeout. |
| Empty `results` | Workflow OK but `charityId` not in `agent/data/charities.metadata.json` — re-run ingest: `npx tsx scripts/ingest-charities.ts`. |
| Port in use | Change `PORT` in `launch-dev.sh` env (`BACKEND_PORT` / `FRONTEND_PORT`) or stop the conflicting process. |

Canonical system design and API contracts: [`architecture.md`](../architecture.md).
