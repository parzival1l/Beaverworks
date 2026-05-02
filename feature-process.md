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
| `architecture.md` (SSOT) | ✅ Done |
| `feature-process.md` (this file) | ✅ Done |
| `ACTIVITY.md` | ✅ Done |
| `AGENTS.md` files (root, backend, frontend) updated | ✅ Done |

---

### Phase 1 — Stack Decision & Initial Scaffold 🟨 In progress

**Goal:** Decide on frontend/backend/infra stack and scaffold the project structure.

| Item | Status |
| --- | --- |
| Frontend stack confirmed and documented in `architecture.md` | ✅ Done |
| Frontend boilerplate (Vite 5, React 18, routes, pages, tax calculator) | ✅ Done |
| Frontend test runner (Vitest + Testing Library) | ✅ Done |
| Stack decided for backend/infra | 🔲 Pending |
| Backend boilerplate (dependencies, entry point) | 🔲 Pending |
| `architecture.md` Mermaid diagram reflects current flows | ✅ Done |

---

### Phase 2 — Backend integration 🔲 Not started

**Goal:** Replace questionnaire stub and mock data with live API when backend is ready.

| Item | Status |
| --- | --- |
| `POST /api/questionnaire` (or equivalent) + wire `frontend/src/api/questionnaire.ts` | 🔲 Pending |
| Charity listing/detail from API vs `mockCharities.ts` | 🔲 Pending |
| Production auth (if needed) vs demo `localStorage` | 🔲 Pending |

---

_[Add further phases here as features are scoped during the hackathon.]_
