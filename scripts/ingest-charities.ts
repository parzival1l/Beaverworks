#!/usr/bin/env tsx
/**
 * Ingest charity records into the agent workspace. Produces:
 *
 *   agent/data/charities.indexed.json
 *     [{ id, organizationName, content, metadata }]
 *     Convenience snapshot of the full corpus (used by tests + the metadata map).
 *
 *   agent/data/charities.metadata.json
 *     { [id]: CharityRecord }
 *     Lookup map the search workflow uses to rehydrate full charity records
 *     from KB passage citations.
 *
 *   agent/data/charities/<id>.md
 *     One markdown document per charity. The Botpress KB's
 *     `DataSource.Directory.fromPath` indexes each as a separate passage so
 *     citations come back per-charity.
 *
 * Inputs (resolved in order):
 *   1. data/charities.csv   (CRA-export shape, see CSV_COLUMNS below)
 *   2. data/charities.txt   (CRA website “detail” copy-paste; see parseCharitiesTxt)
 *   3. data/charities.seed.json (full Charity[] shape, fallback)
 *
 * Run: `tsx scripts/ingest-charities.ts`
 *
 * CSV_COLUMNS (first row, comma-separated, quoted strings allowed):
 *   id,bnRegistrationNumber,organizationName,charityStatus,typeOfQualifiedDonee,
 *   effectiveDateOfStatus,description,sanction,designation,charityType,category,
 *   address,city,provinceTerritory,country,postalCode,
 *   totalRevenue,totalExpenses,totalAssets,totalLiabilities,
 *   charitableExpenditure,fundraisingExpenditure,managementExpenditure,
 *   fiscalYearEnd,tags
 * `tags` is a `;`-separated list inside the cell.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

export interface CharityRecord {
  id: string
  bnRegistrationNumber: string
  organizationName: string
  charityStatus: string
  typeOfQualifiedDonee: string
  effectiveDateOfStatus: string
  description: string
  sanction: string
  designation: string
  charityType: string
  category: string
  address: string
  city: string
  provinceTerritory: string
  country: string
  postalCode: string
  financial: {
    totalRevenue: number
    totalExpenses: number
    totalAssets: number
    totalLiabilities: number
    charitableExpenditure: number
    fundraisingExpenditure: number
    managementExpenditure: number
    fiscalYearEnd: string
  }
  tags: string[]
}

export interface IndexedCharity {
  id: string
  organizationName: string
  /** Single text blob the KB embeds. */
  content: string
  /** Structured fields preserved for the frontend. */
  metadata: CharityRecord
}

export function buildContent(c: CharityRecord): string {
  // The model only sees `content`. Keep it dense and human-readable; include
  // every field that influences relevance for `causes/beneficiaries/geography
  // /givingStyle` + free-form prompt queries.
  return [
    `${c.organizationName} (${c.charityType}, ${c.category}).`,
    c.description,
    `Designation: ${c.designation}. Status: ${c.charityStatus}.`,
    `Location: ${c.city}, ${c.provinceTerritory}, ${c.country}.`,
    `Tags: ${c.tags.join(', ')}.`,
    `Annual revenue: $${c.financial.totalRevenue.toLocaleString('en-CA')}; ` +
      `charitable spend: $${c.financial.charitableExpenditure.toLocaleString('en-CA')}.`,
  ].join(' ')
}

export function indexCharities(records: CharityRecord[]): IndexedCharity[] {
  return records.map((c) => ({
    id: c.id,
    organizationName: c.organizationName,
    content: buildContent(c),
    metadata: c,
  }))
}

/** Minimal RFC4180-ish CSV parser. Handles quoted cells with embedded commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/** Canonical CRA BN display: `123456789 RR 0001`. */
export function formatBnRegistration(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toUpperCase()
  const m = compact.match(/^(\d{9})(RR\d{4})$/i)
  return m ? `${m[1]} ${m[2].toUpperCase()}` : raw.trim()
}

/** Stable slug id for paths / URLs from BN (e.g. `bn-750231003-rr0001`). */
export function charityIdFromBn(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toLowerCase()
  const m = compact.match(/^(\d{9})(rr\d{4})$/)
  if (!m) {
    return `bn-${compact.replace(/[^a-z0-9]+/gi, '-')}`
  }
  return `bn-${m[1]}-${m[2]}`
}

