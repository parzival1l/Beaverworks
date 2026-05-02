# Altru — Feature Process

> Phase-level tracking. Update when a phase status changes meaningfully (shipped, blocked, new phase added). For session-level detail, see [ACTIVITY.md](./ACTIVITY.md).

---

## Phases

### Phase 0 — Project Scaffolding ✅ Complete

**Goal:** Cursor rules, architecture SSOT, process docs, and repo hygiene in place before any feature work.

| Item | Status |
| --- | --- |
| Git repo cloned from `parzival1l/Altru` | ✅ Done |
| `.cursor/rules/core.mdc` (TDD + architecture update rule) | ✅ Done |
| `.cursor/rules/git.mdc` (branch-first + `docs/ACTIVITY.md` format) | ✅ Done |
| [`docs/architecture.md`](./architecture.md) (SSOT) | ✅ Done |
| [`docs/feature-process.md`](./feature-process.md) (this file) | ✅ Done |
| [`docs/ACTIVITY.md`](./ACTIVITY.md) | ✅ Done |
| `AGENTS.md` files (root, backend, frontend) updated | ✅ Done |

---

### Phase 1 — Stack Decision & Initial Scaffold 🟩 Mostly complete

**Goal:** Decide on frontend/backend/infra stack and scaffold the project structure.

| Item | Status |
| --- | --- |
| Frontend stack confirmed and documented in `docs/architecture.md` | ✅ Done |
| Frontend boilerplate (Vite 5, React 18, routes, pages, tax calculator) | ✅ Done |
| Frontend test runner (Vitest + Testing Library) | ✅ Done |
| Backend questionnaire API (Express + Jest) scaffold in `backend/` | ✅ Done |
| Stack decided for backend/infra (beyond questionnaire API) | ✅ Done |
| … | Express search proxy + **`agent/` Botpress ADK** + OpenAI embeddings via KB (see [`docs/architecture.md`](./architecture.md)) |
| `docs/architecture.md` Mermaid diagram reflects current flows | ✅ Done |

---

### Phase 2 — Backend integration 🟨 In progress

**Goal:** Grow backend and replace mocks where appropriate.

| Item | Status |
| --- | --- |
| `POST /api/questionnaire/submit` + `frontend/src/api/questionnaire.ts` wired (**Vite proxy to port 3002**; ADK console uses 3001) | ✅ Done |
| RAG / ranked matches from **`{ answers, prompt }`** (`POST /api/search` → `searchCharities` workflow → hydrated results) | ✅ Done |
| Smoke / CI script for the pathway | ✅ Done (`scripts/test-rag-pathway.sh`; default mode stubs the bot client) |
| Charity listing/detail fully served from API (not `mockCharities.ts`) | 🔲 Pending |
| Production auth (if needed) vs demo `localStorage` | 🔲 Pending |

---

### Phase 5 — Docs + tracker (plan "phase5-docs")

**Goal:** Architecture SSOT, activity log, and this file stay aligned with shipped behaviour.

| Item | Status |
| --- | --- |
| [`docs/architecture.md`](./architecture.md) — `/api/search` contract, ports 5173 / 3002 / 3000 / 3001, Mermaid, CRA ingest + ingest script | ✅ Done |
| [`docs/ACTIVITY.md`](./ACTIVITY.md) — session notes (`Express→agent` bridge, secret sync, etc.) | ✅ Done |
| [`docs/feature-process.md`](./feature-process.md) — phase table reflects RAG + proxy port correction | ✅ Done (this edit) |

---

_[Add further phases here as features are scoped during the hackathon.]_
