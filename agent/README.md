# Altru Agent (Botpress ADK)

This directory hosts the Botpress ADK agent that owns RAG over the Canadian charity corpus. The Express backend (`../backend/`) proxies `POST /api/search` to the `searchCharities` workflow defined here.

## Layout

```
agent/
├── agent.config.ts         # webchat integration, OpenAI as default model, OPENAI_API_KEY secret
├── package.json            # adk + runtime deps; `npm run ingest` regenerates the KB corpus
├── src/
│   ├── knowledge/charities.ts          # Knowledge base over data/charities/*.md
│   ├── workflows/searchCharities.ts    # input { answers, prompt } -> ranked results + LLM rationale
│   ├── conversations/webchat.ts        # webchat handler, exposes searchCharities as a tool
│   └── types/search.ts                 # Zod schemas shared by workflow input/output
└── data/
    ├── charities/<id>.md               # one document per charity (KB source, generated)
    ├── charities.indexed.json          # full text snapshot (generated)
    └── charities.metadata.json         # id -> CharityRecord lookup (generated)
```

## Setup

```bash
# 1. Install ADK CLI globally if you don't have it
npm i -g @botpress/adk

# 2. Install agent deps
cd agent && npm install

# 3. Generate the charity corpus (reads ../data/charities.seed.json or ../data/charities.csv)
npm run ingest

# 4. Sync OpenAI key from backend/.env into the ADK secret store
#    (reads OPENAI_API_KEY from ../backend/.env and runs `adk secret:set`)
npm run secrets:sync

# 5. Link this directory to a Botpress workspace + bot (creates agent.local.json)
adk link --local

# 6. Start dev server (bot on :3000, console on :3001)
#    `npm run dev` re-runs secrets:sync first, so any .env edits are picked up.
npm run dev

# 7. Sync the KB so passages are embedded in the dev bot
adk kb sync --dev
```

## Smoke test

```bash
# CLI invocation of the workflow Express will proxy to:
adk workflows run searchCharities '{
  "answers": {
    "causes": "Environment & Climate",
    "beneficiaries": "Children & Youth",
    "geography": "Quebec",
    "givingStyle": "One-time donation"
  },
  "prompt": "I want to fund tree planting near schools in Montreal"
}' --wait --format json
```

## Express -> agent bridge

The Express `bot/client.ts` shells out to `adk workflows run searchCharities ... --wait --format json` (path to the `adk` CLI is configurable via `ADK_BIN`, project root via `ADK_AGENT_DIR`). For production deploys, swap that client for an HTTP integration once the agent is hosted on Botpress Cloud.

## Re-ingest

Whenever you update `../data/charities.seed.json` or drop a fresh `../data/charities.csv`:

```bash
npm run ingest
adk kb sync --dev   # re-index in the running dev bot
```

## Don't deploy automatically

`adk deploy` ships to Botpress Cloud. Surface the command in PRs; don't run it from automation without explicit confirmation.
