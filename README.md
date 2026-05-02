# Altru

**Altru** is for people who want giving to feel deliberate, not overwhelming—especially if you’re donating in Canada or care about what’s happening closer to home in Québec. You share what matters to you; we help you discover charities that fit your values and how you like to give. Rich profiles and a donation tax calculator let you weigh options with both heart and practicality. The details you see are grounded in **public registries and open records**, so you can cross-check names, status, and missions yourself—trust starts with transparency.

Altru is the monorepo behind the platform—the Vite/React app, Express API, and Botpress ADK agent live in `frontend/`, `backend/`, and `agent/` respectively for anyone working in the codebase.

![Altru app preview](./docs/assets/altru-app-preview.png)

## Running locally after clone

Requirements: **Node.js 20+** and npm. After cloning, install dependencies for all three apps in one step from the repo root:

```bash
npm run install:all
```

That runs `npm install` inside `frontend/`, then `backend/`, then `agent/` (each keeps its own `package-lock.json` under that folder).

If you do not want a root `package.json` script, the same idea in one shell line is `(cd frontend && npm install) && (cd backend && npm install) && (cd agent && npm install)`. To install only apps you care about—for example skipping `agent/` when you will not run search—you can still `cd` into those folders individually.

Charity search needs the ADK workflow running and **`OPENAI_API_KEY`** set for the agent (`adk secret:set`; details in [`agent/README.md`](agent/README.md) and [`docs/architecture.md`](docs/architecture.md)).

### One command: [`scripts/launch-dev.sh`](scripts/launch-dev.sh)

From the repo root, [`scripts/launch-dev.sh`](scripts/launch-dev.sh) starts backend (:3002) and frontend (:5173), opens the app in your browser, and streams logs; **Ctrl+C** stops everything. Flags (`--with-agent`, `--no-open`, `--playwright`) and port layout are documented in the script header and via:

```bash
bash scripts/launch-dev.sh --help
```

Typical flows:

```bash
bash scripts/launch-dev.sh                 # frontend + backend (no ADK)
bash scripts/launch-dev.sh --with-agent   # + Botpress ADK (bot :3000, console :3001); needs `adk` on PATH
```

For deeper walkthroughs and tests, see [docs/local-testing.md](docs/local-testing.md).  
Phase tracker: [docs/feature-process.md](docs/feature-process.md).  
Botpress ADK reference (Markdown companion to `.cursor/rules/botpress-adk.mdc`): [docs/botpress-adk.md](docs/botpress-adk.md).

Optional: regenerate agent KB artifacts from the curated seed:

```bash
npx tsx scripts/ingest-charities.ts
```

More detail on ports and APIs: [docs/architecture.md](docs/architecture.md).