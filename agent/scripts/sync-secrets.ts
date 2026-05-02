#!/usr/bin/env tsx
/**
 * Pull secrets declared in `agent.config.ts` out of `backend/.env` and push
 * them into the Botpress ADK secret store via `adk secret:set`. Botpress does
 * not auto-load `.env`; secrets live in `.adk/secrets.json`. This script keeps
 * a single source of truth (`backend/.env`) for local dev.
 *
 * Run: `npm run secrets:sync` (also runs automatically before `npm run dev`).
 *
 * Env overrides:
 *   ADK_BIN     path to the adk binary (default: 'adk' on PATH)
 *   ADK_ENV_FILE path to the .env file to read (default: ../backend/.env)
 *   ADK_SECRETS comma-separated keys to sync (default: OPENAI_API_KEY)
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function parseEnv(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function main(): void {
  const agentDir = resolve(__dirname, '..')
  const envPath =
    process.env.ADK_ENV_FILE ?? resolve(agentDir, '..', 'backend', '.env')
  const bin = process.env.ADK_BIN ?? 'adk'
  const wanted = (process.env.ADK_SECRETS ?? 'OPENAI_API_KEY')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  if (!existsSync(envPath)) {
    console.warn(
      `[sync-secrets] No env file at ${envPath}. Skipping. ` +
        `Set ADK_ENV_FILE or run \`adk secret:set\` manually.`,
    )
    return
  }

  const env = parseEnv(readFileSync(envPath, 'utf-8'))
  let synced = 0
  for (const key of wanted) {
    const value = env[key]
    if (!value) {
      console.warn(`[sync-secrets] ${key} not present in ${envPath}; skipping.`)
      continue
    }
    try {
      execFileSync(bin, ['secret:set', key, value], {
        cwd: agentDir,
        stdio: ['ignore', 'inherit', 'inherit'],
      })
      synced++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[sync-secrets] Failed to set ${key}: ${message}`)
      process.exitCode = 1
    }
  }
  console.log(
    `[sync-secrets] Synced ${synced}/${wanted.length} secret(s) from ${envPath}.`,
  )
}

main()
