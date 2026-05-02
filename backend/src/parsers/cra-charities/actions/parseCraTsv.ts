/**
 * Action: parseCraTsv
 *
 * Input:  raw text of the CRA "charities list" TSV export
 * Output: CraRow[]
 *
 * Follows Botpress ADK conventions (`.cursor/rules/botpress-adk.mdc`):
 *   - One primitive per file (this action only parses TSV → rows).
 *   - Input/output validated by Zod schemas in `../schemas.ts`.
 *   - Pure function: no IO, no side effects — unit-testable in isolation.
 *     (Ready to be wrapped as `new Action({ input, output, handler })`
 *     inside the ADK `agent/` project if we later expose it there.)
 */

import { CraRow, CraRowZ, EXPECTED_HEADERS } from '../schemas'

function normalizeHeader(h: string): string {
  return h.trim().replace(/:$/, '').trim().toLowerCase()
}

/** Parse raw CRA TSV text into validated CraRow[]. */
export function parseCraTsv(text: string): CraRow[] {
  const trimmed = text.replace(/^\uFEFF/, '').trim()
  if (!trimmed) return []

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []

  const header = lines[0].split('\t').map(normalizeHeader)
  const expected = EXPECTED_HEADERS.map((h) => h.toLowerCase())
  for (const req of expected) {
    if (!header.includes(req)) {
      throw new Error(
        `CRA TSV header is missing required column "${req}". ` +
          `Got: ${header.join(' | ')}`,
      )
    }
  }

  const idx = (name: string): number => header.indexOf(name.toLowerCase())

  const rows: CraRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('\t')
    if (cells.every((c) => c.trim() === '')) continue

    const raw = {
      bnRegistrationNumber: (cells[idx('BN/Registration number')] ?? '').trim(),
      organizationName: (cells[idx('Organization name')] ?? '').trim(),
      status: (cells[idx('Status')] ?? '').trim(),
      typeOfQualifiedDonee: (cells[idx('Type of qualified donee')] ?? '').trim(),
      effectiveDateOfStatus: (cells[idx('Effective date of status')] ?? '').trim(),
      sanction: (cells[idx('Sanction')] ?? '').trim(),
      designationCode: (cells[idx('Designation')] ?? '').trim(),
      charityType: (cells[idx('Charity type')] ?? '').trim(),
      categoryCode: (cells[idx('Category')] ?? '').trim(),
      address: (cells[idx('Address')] ?? '').trim(),
      city: (cells[idx('City')] ?? '').trim(),
      provinceTerritory: (cells[idx('Province, territory, outside of Canada')] ?? '').trim(),
      country: (cells[idx('Country')] ?? '').trim(),
      postalCode: (cells[idx('Postal code/Zip code')] ?? '').trim(),
    }

    if (!raw.bnRegistrationNumber) continue
    rows.push(CraRowZ.parse(raw))
  }
  return rows
}
