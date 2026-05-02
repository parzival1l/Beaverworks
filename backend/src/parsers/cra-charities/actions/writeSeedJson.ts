/**
 * Action: writeSeedJson
 *
 * Write a CharityRecord[] to a JSON file matching the shape of
 * `data/charities.seed.json`. Kept as a separate action so the
 * pure parsing pipeline stays IO-free and testable.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { CharityRecord } from '../schemas'

export function writeSeedJson(outPath: string, records: CharityRecord[]): void {
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(records, null, 2) + '\n', 'utf-8')
}
