#!/usr/bin/env tsx
/**
 * CLI: convert the CRA TSV export to seed JSON.
 *
 * Usage (from repo root):
 *   npx tsx backend/src/parsers/cra-charities/cli.ts \
 *     --in  data/Charities_results_2026-05-02-13-43-32.txt \
 *     --out data/charities.cra.json \
 *     --only-registered \
 *     --limit 50
 *
 * Defaults are wired for the current hackathon asset: it reads the newest
 * `data/Charities_results_*.txt`, keeps only Registered charities, takes the
 * first 50, and writes `data/charities.cra.json`.
 *
 * The source file is ISO-8859 (Latin-1) so we decode as `latin1` to preserve
 * French accents correctly when round-tripped to UTF-8 JSON.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { parseCraExport } from './actions/parseCraExport'
import { writeSeedJson } from './actions/writeSeedJson'

interface CliArgs {
  inPath?: string
  outPath: string
  onlyRegistered: boolean
  limit?: number
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    outPath: 'data/charities.cra.json',
    onlyRegistered: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--in') args.inPath = argv[++i]
    else if (a === '--out') args.outPath = argv[++i]
    else if (a === '--only-registered') args.onlyRegistered = true
    else if (a === '--limit') args.limit = Number(argv[++i])
  }
  return args
}

function findLatestCraExport(repoRoot: string): string {
  const dataDir = resolve(repoRoot, 'data')
  const candidates = readdirSync(dataDir)
    .filter((f) => /^Charities_results_.*\.txt$/.test(f))
    .map((f) => ({ path: resolve(dataDir, f), mtime: statSync(resolve(dataDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
  if (candidates.length === 0) {
    throw new Error(
      `No Charities_results_*.txt found in ${dataDir}. Pass --in <file> explicitly.`,
    )
  }
  return candidates[0].path
}

function main(): void {
  const repoRoot = resolve(__dirname, '..', '..', '..', '..')
  const cli = parseArgs(process.argv.slice(2))

  const inPath = cli.inPath
    ? resolve(repoRoot, cli.inPath)
    : findLatestCraExport(repoRoot)
  const outPath = resolve(repoRoot, cli.outPath)

  const raw = readFileSync(inPath, 'latin1')
  const records = parseCraExport(raw, {
    onlyRegistered: cli.onlyRegistered,
    limit: cli.limit,
  })
  writeSeedJson(outPath, records)

  console.log(
    `Parsed ${records.length} charities from ${inPath}\n` +
      `  onlyRegistered=${cli.onlyRegistered} limit=${cli.limit ?? '∞'}\n` +
      `  wrote ${outPath}`,
  )
}

if (require.main === module) {
  main()
}
