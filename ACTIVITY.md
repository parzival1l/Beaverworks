# Activity Log

> Session-level changelog for Beaverworks. See [docs/feature-process.md](docs/feature-process.md) for phase-level status.

---

## 2026-05-02 18:59 ET — Housekeeping: move `feature-process` + Botpress ADK doc into `docs/`

- **Files:** `docs/botpress-adk.md`, `docs/feature-process.md`, `AGENTS.md`, `.cursor/rules/core.mdc`, `architecture.md`, `ACTIVITY.md`, `README.md`
- **What:** Relocated phase tracker and Markdown Botpress ADK companion out of repo root so only core entrypoints (`README`, `architecture`, `ACTIVITY`, `AGENTS`) stay at top level; refreshed all links and project tree in architecture SSOT.
- **Why:** Reduce root clutter without changing tooling contracts; Cursor/agent rules still cite `docs/feature-process.md` explicitly.
- **Commands:** none

## 2026-05-02 — README: app preview image

- **Files:** `README.md`, `docs/assets/altru-app-preview.png`, `ACTIVITY.md`
- **What:** Moved the pasted root screenshot into `docs/assets/` with a stable filename and embedded it below the README project description.
- **Why:** Keep repository media organized while featuring the app preview on the project landing page.
- **Commands:** none

## 2026-05-02 — `launch-dev.sh --with-agent`: one-terminal FE + BE + ADK

- **Files:** `scripts/launch-dev.sh`, `docs/local-testing.md`, `scripts/test-rag-pathway.sh` (header comment), `ACTIVITY.md`
- **What:** Optional `--with-agent` starts **`agent/npm run dev`** in the background before Express/Vite; health-probes `:3000`; **Ctrl+C** stops ADK too; multiplexed `tail -f`; documented trade-off (non-interactive ADK CLI).
- **Why:** Reduce manual multi-terminal churn for full-stack local RAG.
- **Commands:** `bash -n scripts/launch-dev.sh`

---

## 2026-05-02 — `docs/local-testing.md`: terminal flow + pathway flags aligned with smoke runs

- **Files:** `docs/local-testing.md`, `ACTIVITY.md`
- **What:** Documented the working multi-terminal order (`adk dev` before CLI/workflow; optional `adk workflows run …`; `--with-agent` vs `--with-agent --skip-tests`); clarified **`OPENAI_API_KEY` export** vs ADK `secrets:sync`; added troubleshooting for dev-server-not-running and script guard; matched **frontend Vitest** commands to pathway step 2c.
- **Why:** Match commands from local terminal runs so the guide is runnable without drift from `scripts/test-rag-pathway.sh`.
- **Commands:** none

---

## 2026-05-02 — Frontend: fix duplicate charity card markup; quieter tests (Vite 8 + router future + localStorage)

- **Files:** `frontend/src/components/charity/CharityCard.tsx`, `frontend/src/setupTests.ts`, `frontend/src/routerFuture.ts`, `frontend/src/main.tsx`, `frontend/src/__tests__/{DashboardPage,LoginPage}.test.tsx`, `frontend/package.json`, `package-lock.json`, `architecture.md`
- **What:** Removed duplicated title/category in `CharityCard` (Dashboard Vitest ambiguity). Opted into React Router v6 `future` flags (shared `routerFuture.ts`) on `BrowserRouter` and test `MemoryRouter`s. Test setup always defines an in-memory `localStorage` so Vitest/Vite runners never touch Node’s experimental webstorage getter. Raised `vite` to ^8 and `@vitejs/plugin-react` to ^6 to match Vitest’s bundled Vite and drop esbuild deprecation noise. Fixed `tsc -b`: `QuestionnaireAnswers` type-only import; explicit Vitest globals import in `Questionnaire.test.tsx`.
- **Why:** CI / `scripts/test-rag-pathway.sh` frontend step was failing; merge noise from router + Vite/React plugin version skew.
- **Commands:** `cd frontend && npm run test:run && npm run build` (recommended)

---

## 2026-05-02 — Docs: local testing guide + script cross-links

- **Files:** `docs/local-testing.md` (new), `scripts/{test-rag-pathway,launch-dev}.sh` (comment pointers), `architecture.md` (Testing link + tree)
- **What:** Consolidated **launch + test** instructions (ports, `bash scripts/test-rag-pathway.sh`, `bash scripts/launch-dev.sh`, real-RAG prerequisites) alongside the bash scripts already in tree.
- **Why:** Reduce hunting across chat history for smoke vs full-stack flows.
- **Commands:** none

