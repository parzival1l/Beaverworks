# Botpress ADK — Cursor Skill

You are assisting with a **Botpress ADK** project. The ADK is a TypeScript framework and CLI for building AI agents that deploy to Botpress Cloud. Botpress handles hosting, scaling, and channel delivery; the developer writes conversations, workflows, tools, actions, and triggers as code.

Authoritative docs index: [https://botpress.com/docs/llms.txt](https://botpress.com/docs/llms.txt) Per-page markdown: append `.md` to any docs URL (e.g. [https://botpress.com/docs/adk/conversations/tools.md](https://botpress.com/docs/adk/conversations/tools.md)).

## Operating principles

1. **Verify before inventing.** ADK APIs change. If you are unsure of a signature, fetch the relevant `.md` doc page rather than guessing. Common pages: `adk/quickstart`, `adk/cli-reference`, `adk/conversations/setup`, `adk/conversations/tools`, `adk/conversations/ai-execution`, `adk/workflows/create`, `adk/external/actions`, `adk/external/triggers`, `adk/data/tables`, `adk/data/knowledge`, `adk/zai/overview`, `adk/testing/evals`.  
2. **Prefer ADK primitives over raw API calls.** Use `Conversation`, `Autonomous.Tool`, `Workflow`, `Action`, `Trigger`, `Table`, `Knowledge`, and `adk.zai` rather than calling Botpress REST APIs directly from inside the bot runtime.  
3. **One primitive per file.** The ADK auto-discovers primitives by file. Do not register manually.  
4. **Use Zod for all schemas.** `input`, `output`, conversation `state`, table columns, and Zai extraction targets are all Zod.  
5. **Type-safe channels.** Avoid `channel: "*"` in production handlers. Pin to a specific channel (e.g. `webchat.channel`, `slack.channel`) so message payloads are typed.  
6. **Run locally first.** `adk dev` runs hot reload on port 3000 (bot) and 3001 (console). `adk chat` is the loopback test client. Ask the user to run these before deploying.  
7. **Never deploy without explicit confirmation.** `adk deploy` ships to Botpress Cloud. Surface the command, do not run it autonomously.

## Project shape

my-agent/

├── agent.config.ts        \# integrations, default models, secrets, bot/user state schemas

├── agent.json             \# workspace \+ bot link (committed)

├── agent.local.json       \# per-dev override (gitignored, written via \`adk link \--local\`)

├── package.json

├── tsconfig.json

└── src/

    ├── conversations/     \# message handlers per channel

    ├── workflows/         \# long-running background processes

    ├── tools/             \# functions the LLM can call

    ├── actions/           \# reusable functions callable from anywhere

    ├── triggers/          \# react to integration or custom events

    ├── tables/            \# structured storage definitions

    ├── knowledge/         \# RAG sources

    └── components/        \# custom React UI for webchat

## CLI cheat sheet

| Command | Use |
| :---- | :---- |
| `adk init [name]` | Scaffold a new project (`--template hello-world`, `--list-templates`) |
| `adk dev` | Hot-reload dev server. Bot on `:3000`, console on `:3001` |
| `adk chat` | Interactive REPL against the running dev server |
| `adk chat --single "msg"` | One-shot message (good for scripted checks) |
| `adk add <integration>` | Install integration, e.g. `adk add webchat`, `adk add slack@latest` |
| `adk search <query>` | Search Botpress Hub |
| `adk info <integration> --actions` | Inspect actions/channels/events |
| `adk secret:set KEY value` | Set a secret (add `--prod` for production) |
| `adk config:set KEY value` | Set a config value |
| `adk evals [name]` | Run eval suites (`--tag smoke`, `--type regression`) |
| `adk logs [tokens] [--follow]` | Query dev logs. Tokens: `error`, `since=1h`, `limit=10` |
| `adk traces [tokens] [--follow]` | Query traces. Tokens: `workflow=foo`, `trace=<id>`, `--include-llm` |
| `adk workflows run <name> '{...}' --wait` | Trigger a workflow against the dev server |
| `adk run scripts/x.ts` | Run a TS script with the full ADK runtime |
| `adk build` | Production build into `.adk/bot/.botpress/dist` |
| `adk deploy` | Ship to Botpress Cloud (requires `adk login`) |
| `adk mcp:init --tool cursor` | Generate `.cursor/mcp.json` so Cursor can talk to the running dev server |

Source: [https://botpress.com/docs/adk/cli-reference.md](https://botpress.com/docs/adk/cli-reference.md)

## Conversations

A conversation is a message handler bound to one or more channels. File: `src/conversations/<name>.ts`.

import { Conversation, z } from "@botpress/runtime"

import getWeather from "../tools/getWeather"

export default new Conversation({

  channel: "webchat.channel",                  // pin for type safety

  events: \["webchat:conversationStarted"\],     // optional event subscriptions

  state: z.object({                            // optional per-conversation state

    messageCount: z.number().default(0),

  }),

  handler: async (props) \=\> {

    if (props.type \=== "event" && props.event.type \=== "webchat:conversationStarted") {

      await props.conversation.send({ type: "text", payload: { text: "Hi\! How can I help?" } })

      return

    }

    if (props.type \!== "message") return       // ignore lifecycle types unless needed

    props.state.messageCount \+= 1

    await props.execute({

      instructions: "You are a helpful assistant.",

      tools: \[getWeather\],

    })

  },

})

Handler `props.type` values: `message`, `event`, `workflow_request`, `workflow_callback`, `workflow_notify`, `nudge`, `expire`. Most handlers only branch on `message` and optionally `event`.

Common params on every handler: `conversation`, `state`, `client`, `execute`, `chat`, `channel`, plus `message` (when `type === "message"`) or `event` (when `type === "event"`).

If multiple conversation files match the same channel, the most specific match wins (`webchat.channel` beats `*`).

Source: [https://botpress.com/docs/adk/conversations/setup.md](https://botpress.com/docs/adk/conversations/setup.md)

## Tools (LLM-callable functions)

Tools are functions the model decides to call inside `execute()`. File: `src/tools/<name>.ts`.

import { Autonomous, z } from "@botpress/runtime"

export default new Autonomous.Tool({

  name: "lookupOrder",

  description:

    "Look up a customer's order by ID. Use when the user asks about order status, tracking, or order details.",

  input: z.object({

    orderId: z.string().describe("Order ID, e.g. 'ord\_abc123'"),

  }),

  output: z.object({

    status: z.string(),

    total: z.number(),

  }),

  handler: async ({ orderId }) \=\> {

    const order \= await db.findOrder(orderId)

    return { status: order.status, total: order.total }

  },

})

Rules of thumb:

- Always use `.describe()` on input fields. The model only sees descriptions, not variable names.  
- Descriptions should state both **what** and **when to use**.  
- Throw `new Autonomous.ThinkSignal("short reason", "guidance for the model")` when a tool returns no useful result and you want the model to retry differently.  
- Convert an action to a tool via `actions.myAction.asTool()`; convert a workflow via `myWorkflow.asTool()`.

Inline tools (defined inside a handler) are valid for one-off cases tied to a single conversation.

Source: [https://botpress.com/docs/adk/conversations/tools.md](https://botpress.com/docs/adk/conversations/tools.md)

## Workflows

Workflows are long-running background processes. They run independently of any conversation and persist across steps. Use them for: onboarding flows, scheduled tasks, multi-step automations, anything that may pause and resume.

import { Workflow, z } from "@botpress/runtime"

export default new Workflow({

  name: "onboarding",

  input: z.object({ userId: z.string() }),

  handler: async ({ input, step, request, notify }) \=\> {

    const profile \= await step("fetch-profile", async () \=\> {

      return await fetchProfile(input.userId)

    })

    const answer \= await request({

      conversationId: profile.conversationId,

      message: "What's your company size?",

      schema: z.enum(\["1-10", "11-50", "51+"\]),

    })

    await notify({

      conversationId: profile.conversationId,

      message: \`Thanks\! Logged you as ${answer}.\`,

    })

  },

})

Run from CLI: `adk workflows run onboarding '{"userId":"u_1"}' --wait`.

Source: [https://botpress.com/docs/adk/workflows/create.md](https://botpress.com/docs/adk/workflows/create.md), [https://botpress.com/docs/adk/workflows/steps.md](https://botpress.com/docs/adk/workflows/steps.md), [https://botpress.com/docs/adk/workflows/request-notify.md](https://botpress.com/docs/adk/workflows/request-notify.md)

## Actions

Actions are reusable functions callable from conversations, workflows, other actions, tools, or external systems. Unlike tools, actions are not LLM-decided. File: `src/actions/<name>.ts`.

import { Action, z } from "@botpress/runtime"

export default new Action({

  name: "calculateTotal",

  input: z.object({ items: z.array(z.object({ price: z.number(), qty: z.number() })) }),

  output: z.object({ total: z.number() }),

  handler: async ({ items }) \=\> ({

    total: items.reduce((sum, i) \=\> sum \+ i.price \* i.qty, 0),

  }),

})

Source: [https://botpress.com/docs/adk/external/actions.md](https://botpress.com/docs/adk/external/actions.md)

## Triggers

Triggers react to integration events or custom events. File: `src/triggers/<name>.ts`. Use for webhook-style "when X happens, do Y" automations that are not part of a conversation.

Source: [https://botpress.com/docs/adk/external/triggers.md](https://botpress.com/docs/adk/external/triggers.md)

## Tables (structured storage)

import { Table, z } from "@botpress/runtime"

export const Orders \= new Table({

  name: "Orders",

  schema: z.object({

    orderId: z.string(),

    customerId: z.string(),

    status: z.enum(\["pending", "shipped", "delivered"\]),

    total: z.number(),

  }),

})

// Read/write inside a handler:

await Orders.create({ orderId: "ord\_1", customerId: "c\_1", status: "pending", total: 42 })

const rows \= await Orders.find({ where: { customerId: "c\_1" } })

Source: [https://botpress.com/docs/adk/data/tables.md](https://botpress.com/docs/adk/data/tables.md)

## Knowledge bases

import { Knowledge } from "@botpress/runtime"

export default new Knowledge({

  name: "product-docs",

  sources: \[

    { type: "url", url: "https://docs.example.com" },

    { type: "file", path: "./kb/manual.pdf" },

  \],

})

Sync to the bot: `adk kb sync --dev` (or `--prod`). Use `--dry-run` first.

Source: [https://botpress.com/docs/adk/data/knowledge.md](https://botpress.com/docs/adk/data/knowledge.md)

## Zai (typed LLM utilities)

`adk.zai` wraps common LLM operations with Zod-typed inputs/outputs. Prefer Zai over hand-rolled prompts whenever possible.

import { adk, z } from "@botpress/runtime"

const product \= await adk.zai.extract(

  "Blueberries are $3.99 and are in stock.",

  z.object({ name: z.string(), price: z.number(), inStock: z.boolean() })

)

const isUrgent \= await adk.zai.check("My server is down\!", "Is the user reporting an outage?")

const summary \= await adk.zai.summarize(longText, { maxLength: 200 })

const items \= await adk.zai.filter(reviews, "negative sentiment")

Methods: `extract`, `check`, `label`, `filter`, `sort`, `rate`, `group`, `text`, `rewrite`, `summarize`, `answer`, `patch`.

Model is set via `defaultModels.zai` in `agent.config.ts`.

Source: [https://botpress.com/docs/adk/zai/overview.md](https://botpress.com/docs/adk/zai/overview.md)

## Configuration (agent.config.ts)

import { defineConfig, z } from "@botpress/runtime"

export default defineConfig({

  integrations: {

    webchat: { version: "latest" },

    slack: { version: "latest" },

  },

  defaultModels: {

    autonomous: "cerebras:gpt-oss-120b",

    zai: "cerebras:gpt-oss-120b",

  },

  secrets: \["STRIPE\_API\_KEY"\],

  state: {

    bot: z.object({ /\* shared bot-wide state \*/ }),

    user: z.object({ /\* per-user state \*/ }),

  },

})

Set secrets at runtime: `adk secret:set STRIPE_API_KEY sk_test_...` (add `--prod` for production). List available models: `adk models`.

Source: [https://botpress.com/docs/adk/setup/configuration.md](https://botpress.com/docs/adk/setup/configuration.md), [https://botpress.com/docs/adk/setup/environment.md](https://botpress.com/docs/adk/setup/environment.md)

## Evals (automated tests)

Eval files live alongside the code they test (e.g. `src/conversations/support.eval.ts`). Run with `adk evals`. Tag suites for selective runs (`adk evals --tag smoke`).

Source: [https://botpress.com/docs/adk/testing/evals.md](https://botpress.com/docs/adk/testing/evals.md)

## Debug loop

When something is broken:

1. `adk logs error since=10m` — recent errors only.  
2. `adk traces error --include-llm` — what the model saw and decided.  
3. `adk traces conversation=<id>` — drill into a specific run.  
4. `adk traces trace=<id> --include-llm` — full LLM context for one trace.  
5. Add a `console.log` in the handler. `adk dev` hot-reloads.

The dev console at `http://localhost:3001` shows agent steps visually, which is usually faster than the CLI for tool-call debugging.

Source: [https://botpress.com/docs/adk/testing/debugging.md](https://botpress.com/docs/adk/testing/debugging.md), [https://botpress.com/docs/adk/testing/agent-steps.md](https://botpress.com/docs/adk/testing/agent-steps.md)

## Common patterns

**Multi-channel agent.** One conversation file per channel under `src/conversations/`. Pin each to a specific channel for type safety. Share logic via actions (`src/actions/`).

**Adding an integration.**

1. `adk search <name>` to confirm it exists on Botpress Hub.  
2. `adk add <name>` to install. Updates `agent.config.ts`.  
3. `adk info <name> --actions` to see what's available.  
4. `adk dev` regenerates types so `channel: "<name>.channel"` autocompletes.  
5. Set any required secrets/config: `adk config` walks you through interactively.

**Tool that calls an external API.** Put it in `src/tools/`, validate input with Zod, throw `ThinkSignal` on empty/error states so the model can recover instead of dead-ending the conversation.

**Long task triggered from chat.** Make a workflow in `src/workflows/`, expose it to the LLM via `myWorkflow.asTool()` inside the conversation handler, then let the model decide when to start it.

## Anti-patterns to flag

- Reaching for `fetch('https://api.botpress.cloud/...')` inside the bot. Use the injected `client` or ADK primitives.  
- Hardcoding secrets. Always use `adk secret:set` and read via the runtime config.  
- One mega-conversation handling every channel with `channel: "*"` plus a switch. Split per channel for types.  
- Defining tools inside loops or per-message. Define them at module scope (or use inline tools intentionally for one-off cases).  
- Skipping `.describe()` on Zod inputs to tools. The model will guess wrong.  
- Calling `adk deploy` automatically after a code change. Always require explicit user confirmation.

## When you don't know something

Fetch the relevant doc page. The full index is at [https://botpress.com/docs/llms.txt](https://botpress.com/docs/llms.txt) and every page is available as `.md`. Cite the URL in your response so the user can verify.  
