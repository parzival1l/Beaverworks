# Agent Instructions (Express ↔ Botpress Bridge)

`client.ts` is the only place Express talks to the Botpress ADK agent. Everything else (routes, tests) goes through `getBotClient()` / `setBotClient()`.

## How it works

```
Express route  →  getBotClient().runSearch(req)
                       │
                       ▼
                createCliBotClient()   (default singleton)
                       │
                       ▼
            execFile('adk', [
              'workflows', 'run', 'searchCharities',
              JSON.stringify(req),
              '--wait', '--timeout', '30s', '--format', 'json',
            ], { cwd: agent/ })
                       │
                       ▼
              JSON.parse(stdout)
                       │
                       ▼  unwrap envelope: { workflowId, status, output, ... } OR bare output
            BotSearchResponse  (validated: results must be an Array)
```

**Why shell out?** Botpress workflows are not exposed over a public REST endpoint by `adk dev`. The documented programmatic entry point is the `adk workflows run` CLI, which talks to the local dev server (or the deployed bot via `--prod`).

## Env overrides

| Var            | Default                                   | Use                                            |
| -------------- | ----------------------------------------- | ---------------------------------------------- |
| `ADK_BIN`      | `adk` (on `PATH`)                         | Pin to a vendored binary or alternate version. |
| `ADK_AGENT_DIR`| `<repo>/agent` (resolved from `__dirname`)| Point at a different agent workspace.          |
| `ADK_TIMEOUT`  | `30s`                                     | Per-workflow-invocation timeout (string form). |

Per-call overrides via `runSearch(req, { bin, cwd, timeout })` take precedence over env vars.

## Dependency on the agent process

`/api/search` will return **502 `searchCharities workflow failed: ...`** when:

- `adk` is not on `PATH` (or `ADK_BIN` points nowhere).
- The agent dev server is not running (no listener on `:3000`).
- The workflow times out (default 30s) — usually means the LLM call inside `adk.zai.text` stalled or `OPENAI_API_KEY` is missing/invalid.
- The CLI returns a payload that isn't `{ results: [...] }` after envelope unwrapping.

Local dev: `cd agent && npm run dev` (or `bash scripts/launch-dev.sh --with-agent`).

## Testing pattern

Tests **must** inject a fake — never spawn the real CLI:

```ts
import { setBotClient } from '../src/bot/client'

setBotClient({
  async runSearch(req) {
    return {
      queryId: 'test-q',
      results: [{ charityId: 'bn-...', organizationName: 'X', score: 0.9, rationale: 'because' }],
    }
  },
})
```

This is exactly what `scripts/test-rag-pathway.sh` does in STUB mode and what `backend/tests/search.test.ts` relies on.

## Anti-patterns

- Calling `fetch('http://localhost:3000/...')` from Express to invoke the workflow. The dev server doesn't expose workflows that way; use the CLI bridge.
- Tests that don't call `setBotClient(...)` — they will spawn `adk` and fail in CI (and pollute local state).
- Relying on the bare-output shape only. Always unwrap `parsed.output ?? parsed` and validate `Array.isArray(results)` (newer ADK versions wrap output in an envelope).
- Increasing `ADK_TIMEOUT` to mask a real LLM/secret problem. If it stalls at 30s, fix the upstream (secrets sync, model availability) instead.
- Doing record hydration in here. This module returns the raw `BotSearchResponse` (`charityId` only); Express hydrates via `loadCharityMetadata()` in the route handler.
- Adding state inside `createCliBotClient()` — the singleton must remain trivially replaceable via `setBotClient(...)`.
