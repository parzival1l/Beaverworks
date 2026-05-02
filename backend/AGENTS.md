# Agent Instructions (Backend)

Express JSON API on port **3002**. Bridges the frontend to the Botpress ADK agent and serves the questionnaire endpoint.

## Module map

```
backend/src/
├── app.ts                # Express wiring (cors, json, /api/* mounts) — keep thin
├── index.ts              # Listener; reads PORT (default 3002)
├── routes/
│   ├── questionnaire.ts  # POST /api/questionnaire/submit  (in-memory echo + uuid)
│   └── search.ts         # POST /api/search                 (validate → bot client → hydrate)
├── bot/                  # ADK CLI bridge — see backend/src/bot/AGENTS.md
├── data/charities.ts     # loadCharityMetadata() reads agent/data/charities.metadata.json
├── parsers/
│   └── cra-charities/    # CRA TSV → seed JSON — see its own AGENTS.md
└── types/{questionnaire,search}.ts
```

## Stack & test runner

- TypeScript, Express 4, `tsx watch` for dev (`npm run dev`).
- **Jest + supertest** (`npm test`). Tests in `backend/tests/`.
- Type-check: `npx tsc --noEmit`.

## Contracts (mirrored in `docs/architecture.md` — keep in sync)

- `POST /api/questionnaire/submit` — body `{ answers: { causes, beneficiaries, geography, givingStyle }, userId? }`. Required keys come from `REQUIRED_QUESTION_IDS` in `types/questionnaire.ts`. Returns `{ success, submissionId, answers }`.
- `POST /api/search` — body adds non-empty `prompt`. Validates → `getBotClient().runSearch(...)` → hydrates each `charityId` via `loadCharityMetadata()` → returns `{ queryId, results: [{ charity, score, rationale }] }`. Errors: 400 (validation), 502 (bot client throw).

## TDD (mandatory)

- Red → Green → Refactor for any new behaviour.
- Tests in `backend/tests/`; one file per route or parser concern (`questionnaire.test.ts`, `search.test.ts`, `ingest.test.ts`, `parsers/cra-charities/`).
- Tests that touch `/api/search` **must** inject a fake bot client via `setBotClient(...)` from `bot/client.ts` — never spawn the real `adk` CLI in tests.

## Expectations

- Keep route handlers thin; business logic in pure functions/modules in `parsers/`, `data/`, `bot/`.
- Preserve API behaviour unless the task explicitly changes it. Any contract change → update `docs/architecture.md` in the same commit.
- Run `npm test` (and `npx tsc --noEmit` if types changed) before finishing a backend task.

## Anti-patterns

- Putting workflow logic inside `routes/*.ts`. Routes only validate, call the bot client, and hydrate. New logic → new module.
- Calling Botpress over raw HTTP / fetch from Express. The bot client shells out to `adk workflows run` for a reason (see `backend/src/bot/AGENTS.md`).
- Reading `agent/data/charities.metadata.json` directly from a route. Use `loadCharityMetadata()` so caching/lookup stays in one place.
- Hard-coded ports (use `process.env.PORT`); committing `.env` or `OPENAI_API_KEY`.
- Broadening API responses without bumping `docs/architecture.md` API Contracts and the frontend types in `frontend/src/types/`.
