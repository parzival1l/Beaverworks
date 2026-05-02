# Local testing — launch and verify

This guide pairs with the repo scripts so you can **boot the stack** and **prove the RAG pathway** without hunting through [`docs/architecture.md`](./architecture.md) for every flag.

| Port | Service |
|------|---------|
| 5173 | Vite frontend (`/api` proxied to Express) |
| 3002 | Express API |
| 3000 | Botpress ADK bot (`adk dev`) |
| 3001 | Botpress dev console |
| 3099 | Ephemeral port used by `test-rag-pathway.sh` only |

---

## One-shot automated check (recommended first)

From **repo root**, `scripts/test-rag-pathway.sh` binds a **throwaway Express** on **`:3099`** and drives **`POST /api/search`**. Step **1** always regenerates corpus from seed; **`--skip-tests`** skips step **2** (Jest / `tsc` / frontend Vitest) but still runs ingest and the HTTP smoke.

```bash
# From repo root
bash scripts/test-rag-pathway.sh
```

| Flag | Meaning |
|------|---------|
| *(none)* | Ingest → backend Jest → backend `tsc` → targeted frontend Vitest (`search.api`, `DashboardPage`) → **`/api/search` smoke with a stubbed bot client** (no `adk dev`). |
| `--skip-tests` | Ingest + smoke only (**still stubbed** unless combined with `--with-agent`). |
| `--with-agent` | Same automation as above where applicable, but the smoke hits the **real** `adk workflows run searchCharities …` bridge. **`adk dev` must already be listening** (`agent/`). **`adk` on PATH.** |
| `--with-agent --skip-tests` | Ingest + **real-agent** smoke only — what you typically run once **`adk dev` is steady** and you do not need to repeat unit/type tests. |

**`--with-agent` and secrets:** `test-rag-pathway.sh` **requires a non-empty `OPENAI_API_KEY` in that shell’s environment** (`export …` before the script, or prefix the command). That gate is independent of **`adk secret:set`** — for the workflow to call OpenAI you still need the key configured for ADK (e.g. `cd agent && npm run secrets:sync`, which pulls from `backend/.env`, or `adk secret:set OPENAI_API_KEY …`). If the script passes the gate but the workflow fails, fix ADK/secrets/KB/sync first.

---

## Full RAG / agent stack — terminals that mirror a working flow

Rough layout (separate terminals are fine — or **one** with `bash scripts/launch-dev.sh --with-agent`; see **Interactive dev** below):

1. **`agent/` — dev server must be running first**  
   `adk workflows run …` talks to this process; otherwise the CLI responds with **`Dev server not running — start with \`adk dev\`**`.

   ```bash
   cd agent && npm install
   # Prefer: sync OPENAI_API_KEY into ADK from backend/.env, then start bot + console
   npm run dev
   # Equivalent core: `adk dev`  (without secrets:sync — run sync separately if needed)
   ```

   Console **`http://localhost:3001`**, bot **`http://localhost:3000`** (CLI prints readiness).

2. **`agent/` (same or other tab) — after changing seeded charity markdown**

   ```bash
   cd agent && adk kb sync --dev
   ```

3. **Repo root — optional direct CLI sanity check** (requires step 1)

   ```bash
   cd agent && adk workflows run searchCharities '{"answers":{"causes":"Environment & Climate","beneficiaries":"Children & Youth","geography":"Quebec","givingStyle":"One-time donation"},"prompt":"test"}' --wait --timeout 30s --format json
   ```

4. **Repo root — pathway smoke (matches what CI-style runs use)**

   ```bash
   export OPENAI_API_KEY='…'   # required for script guard when using --with-agent
   bash scripts/test-rag-pathway.sh --with-agent           # full test stack + smoke
   bash scripts/test-rag-pathway.sh --with-agent --skip-tests   # ingest + smoke only
   ```

Stubbed smoke **without** the agent:

