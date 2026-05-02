import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CharityRecord } from '../types/search'

/**
 * Loads the id -> CharityRecord map produced by `scripts/ingest-charities.ts`.
 * The Express search route uses this to hydrate a Botpress workflow result
 * (which only carries charityIds + scores + rationales) into full charity cards
 * the frontend can render.
 *
 * Override the JSON path via CHARITIES_METADATA_PATH (useful for tests).
 */
function defaultPath(): string {
  return resolve(
    __dirname,
    '..',
    '..',
    '..',
    'agent',
    'data',
    'charities.metadata.json',
  )
}

let cache: Record<string, CharityRecord> | null = null
let cachedFrom: string | null = null

export function loadCharityMetadata(): Record<string, CharityRecord> {
  const path = process.env.CHARITIES_METADATA_PATH ?? defaultPath()
  if (cache !== null && cachedFrom === path) return cache
  if (!existsSync(path)) {
    cache = {}
    cachedFrom = path
    return cache
  }
  const raw = readFileSync(path, 'utf-8')
  cache = JSON.parse(raw) as Record<string, CharityRecord>
  cachedFrom = path
  return cache
}

/** Test helper. */
export function resetCharityMetadataCache(): void {
  cache = null
  cachedFrom = null
}
