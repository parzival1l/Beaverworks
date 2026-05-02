/**
 * Action: mapCraRowToCharity
 *
 * Input:  CraRow
 * Output: CharityRecord (seed JSON shape, see `data/charities.seed.json`)
 *
 * Mirrors Botpress ADK `Action` conventions (one primitive per file, Zod I/O).
 * The CRA list export lacks descriptions, financials, and tags, so we:
 *   - Leave `description` as a short auto-generated sentence.
 *   - Zero-fill `financial` (matches the shape in `scripts/ingest-charities.ts`).
 *   - Derive `tags` from province, city, category, and charity type.
 */

import {
  CharityRecord,
  CharityRecordZ,
  CraRow,
  CRA_STATUS_MAP,
  COUNTRY_CODE_MAP,
  DESIGNATION_CODE_MAP,
  PROVINCE_CODE_MAP,
} from '../schemas'

function formatBn(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toUpperCase()
  const m = compact.match(/^(\d{9})RR(\d{4})$/)
  return m ? `${m[1]} RR ${m[2]}` : raw.trim()
}

function charityIdFromBn(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toLowerCase()
  const m = compact.match(/^(\d{9})(rr\d{4})$/)
  return m ? `bn-${m[1]}-${m[2]}` : `bn-${compact.replace(/[^a-z0-9]+/gi, '-')}`
}

function formatCanadianPostal(raw: string): string {
  const c = raw.replace(/\s/g, '').toUpperCase()
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(c)) return `${c.slice(0, 3)} ${c.slice(3)}`
  return raw.trim()
}

