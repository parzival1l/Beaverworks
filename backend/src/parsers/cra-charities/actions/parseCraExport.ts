/**
 * Action: parseCraExport
 *
 * End-to-end pipeline: CRA TSV text → CharityRecord[].
 *
 * Composes two smaller actions (`parseCraTsv` + `mapCraRowToCharity`), the
 * same pattern the ADK rule recommends for reusable primitives
 * (`.cursor/rules/botpress-adk.mdc` → "Actions are reusable functions
 * callable from conversations, workflows, other actions …").
 */

import {
  CharityRecord,
  ParseCraExportOptions,
  ParseCraExportOptionsZ,
} from '../schemas'
import { mapCraRowToCharity } from './mapCraRowToCharity'
import { parseCraTsv } from './parseCraTsv'

export function parseCraExport(
  text: string,
  options?: ParseCraExportOptions,
): CharityRecord[] {
  const opts = ParseCraExportOptionsZ.parse(options)
  const rows = parseCraTsv(text)

  const filtered = opts?.onlyRegistered
    ? rows.filter((r) => r.status === 'Registered')
    : rows

  const capped =
    typeof opts?.limit === 'number' ? filtered.slice(0, opts.limit) : filtered

  return capped.map(mapCraRowToCharity)
}