```bash
bash scripts/test-rag-pathway.sh              # stub, full automated tests
bash scripts/test-rag-pathway.sh --skip-tests # stub, smoke only
```

**Single terminal:** `bash scripts/launch-dev.sh --with-agent` boots **ADK** (`agent/npm run dev`), **Express**, and **Vite** in one shot; logs are multiplexed. **Ctrl+C** stops all three. Trade-off: the Botpress CLI **panel** (keyboard shortcuts) does not run interactively—inspect the `adk.log` file in the temp dir the script prints.

---

## Interactive dev — frontend + backend (+ optional ADK)

Starts Express and Vite (`--with-agent` also runs **`cd agent && npm run dev`** in the background). Tails combined logs until **Ctrl-C** (stops every child that was started).

```bash
bash scripts/launch-dev.sh                    # FE + BE — opens browser on macOS
bash scripts/launch-dev.sh --with-agent      # FE + BE + ADK (real `/api/search`)
bash scripts/launch-dev.sh --no-open          # skip auto-open
bash scripts/launch-dev.sh --playwright       # also headed Playwright tour
```

**Manual RAG check in the UI**

1. Sign in (demo), complete the questionnaire, land on **`/dashboard?mode=filtered`**.
2. Use **Refine your search** + **Search** — that hits **`POST /api/search`**.
3. If the agent is **not** running, Express returns **502** and the UI falls back to keyword-matched mock charities.

To exercise real RAG in the browser, run **`bash scripts/launch-dev.sh --with-agent`**, or **`adk dev`** / **`npm run dev`** in **`agent/`** in a second terminal (same effect for the bot), and sync KB after markdown changes.

---

## Prerequisites

- **Node 20+** and npm.
- **Backend / frontend deps:** `cd backend && npm install`, `cd frontend && npm install`.
- **Agent (optional, for real RAG):** [Botpress ADK CLI](https://botpress.com/docs/adk/cli-reference.md) `adk` on PATH, `cd agent && npm install`, OpenAI for runtime via **`adk secret:set`** or **`cd agent && npm run secrets:sync`** (reads `OPENAI_API_KEY` from **`backend/.env`**; see **`agent/README.md`**). **`test-rag-pathway.sh --with-agent`** separately requires **`OPENAI_API_KEY` exported** in the shell running the script.

---

## Other test commands

Same pieces the pathway script invokes (split out for ad-hoc runs):

```bash
cd backend && npm test && npx tsc --noEmit
```

```bash
# Focused frontend tests (subset used by test-rag-pathway.sh step 2c)
cd frontend && npx vitest run src/__tests__/search.api.test.ts src/__tests__/DashboardPage.test.tsx
# Full frontend suite
cd frontend && npm run test:run
```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `OPENAI_API_KEY not exported` from `test-rag-pathway.sh --with-agent` | Export the variable **in the same terminal** before the script, or prefix: `OPENAI_API_KEY='…' bash scripts/test-rag-pathway.sh --with-agent`. A `.env` file alone does not satisfy the script check. |
| CLI prints `Dev server not running — start with adk dev` | **`adk dev` (or `npm run dev` in `agent/`) is not up yet.** Start it and wait until the console/bot URLs show ready before `adk workflows run …` or `--with-agent` smoke. |
| `502` on `/api/search` (smoke or app) | `adk dev` not running; wrong **`ADK_AGENT_DIR`**; workflow error/timeout; or ADK secrets/KB missing so the workflow fails. |
| Empty `results` | Workflow ran but returned **`charityId`** values missing from `agent/data/charities.metadata.json` — rebuild corpus (**pathway step 1**, or `(cd backend && npx tsx ../scripts/ingest-charities.ts)` from repo root). |
| Port in use | Change `PORT` in `launch-dev.sh` (`BACKEND_PORT` / `FRONTEND_PORT`) or stop the conflicting process. Smoke uses `:3099` temporarily. |

Canonical system design and API contracts: [`docs/architecture.md`](./architecture.md).
