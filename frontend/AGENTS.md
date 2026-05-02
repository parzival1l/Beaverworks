# Agent Instructions (Frontend)

Vite 5 + React 18 + TypeScript on port **5173**. Tailwind v3 + Framer Motion. Vite dev server proxies `/api` → `http://localhost:3002` (see `vite.config.ts`).

## Module map

```
frontend/src/
├── pages/                # Route screens — Login, Questionnaire, Dashboard, CharityDetail, Payment
├── components/
│   ├── charity/          # CharityCard etc.
│   ├── tax/              # TaxOptimizer
│   ├── ui/               # Generic primitives
│   └── Questionnaire.tsx
├── api/
│   ├── questionnaire.ts  # POST /api/questionnaire/submit (override: VITE_QUESTIONNAIRE_SUBMIT_URL)
│   └── search.ts         # POST /api/search                (override: VITE_SEARCH_URL)
├── lib/taxCalculator.ts  # Pure utility — Quebec/federal tax math
├── data/mockCharities.ts # Fallback dataset (used when /api is down)
├── types/{charity,questionnaire,search}.ts
├── routerFuture.ts       # React Router v6 future flags
└── __tests__/            # Vitest + @testing-library/react
```

## Stack & test runner

- **Vitest + @testing-library/react** (`npm test`). Setup: `setupTests.ts`, `test-setup.ts`, `vitest.config.ts`.
- Routing: React Router v6 (with future flags from `routerFuture.ts`).
- Auth: **demo only** — `localStorage.altru_authed` gates `/questionnaire`, `/dashboard`, `/charity/:id`, `/payment/:id`. Not production auth.

## TDD (mandatory)

- Red → Green → Refactor for any new behaviour.
- Tests in `frontend/src/__tests__/` or co-located `.test.tsx`.
- Mock network at the `api/` boundary (Vitest `vi.mock('../api/search')`), not `fetch` directly.

## Expectations

- All HTTP goes through `frontend/src/api/*.ts` — they read `VITE_*_URL` overrides and centralize error handling.
- Preserve accessibility (keyboard, focus, ARIA) and existing component patterns / Tailwind tokens.
- Run `npm test` before finishing. If touching `vite.config.ts`, also run a quick `npm run build` to catch tooling regressions.

## Anti-patterns

- Inline `fetch('/api/...')` in pages/components. Add or extend a client in `api/`.
- Putting business logic inside route page components. Extract pure helpers into `lib/` (see `taxCalculator.ts`) so they're unit-testable without RTL.
- Editing `data/mockCharities.ts` to fix a backend bug. The fallback exists for dev resilience; real fixes belong in the seed JSON / ingest pipeline.
- Reading `localStorage.altru_authed` ad-hoc across components. Centralize the auth check; treat the flag as a demo placeholder for real auth later.
- Hardcoding the backend URL. Either rely on the Vite proxy (dev) or the `VITE_*_URL` env vars (other deploys).
- Skipping `routerFuture.ts` flags when adding new routes — they avoid v7 deprecation warnings.