---

## 2026-05-02 — Phase 5 tracker: reconcile `feature-process.md` + mention `test-rag-pathway`

- **Files:** `feature-process.md`, `architecture.md`, `ACTIVITY.md`
- **What:** `**feature-process.md` was stale**: it still said the Vite proxy targeted **3001** and marked **RAG as pending** after `/api/search` and the Botpress workflow had already shipped. Corrected Phase 2 (proxy → **3002**, RAG ✅, noted `scripts/test-rag-pathway.sh`). Added an explicit Phase 5 table so "docs + tracker" lines up with the plan. Listed `test-rag-pathway.sh` under **architecture.md** Testing + Project Structure.
- **Why:** Cursor's Phase 5 todo looked unfinished because **the todo wasn't flipped**, not because `**architecture.md` was blank** — SSOT already described the bridge.
- **Commands:** none

---

## 2026-05-02 — Align demo script + architecture with Express→ADK bridge

- **Files:** `agent/DEMO-SCRIPT-60s.md`, `architecture.md`, `ACTIVITY.md`
- **What:** Refreshed the 60s Botpress talk track (demo auth on client, frontend keyword fallback on search errors, Vite :5173 in demo beats, technical note on `adk workflows run`). Corrected `architecture.md` API behaviour and Mermaid edge: Express uses CLI bot client, not `BOTPRESS_WORKFLOW_URL` HTTP.
- **Why:** Docs matched an older integration story; implementation is `backend/src/bot/client.ts` shelling out to ADK.

---

- **Files:** `agent/scripts/sync-secrets.ts` (new), `agent/package.json`, `agent/README.md`, `architecture.md`, `ACTIVITY.md`
- **What:** Added `npm run secrets:sync` in `agent/` that reads `OPENAI_API_KEY` from `backend/.env` and calls `adk secret:set OPENAI_API_KEY <value>`. `npm run dev` now runs the sync before `adk dev`, so both the `searchCharities` workflow and the webchat conversation pick up the key without a manual `adk secret:set`.
- **Why:** `.env` already holds the key; ADK does not auto-load `.env` (secrets live in `.adk/secrets.json`). One source of truth, no per-dev manual step.
- **Tests:** Trivial dev-script glue, no new behaviour to test (per `core.mdc` test-exception rule).
- **Commands:** none — awaiting user confirmation before commit.

---

## 2026-05-02 13:52 ET — Color system overhaul: trust-first palette

- **Files:** `frontend/tailwind.config.js`, `frontend/src/index.css`, all page and component files in `frontend/src/`
- **What:** Replaced cherry red primary with psychology-backed palette (trust blue primary, green CTAs, orange accent only, red for alerts only)
- **Why:** Red primary causes anxiety/distrust on donation platforms; green donate buttons outperform red by 15–30%
- **Commands:** `cd frontend && npx vitest run && npm run build` — all passed; pushed `cursor/frontend-charity-platform`, merged to `main`, `git push origin main` (commit: `feat(frontend): trust-first color system for donation UX`)

---

## 2026-05-02 13:46 ET — Tax optimizer: over-optimal UI + version `frontend/src/lib`

- **Files:** `.gitignore`, `frontend/src/lib/taxCalculator.ts`, `frontend/src/components/tax/TaxOptimizer.tsx`, `frontend/src/__tests__/taxCalculator.test.ts`, `frontend/src/pages/PaymentPage.tsx`
- **What:** Quebec credit math + `getDonationGap` / uncapped score; three-state dashboard widget (below / optimal / above); fix root `lib/` ignore so `frontend/src/lib` is not gitignored.
- **Why:** Ship tax demo UX and ensure `taxCalculator.ts` is tracked.
- **Commands:** `git push origin cursor/frontend-charity-platform` (commit `27f69e5`)

---

## 2026-05-02 13:46 ET — CRA charities parser (ADK-style) in backend

