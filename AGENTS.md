# Agent Instructions (Workspace)

Root instruction file for Cursor/Claude agents in this monorepo. Deeper `AGENTS.md` files override this one for their subtree.

## What this repo is

**Altru** is a Quebec-focused charity discovery + donation tax-optimizer demo. Three runtimes share one tree:

| Folder      | Runtime                              | Default port | Purpose                                                |
| ----------- | ------------------------------------ | ------------ | ------------------------------------------------------ |
| `frontend/` | Vite 5 + React 18 + TS               | **5173**     | UI; proxies `/api` → backend                           |
| `backend/`  | Node + Express + TS (`tsx` watch)    | **3002**     | JSON API; bridges frontend → agent via `adk` CLI       |
| `agent/`    | Botpress ADK (`@botpress/runtime`)   | **3000** bot / **3001** console | RAG over CRA charity corpus; owns `searchCharities` workflow |
| `data/`     | Source data + generated artifacts    | —            | CRA TSV input + curated seed JSON + ingest outputs     |
| `scripts/`  | Dev orchestration + ingest pipeline  | —            | `launch-dev.sh`, `ingest-charities.ts`, RAG smoke      |

End-to-end request shape: **Frontend → `POST /api/search` → Express → `adk workflows run searchCharities` → Botpress KB → OpenAI rationale → hydrated `Charity` records back to UI.**

## Always-applied rules

- `[.cursor/rules/core.mdc](.cursor/rules/core.mdc)` — TDD (Red→Green→Refactor), architecture-SSOT update rule, confirm before edits >3 files / API / auth / data shape.
- `[.cursor/rules/git.mdc](.cursor/rules/git.mdc)` — branch before commit (`cursor/<topic>`), append `docs/ACTIVITY.md`, **never commit/push without explicit confirmation**.
- `[.cursor/rules/botpress-adk.mdc](.cursor/rules/botpress-adk.mdc)` — applies inside `agent/` and to anything generating ADK code.

## Single sources of truth (do not duplicate, do update)

- **`[docs/architecture.md](docs/architecture.md)`** — system design, API contracts, Mermaid diagram. Update **in the same commit** as any service / API / data-flow change.
- **`[docs/ACTIVITY.md](docs/ACTIVITY.md)`** — session-level changelog. Append after every substantive change.
- **`[docs/feature-process.md](docs/feature-process.md)`** — phase-level feature tracker. Update only when a phase status changes.
- **`[docs/local-testing.md](docs/local-testing.md)`** — canonical "how to run everything" (ports, scripts, flags).

## Per-folder AGENTS.md (read these before editing inside)

- `frontend/AGENTS.md`
- `backend/AGENTS.md`
- `backend/src/bot/AGENTS.md`           — Express ↔ ADK CLI bridge (gotchas)
- `backend/src/parsers/cra-charities/AGENTS.md` — CRA TSV → seed JSON
- `agent/AGENTS.md`                     — Botpress ADK conventions, secrets sync, KB regen
- `data/AGENTS.md`                      — what is hand-curated vs generated
- `scripts/AGENTS.md`                   — orchestration scripts and their flags

## Cross-cutting expectations

- Keep changes focused to the user request. Prefer small, reviewable edits.
- Run relevant checks for touched areas before finishing (Jest in `backend/`, Vitest in `frontend/`, `scripts/test-rag-pathway.sh` for end-to-end).
- Do not modify unrelated files unless explicitly requested.
- **Do not commit or push without explicit user confirmation.**

## Anti-patterns to flag

- Editing `agent/data/charities*` or `data/charities.cra.json` by hand — they are **generated**. Edit the source (`data/charities.seed.json` or the CRA TSV) and re-run the ingest pipeline.
- Calling Botpress workflows from Express via raw `fetch` — use `backend/src/bot/client.ts` (`adk workflows run` CLI bridge).
- Hard-coding `OPENAI_API_KEY` or running `adk secret:set` by hand — keep `backend/.env` as SSOT and rely on `npm run secrets:sync` (auto-runs before `agent/` `npm run dev`).
- Adding endpoints under `/api/...` without updating `docs/architecture.md` API Contracts and the Mermaid diagram in the same commit.
- Bypassing `frontend/src/api/` clients with inline `fetch` calls — keep network surface in one place so the Vite proxy / `VITE_*_URL` overrides keep working.
- Tests that spawn the real `adk` CLI — inject a fake via `setBotClient(...)` (see `backend/tests/search.test.ts`).