function formatCanadianPostal(raw: string): string {
  const c = raw.replace(/\s/g, '').toUpperCase()
  if (c.length === 6 && /^[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(c)) {
    return `${c.slice(0, 3)} ${c.slice(3)}`
  }
  return raw.trim()
}

function mapCraStatusToUi(status: string): string {
  if (status === 'Registered') return 'Active'
  return status
}

function titleCaseWords(s: string): string {
  return s
    .split(/[\s/-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function provinceToTag(province: string): string {
  return province
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z-]/g, '')
}

function deriveTags(c: Pick<CharityRecord, 'city' | 'provinceTerritory' | 'category' | 'charityType'>): string[] {
  const tags = new Set<string>()
  tags.add('canada')
  const p = provinceToTag(c.provinceTerritory)
  if (p) tags.add(p)
  const cityTag = c.city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (cityTag) tags.add(cityTag)

  for (const word of c.category.toLowerCase().split(/[^a-z]+/)) {
    if (word.length > 2) tags.add(word)
  }
  for (const word of c.charityType.toLowerCase().split(/[^a-z]+/)) {
    if (word.length > 2) tags.add(word)
  }
  if (c.charityType.toLowerCase().includes('poverty')) tags.add('poverty')
  if (c.category.toLowerCase().includes('health')) tags.add('health')
  if (c.category.toLowerCase().includes('foundation')) tags.add('foundations')
  return [...tags]
}

const EMPTY_FINANCIAL: CharityRecord['financial'] = {
  totalRevenue: 0,
  totalExpenses: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  charitableExpenditure: 0,
  fundraisingExpenditure: 0,
  managementExpenditure: 0,
  fiscalYearEnd: '',
}

/**
 * Parse CRA charity detail text pasted from the website (see `data/charities.txt`).
 * Blank organization names become a BN-based display label.
 */
export function parseCharitiesTxt(text: string): CharityRecord[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const blocks = trimmed
    .split(/\n(?=Organization name:)/)
    .map((b) => b.trim())
    .filter(Boolean)

  const records: CharityRecord[] = []

  for (const block of blocks) {
    const lines = block.split(/\r?\n/)
    const fields: Record<string, string> = {}
    let organizationNameFromLine = ''

    for (const line of lines) {
      const cityProv =
        /^City:\s*(.+?)\s+Province, territory, outside of Canada:\s*(.+)$/i.exec(
          line,
        )
      if (cityProv) {
        fields._city = cityProv[1].trim()
        fields._province = cityProv[2].trim()
        continue
      }

      const orgMatch = /^Organization name:\s*(.*)$/i.exec(line)
      if (orgMatch) {
        organizationNameFromLine = orgMatch[1].trim()
        continue
      }

      const kv = /^([^:]+):\s*(.*)$/.exec(line)
      if (!kv) continue
      const key = kv[1].trim()
      const value = kv[2].trim()
      if (
        key === 'Organization name' ||
        key.startsWith('Organization name')
      ) {
        organizationNameFromLine = value
        continue
      }
      fields[key] = value
    }

    const bnRaw =
      fields['BN/Registration number'] ?? fields['BN/Registration Number'] ?? ''
    if (!bnRaw) continue

    const bn = formatBnRegistration(bnRaw)
    const id = charityIdFromBn(bnRaw)
    const city = titleCaseWords(fields._city ?? '')
    const provinceTerritory = titleCaseWords(fields._province ?? '')

    const statusRaw = fields.Status ?? ''
    const charityStatus = mapCraStatusToUi(statusRaw)
    const typeOfQualifiedDonee = fields['Type of qualified donee'] ?? ''
    const effectiveDateOfStatus = fields['Effective date of status'] ?? ''
    const charityType = fields['Charity type'] ?? ''
    const category = fields.Category ?? ''
    const address = fields.Address ?? ''

    let sanction = fields.Sanction ?? 'None'
    if (/^note:/i.test(sanction) || sanction === '') sanction = 'None'

    const postalRaw =
      fields['Postal code/Zip code'] ?? fields['Postal code'] ?? ''
    const postalCode = formatCanadianPostal(postalRaw)

    const organizationName =
      organizationNameFromLine ||
      fields['Organization name'] ||
      `Registered charity (${bn})`

    const description = [
      `${charityType || 'Charity'} — ${category}.`,
      `Located in ${city}, ${provinceTerritory}. CRA status: ${statusRaw}.`,
    ].join(' ')

    const rec: CharityRecord = {
      id,
      bnRegistrationNumber: bn,
      organizationName,
      charityStatus,
      typeOfQualifiedDonee,
      effectiveDateOfStatus,
      description,
      sanction,
      designation: typeOfQualifiedDonee || 'Charity',
      charityType,
      category,
      address,
      city,
      provinceTerritory,
      country: 'Canada',
      postalCode,
      financial: { ...EMPTY_FINANCIAL },
      tags: deriveTags({
        city,
        provinceTerritory,
        category,
        charityType,
      }),
    }
    records.push(rec)
  }

  return records
}

export function writeSeedJson(repoRoot: string, records: CharityRecord[]): void {
  const seedPath = resolve(repoRoot, 'data', 'charities.seed.json')
  mkdirSync(dirname(seedPath), { recursive: true })
  writeFileSync(seedPath, JSON.stringify(records, null, 2) + '\n', 'utf-8')
}

export function csvRowsToRecords(rows: string[][]): CharityRecord[] {
  if (rows.length < 2) return []
  const [header, ...body] = rows
  const idx = (name: string): number => header.indexOf(name)
  const num = (s: string | undefined): number => {
    const n = Number((s ?? '').replace(/[$,\s]/g, ''))
    return Number.isFinite(n) ? n : 0
  }
  return body.map((r): CharityRecord => ({
    id: r[idx('id')] ?? '',
    bnRegistrationNumber: r[idx('bnRegistrationNumber')] ?? '',
    organizationName: r[idx('organizationName')] ?? '',
    charityStatus: r[idx('charityStatus')] ?? '',
    typeOfQualifiedDonee: r[idx('typeOfQualifiedDonee')] ?? '',
    effectiveDateOfStatus: r[idx('effectiveDateOfStatus')] ?? '',
    description: r[idx('description')] ?? '',
    sanction: r[idx('sanction')] ?? '',
    designation: r[idx('designation')] ?? '',
    charityType: r[idx('charityType')] ?? '',
    category: r[idx('category')] ?? '',
    address: r[idx('address')] ?? '',
    city: r[idx('city')] ?? '',
    provinceTerritory: r[idx('provinceTerritory')] ?? '',
    country: r[idx('country')] ?? '',
    postalCode: r[idx('postalCode')] ?? '',
    financial: {
      totalRevenue: num(r[idx('totalRevenue')]),
      totalExpenses: num(r[idx('totalExpenses')]),
      totalAssets: num(r[idx('totalAssets')]),
      totalLiabilities: num(r[idx('totalLiabilities')]),
      charitableExpenditure: num(r[idx('charitableExpenditure')]),
      fundraisingExpenditure: num(r[idx('fundraisingExpenditure')]),
      managementExpenditure: num(r[idx('managementExpenditure')]),
      fiscalYearEnd: r[idx('fiscalYearEnd')] ?? '',
    },
    tags: (r[idx('tags')] ?? '')
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean),
  }))
}

export function loadRecords(repoRoot: string): CharityRecord[] {
  const csvPath = resolve(repoRoot, 'data', 'charities.csv')
  if (existsSync(csvPath)) {
    const rows = parseCsv(readFileSync(csvPath, 'utf-8'))
    return csvRowsToRecords(rows)
  }
  const txtPath = resolve(repoRoot, 'data', 'charities.txt')
  if (existsSync(txtPath)) {
    return parseCharitiesTxt(readFileSync(txtPath, 'utf-8'))
  }
  const jsonPath = resolve(repoRoot, 'data', 'charities.seed.json')
  if (existsSync(jsonPath)) {
    return JSON.parse(readFileSync(jsonPath, 'utf-8')) as CharityRecord[]
  }
  throw new Error(
    `No charity source found. Looked for ${csvPath}, ${txtPath}, and ${jsonPath}.`,
  )
}

export function writeIndexed(
  outPath: string,
  indexed: IndexedCharity[],
): void {
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(indexed, null, 2) + '\n', 'utf-8')
}

