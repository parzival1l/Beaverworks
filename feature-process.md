# Beaverworks — Feature Process

> Phase-level tracking. Update when a phase status changes meaningfully (shipped, blocked, new phase added). For session-level detail, see [ACTIVITY.md](./ACTIVITY.md).

---

## Phases

### Phase 0 — Project Scaffolding ✅ Complete

**Goal:** Cursor rules, architecture SSOT, process docs, and repo hygiene in place before any feature work.

| Item | Status |
| --- | --- |
| Git repo cloned from `parzival1l/Beaverworks` | ✅ Done |
| `.cursor/rules/core.mdc` (TDD + architecture update rule) | ✅ Done |
| `.cursor/rules/git.mdc` (branch-first + ACTIVITY.md format) | ✅ Done |
| `architecture.md` (SSOT — stack TBD, to be filled as decisions are made) | ✅ Done |
| `feature-process.md` (this file) | ✅ Done |
| `ACTIVITY.md` | ✅ Done |
| `AGENTS.md` files (root, backend, frontend) updated | ✅ Done |

---

### Phase 1 — Stack Decision & Initial Scaffold ✅ Complete

**Goal:** Decide on frontend/backend/infra stack and scaffold the project structure.

| Item | Status |
| --- | --- |
| Stack decided and documented in `architecture.md` | ✅ Done |
| Backend boilerplate — Express + TypeScript, `tsx` dev server, port 3001 | ✅ Done |
| Frontend boilerplate — React 18 + Vite + TypeScript, port 5173 | ✅ Done |
| Test runners configured — Jest + supertest (backend), Vitest + testing-library (frontend) | ✅ Done |
| `architecture.md` updated with Mermaid diagram, API contract, question table | ✅ Done |

---

### Phase 2 — Questionnaire Feature ✅ Complete

**Goal:** 5-question multiple-choice form that captures user charity preferences and POSTs them to the backend for LLM matching (integration pending).

| Item | Status |
| --- | --- |
| `POST /api/questionnaire/submit` — validates 5 answers, returns `submissionId` | ✅ Done |
| Backend tests (Jest + supertest) — 6/6 passing | ✅ Done |
| `Questionnaire` React component — step-by-step, Back/Next/Submit, progress bar | ✅ Done |
| Frontend tests (Vitest + testing-library) — 11/11 passing | ✅ Done |
| Vite proxy `/api` → `localhost:3001` | ✅ Done |
| `userId` field reserved on submit payload for auth integration | ✅ Done |

**TDD note:** Both backend and frontend followed full Red → Green → Refactor cycle.

---

### Phase 3 — Auth Integration 🔲 Not Started (separate team feature)

**Goal:** Wire the auth service (built by another team member) into the questionnaire flow. Pass authenticated `userId` with the submission.

| Item | Status |
| --- | --- |
| Auth service API contract agreed | 🔲 Pending |
| `userId` injected from auth context into questionnaire submit call | 🔲 Pending |
| Backend validates/forwards `userId` | 🔲 Pending |

---

### Phase 4 — LLM Matching Integration 🔲 Not Started (separate team feature)

**Goal:** Forward questionnaire answers from `POST /api/questionnaire/submit` to the LLM charity-matching service and return results to the frontend.

| Item | Status |
| --- | --- |
| LLM service API contract agreed | 🔲 Pending |
| Backend forwards answers to LLM service | 🔲 Pending |
| Frontend displays charity recommendations | 🔲 Pending |

---

_[Add further phases here as features are scoped during the hackathon.]_
