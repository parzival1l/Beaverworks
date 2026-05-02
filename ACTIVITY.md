# Activity Log

> Session-level changelog for Beaverworks. See [feature-process.md](./feature-process.md) for phase-level status.

---

## 2026-05-02 13:46 ET — Tax optimizer: over-optimal UI + version `frontend/src/lib`

- **Files:** `.gitignore`, `frontend/src/lib/taxCalculator.ts`, `frontend/src/components/tax/TaxOptimizer.tsx`, `frontend/src/__tests__/taxCalculator.test.ts`, `frontend/src/pages/PaymentPage.tsx`
- **What:** Quebec credit math + `getDonationGap` / uncapped score; three-state dashboard widget (below / optimal / above); fix root `lib/` ignore so `frontend/src/lib` is not gitignored.
- **Why:** Ship tax demo UX and ensure `taxCalculator.ts` is tracked.
- **Commands:** `git push origin cursor/frontend-charity-platform` (commit `27f69e5`)

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
