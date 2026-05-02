# Activity Log

> Session-level changelog for Beaverworks. See [feature-process.md](./feature-process.md) for phase-level status.

---

## 2026-05-02 13:06 ET — Questionnaire feature: backend API + frontend form (TDD Red→Green)

- **Files:**
  - `backend/package.json`, `backend/tsconfig.json`, `backend/jest.config.js`
  - `backend/src/app.ts`, `backend/src/index.ts`
  - `backend/src/routes/questionnaire.ts`
  - `backend/src/types/questionnaire.ts`
  - `backend/tests/questionnaire.test.ts`
  - `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.node.json`, `frontend/index.html`
  - `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/App.css`
  - `frontend/src/test-setup.ts`
  - `frontend/src/types/questionnaire.ts`
  - `frontend/src/components/Questionnaire.tsx`, `frontend/src/components/Questionnaire.css`
  - `frontend/src/__tests__/Questionnaire.test.tsx`
  - `architecture.md`
- **What:**
  - **Backend (TypeScript + Express):** `POST /api/questionnaire/submit` — validates all 5 answers present, returns `{ success, submissionId, answers }`. UUID per submission for future LLM correlation. `userId` field reserved for auth integration. App exported separately from server entry point so supertest can import it cleanly.
  - **Frontend (React + Vite):** Step-by-step questionnaire card. 5 multiple-choice questions covering cause area, geographic scope, donation mechanism, charity selection criteria, and involvement level. Progress bar, Back/Next navigation, disabled Next until answer selected, Submit on final step. Proxies `/api` to backend via Vite config. Success/error/loading states in `App.tsx`.
  - **TDD cycle followed:** Backend — wrote 6 failing tests (RED: all 404 from stub), implemented route (GREEN: 6/6 pass). Frontend — wrote 11 failing tests (RED: all fail from stub component), implemented `Questionnaire` component (GREEN: 11/11 pass).
  - `architecture.md` updated with stack, API contract, question table, project structure, and run/test instructions.
- **Why:** POC questionnaire feature for the charity-matching app. Answers payload is structured to be forwarded to the LLM matching service (separate feature) once that integration is ready.
- **Commands:** `cd backend && npm test` (6/6 ✓), `cd frontend && npm test` (11/11 ✓)

---

## 2026-05-02 12:31 ET — Project scaffolding: Cursor rules, architecture, activity log, feature process

- **Files:** `.cursor/rules/core.mdc`, `.cursor/rules/git.mdc`, `architecture.md`, `ACTIVITY.md`, `feature-process.md`, `AGENTS.md`, `backend/AGENTS.md`, `frontend/AGENTS.md`
- **What:** Established best-practice scaffolding matching the HailBairApp and food-chatbot project patterns: TDD-enforcing Cursor rules (`core.mdc` + `git.mdc`), architecture SSOT (`architecture.md`), session activity log (`ACTIVITY.md`), phase-level feature tracker (`feature-process.md`), and updated AGENTS.md files at root, backend, and frontend.
- **Why:** Hackathon project kick-off — applying consistent Red → Green → Refactor TDD workflow, branch-first git discipline, and architecture-as-SSOT practices from day one.
- **Commands:** none
