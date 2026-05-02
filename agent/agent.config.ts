import { defineConfig, z } from "@botpress/runtime";

/**
 * Altru / Beaverworks agent. Webchat-only at this stage. RAG corpus is the
 * Canadian charity dataset under `agent/data/charities/` (regenerated via
 * `npm run ingest`). The `searchCharities` workflow wraps retrieval +
 * per-result rationale and is the entry point Express proxies to.
 */
export default defineConfig({
  dependencies: {
    integrations: {
      webchat: "webchat@0.3.0",
    },
  },
  defaultModels: {
    autonomous: "openai:gpt-4o-mini",
    zai: "openai:gpt-4o-mini",
  },
  secrets: {
    OPENAI_API_KEY: {
      description:
        "OpenAI API key for adk.zai + webchat LLM calls. Synced from backend/.env via `npm run secrets:sync`.",
    },
  },
  state: {
    bot: z.object({}),
    user: z.object({}),
  },
});