export function writeMetadata(
  outPath: string,
  records: CharityRecord[],
): void {
  const map: Record<string, CharityRecord> = {}
  for (const r of records) map[r.id] = r
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n', 'utf-8')
}

export function buildMarkdown(c: CharityRecord): string {
  return [
    `# ${c.organizationName}`,
    '',
    `**Charity ID:** \`${c.id}\``,
    `**Type:** ${c.charityType} — ${c.category}`,
    `**Designation:** ${c.designation}`,
    `**Status:** ${c.charityStatus}`,
    `**Location:** ${c.city}, ${c.provinceTerritory}, ${c.country}`,
    `**Tags:** ${c.tags.join(', ')}`,
    '',
    '## Description',
    '',
    c.description,
    '',
    '## Financials',
    '',
    `- Total revenue: $${c.financial.totalRevenue.toLocaleString('en-CA')}`,
    `- Charitable expenditure: $${c.financial.charitableExpenditure.toLocaleString('en-CA')}`,
    `- Fundraising expenditure: $${c.financial.fundraisingExpenditure.toLocaleString('en-CA')}`,
    `- Management expenditure: $${c.financial.managementExpenditure.toLocaleString('en-CA')}`,
    `- Fiscal year end: ${c.financial.fiscalYearEnd}`,
  ].join('\n') + '\n'
}

export function writeMarkdownDocs(
  dir: string,
  records: CharityRecord[],
): string[] {
  mkdirSync(dir, { recursive: true })
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.md')) unlinkSync(resolve(dir, f))
    }
  }
  const written: string[] = []
  for (const r of records) {
    const p = resolve(dir, `${r.id}.md`)
    writeFileSync(p, buildMarkdown(r), 'utf-8')
    written.push(p)
  }
  return written
}

function main(): void {
  const repoRoot = resolve(__dirname, '..')
  const records = loadRecords(repoRoot)
 writeSeedJson(repoRoot, records)
  const indexed = indexCharities(records)
  const indexedPath = resolve(repoRoot, 'agent', 'data', 'charities.indexed.json')
  const metadataPath = resolve(repoRoot, 'agent', 'data', 'charities.metadata.json')
  const docsDir = resolve(repoRoot, 'agent', 'data', 'charities')
  writeIndexed(indexedPath, indexed)
  writeMetadata(metadataPath, records)
  const docs = writeMarkdownDocs(docsDir, records)
  console.log(
    `Indexed ${indexed.length} charities:\n` +
      `  ${indexedPath}\n` +
      `  ${metadataPath}\n` +
      `  ${docs.length} markdown files in ${docsDir}`,
  )
}

if (require.main === module) {
  main()
}