- **Files:** `backend/src/parsers/cra-charities/` (new folder: `schemas.ts`, `actions/parseCraTsv.ts`, `actions/mapCraRowToCharity.ts`, `actions/parseCraExport.ts`, `actions/writeSeedJson.ts`, `cli.ts`, `index.ts`, `README.md`), `backend/tests/parsers/cra-charities/` (3 test files, 16 tests), `backend/package.json` (+`zod@^3.23.8`), `data/charities.cra.json` (generated, 50 Registered charities), `architecture.md`, `ACTIVITY.md`.
- **What:** New parser that converts the CRA TSV export (`data/Charities_results_2026-05-02-13-43-32.txt`, ISO-8859, 14 columns) into the `charities.seed.json` shape. Written TDD (Red → Green): 16 tests covering TSV parsing, row→record mapping, designation-code & status mapping, and the end-to-end pipeline with filter/limit. Structured per `.cursor/rules/botpress-adk.mdc` — one primitive per file, Zod schemas for all I/O, pure action functions, IO isolated in CLI + `writeSeedJson` — so modules can be lifted into `agent/src/actions/` as ADK `Action`s later. CLI: `npx tsx backend/src/parsers/cra-charities/cli.ts --only-registered --limit 50`.
- **Why:** User asked to convert the CRA TSV results dump to the seed JSON format, keeping the parser self-contained and ADK-shaped so the agent can reuse it.
- **Commands:** `cd backend && npm test` → 39 passed; `npx tsx backend/src/parsers/cra-charities/cli.ts --in data/Charities_results_2026-05-02-13-43-32.txt --out data/charities.cra.json --only-registered --limit 50` → wrote 50 records.

---

## 2026-05-02 13:15 ET — Questionnaire API: merge of `cursor/questionnaire-feature` into Altru plan

- **Files:** `backend/` (Express `POST /api/questionnaire/submit`, Jest tests), `frontend/src/api/questionnaire.ts`, `frontend/vite.config.ts`, `frontend/src/vite-env.d.ts`, `.gitignore`, `architecture.md`, `feature-process.md`, `ACTIVITY.md`
- **What:** Ported Express questionnaire submit from remote branch `cursor/questionnaire-feature` with **Altru four-field** answers (`causes`, `beneficiaries`, `geography`, `givingStyle`). Frontend submits via fetch; Vite dev proxies `/api` → `localhost:3001`. Client filters `mockCharities` from echoed answers; falls back to offline filter if API unavailable.
- **Why:** Wire real submit endpoint while keeping plan-aligned questionnaire UX and mock charity data.
- **Commands:** `cd backend && npm test` (6 passed); `cd frontend && npx vitest run && npm run build`

---

## 2026-05-02 13:09 ET — Product name: Givenly → Altru

- **Files:** `frontend/` (UI, auth key, demo email, package name), `architecture.md`, `ACTIVITY.md`
- **What:** Renamed platform to Altru; `localStorage` key `altru_authed`; demo sign-in `demo@altru.ca`; npm package `altru-frontend`.
- **Why:** Branding update.
- **Commands:** none

---

## 2026-05-02 13:08 ET — Frontend scaffold: Altru charity platform

- **Files:** `frontend/` (new), `architecture.md`, `ACTIVITY.md`, `feature-process.md`
- **What:** Scaffolded Vite+React frontend with Login, Questionnaire (skip-able), Dashboard + Quebec tax optimizer, Charity Detail (15 fields + financial tab), and Payment page. Hardcoded mock charities. TDD for tax logic and login.
- **Why:** Hackathon submission — Montreal Cursor Hackathon at Botpress MTL
- **Commands:** none committed yet — awaiting user confirmation

---

## 2026-05-02 12:31 ET — Project scaffolding: Cursor rules, architecture, activity log, feature process

- **Files:** `.cursor/rules/core.mdc`, `.cursor/rules/git.mdc`, `architecture.md`, `ACTIVITY.md`, `feature-process.md`, `AGENTS.md`, `backend/AGENTS.md`, `frontend/AGENTS.md`
- **What:** Established best-practice scaffolding matching the HailBairApp and food-chatbot project patterns: TDD-enforcing Cursor rules (`core.mdc` + `git.mdc`), architecture SSOT (`architecture.md`), session activity log (`ACTIVITY.md`), phase-level feature tracker (`feature-process.md`), and updated AGENTS.md files at root, backend, and frontend.
- **Why:** Hackathon project kick-off — applying consistent Red → Green → Refactor TDD workflow, branch-first git discipline, and architecture-as-SSOT practices from day one.
- **Commands:** none