function titleCaseWords(s: string): string {
  return s
    .split(/(\s+|-|\/)/)
    .map((w) => {
      if (!w || /^\s+$/.test(w) || w === '-' || w === '/') return w
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapStatus(raw: string): string {
  return CRA_STATUS_MAP[raw] ?? raw
}

function mapDesignation(code: string, charityType: string): string {
  if (DESIGNATION_CODE_MAP[code]) return DESIGNATION_CODE_MAP[code]
  return charityType || 'Charitable organization'
}

function mapProvince(code: string): string {
  return PROVINCE_CODE_MAP[code.toUpperCase()] ?? code
}

function mapCountry(code: string): string {
  return COUNTRY_CODE_MAP[code.toUpperCase()] ?? code
}

function deriveTags(parts: {
  city: string
  province: string
  charityType: string
  category: string
}): string[] {
  const tags = new Set<string>()
  tags.add('canada')

  const province = slug(parts.province)
  if (province) tags.add(province)

  const city = slug(parts.city)
  if (city) tags.add(city)

  for (const word of parts.charityType.toLowerCase().split(/[^a-z]+/)) {
    if (word.length > 3 && !['the', 'and', 'for', 'with'].includes(word)) {
      tags.add(word)
    }
  }
  if (parts.category && parts.category !== parts.charityType) {
    for (const word of parts.category.toLowerCase().split(/[^a-z]+/)) {
      if (word.length > 3) tags.add(word)
    }
  }

  return [...tags]
}

/**
 * The CRA list export has no financials. We synthesize plausible numbers
 * so downstream UI can render a populated financials tab. Values are
 * **deterministic per BN** (same input → same output across runs) and
 * satisfy the natural invariants (charitable + fundraising + management
 * ≈ total expenses; expenses ≤ revenue; liabilities ≤ assets).
 *
 * These are **not real CRA financials** — mark them as synthetic anywhere
 * they're shown to end users.
 */
function hashSeed(key: string): number {
  // 32-bit FNV-1a
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

function seededRand(seed: number): () => number {
  let state = seed || 1
  return () => {
    // xorshift32
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0xffffffff
  }
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step
}

function synthesizeFinancials(
  bn: string,
  designationCode: string,
): CharityRecord['financial'] {
  const rnd = seededRand(hashSeed(bn))

  const minByDesignation: Record<string, number> = {
    '0001': 250_000,
    '0002': 800_000,
    '0003': 400_000,
  }
  const spanByDesignation: Record<string, number> = {
    '0001': 3_750_000,
    '0002': 7_200_000,
    '0003': 5_600_000,
  }
  const minRev = minByDesignation[designationCode] ?? 300_000
  const span = spanByDesignation[designationCode] ?? 4_000_000

  const totalRevenue = roundTo(minRev + rnd() * span, 1_000)
  const expenseRatio = 0.85 + rnd() * 0.13 // 0.85 – 0.98
  const totalExpenses = roundTo(totalRevenue * expenseRatio, 1_000)

  const assetMultiplier = 1.1 + rnd() * 1.2 // 1.1x – 2.3x revenue
  const totalAssets = roundTo(totalRevenue * assetMultiplier, 1_000)
  const liabilityRatio = 0.1 + rnd() * 0.25 // 10% – 35% of assets
  const totalLiabilities = roundTo(totalAssets * liabilityRatio, 1_000)

  const charitableShare = 0.68 + rnd() * 0.17 // 68% – 85%
  const fundraisingShare = 0.06 + rnd() * 0.08 // 6% – 14%
  const charitableExpenditure = roundTo(totalExpenses * charitableShare, 1_000)
  const fundraisingExpenditure = roundTo(totalExpenses * fundraisingShare, 1_000)
  const managementExpenditure = Math.max(
    0,
    totalExpenses - charitableExpenditure - fundraisingExpenditure,
  )

  const month = 1 + (hashSeed(bn + ':m') % 12)
  const day = 1 + (hashSeed(bn + ':d') % 28)
  const fiscalYearEnd = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return {
    totalRevenue,
    totalExpenses,
    totalAssets,
    totalLiabilities,
    charitableExpenditure,
    fundraisingExpenditure,
    managementExpenditure,
    fiscalYearEnd,
  }
}

function buildDescription(r: {
  organizationName: string
  charityType: string
  city: string
  province: string
  status: string
}): string {
  const type = r.charityType || 'Charity'
  return (
    `${r.organizationName} — ${type}. ` +
    `Based in ${r.city}, ${r.province}. CRA status: ${r.status}.`
  )
}

/** Map one CRA TSV row to a seed CharityRecord. */
export function mapCraRowToCharity(row: CraRow): CharityRecord {
  const city = titleCaseWords(row.city)
  const province = mapProvince(row.provinceTerritory)
  const country = mapCountry(row.country)
  const postalCode = formatCanadianPostal(row.postalCode)
  const charityStatus = mapStatus(row.status)
  const designation = mapDesignation(row.designationCode, row.charityType)

  // The CRA list export doesn't give us a human-readable category label —
  // use the charity type as the category so the seed JSON still has a
  // populated field instead of a bare 4-digit code.
  const category = row.charityType || row.categoryCode
  const sanction = row.sanction.trim() === '' ? 'None' : row.sanction.trim()
  const address = row.address.replace(/\s+/g, ' ').trim()

  const rec: CharityRecord = {
    id: charityIdFromBn(row.bnRegistrationNumber),
    bnRegistrationNumber: formatBn(row.bnRegistrationNumber),
    organizationName: row.organizationName.trim(),
    charityStatus,
    typeOfQualifiedDonee: row.typeOfQualifiedDonee.trim(),
    effectiveDateOfStatus: row.effectiveDateOfStatus.trim(),
    description: buildDescription({
      organizationName: row.organizationName.trim(),
      charityType: row.charityType,
      city,
      province,
      status: charityStatus,
    }),
    sanction,
    designation,
    charityType: row.charityType.trim(),
    category,
    address,
    city,
    provinceTerritory: province,
    country,
    postalCode,
    financial: synthesizeFinancials(
      row.bnRegistrationNumber,
      row.designationCode,
    ),
    tags: deriveTags({
      city,
      province,
      charityType: row.charityType,
      category,
    }),
  }

  return CharityRecordZ.parse(rec)
}
