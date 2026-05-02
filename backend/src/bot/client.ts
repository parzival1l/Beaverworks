import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { resolve } from 'node:path'
import type {
  BotSearchResponse,
  SearchRequest,
} from '../types/search'

const execFileP = promisify(execFile)

/**
 * Bridge from Express to the Botpress ADK agent. Botpress workflows are not
 * exposed over a public REST endpoint by `adk dev`; the documented programmatic
 * entry point is the `adk workflows run` CLI, which talks to the local dev
 * server (or the deployed bot via `--prod`). We shell out and parse JSON.
 *
 * Override via env when needed:
 *   ADK_BIN         path to the adk binary (default: 'adk' on PATH)
 *   ADK_AGENT_DIR   absolute path to the agent workspace (default: ../agent)
 *   ADK_TIMEOUT     workflow run timeout, e.g. '30s' (default: 30s)
 */
export interface RunOptions {
  bin?: string
  cwd?: string
  timeout?: string
}

export interface BotClient {
  runSearch(req: SearchRequest, opts?: RunOptions): Promise<BotSearchResponse>
}

function defaultAgentDir(): string {
  const env = process.env.ADK_AGENT_DIR
  if (env) return env
  return resolve(__dirname, '..', '..', '..', 'agent')
}

export function createCliBotClient(): BotClient {
  return {
    async runSearch(req, opts = {}) {
      const bin = opts.bin ?? process.env.ADK_BIN ?? 'adk'
      const cwd = opts.cwd ?? defaultAgentDir()
      const timeout = opts.timeout ?? process.env.ADK_TIMEOUT ?? '30s'
      const args = [
        'workflows',
        'run',
        'searchCharities',
        JSON.stringify(req),
        '--wait',
        '--timeout',
        timeout,
        '--format',
        'json',
      ]
      const { stdout } = await execFileP(bin, args, {
        cwd,
        maxBuffer: 4 * 1024 * 1024,
      })
      const parsed: unknown = JSON.parse(stdout)
      // `adk workflows run --format json` wraps the workflow return value in an
      // envelope: { workflowId, workflow, status, duration, output }. Older
      // versions returned the bare output. Support both.
      const envelope = parsed as { output?: unknown; results?: unknown }
      const candidate = envelope?.output ?? parsed
      if (
        typeof candidate !== 'object' ||
        candidate === null ||
        !Array.isArray((candidate as BotSearchResponse).results)
      ) {
        throw new Error('Unexpected workflow output shape')
      }
      return candidate as BotSearchResponse
    },
  }
}

/** Default singleton; routes import this. Tests inject their own via
 * `setBotClient` so they never spawn the CLI. */
let active: BotClient = createCliBotClient()

export function getBotClient(): BotClient {
  return active
}

export function setBotClient(client: BotClient): void {
  active = client
}
