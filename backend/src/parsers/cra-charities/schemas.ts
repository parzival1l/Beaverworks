/**
 * Schemas for the CRA "charities list" TSV parser.
 *
 * Modelled on Botpress ADK conventions (see `.cursor/rules/botpress-adk.mdc`):
 * - Every action input/output has a Zod schema.
 * - Schemas live in one file; each action imports what it needs.
 * - Types are derived via `z.infer<>` so TS + runtime validation stay in sync.
 *
 * The parser does NOT import `@botpress/runtime` (it runs in the plain
 * backend), but the shapes here are ready to be lifted into
 * `agent/src/actions/` as proper ADK `Action`s with the same Zod inputs
 * and outputs.
 */

import { z } from 'zod'

/**
 * One raw row from the CRA "Charities listings – search results" TSV export
 * (tab-delimited, 14 columns, ISO-8859 source file).
 *
 * Column order (as exported from the CRA website):
 *   1. BN/Registration number (compact, e.g. "750231003RR0001")
 *   2. Organization name
 *   3. Status: "Registered" | "Revoked-Voluntary" | "Revoked-Failure to File" | "Revoked-Other" | …
 *   4. Type of qualified donee (e.g. "Charity")
 *   5. Effective date of status (YYYY-MM-DD)
 *   6. Sanction (often blank)
 *   7. Designation code (0001=CO, 0002=Public foundation, 0003=Private foundation)
 *   8. Charity type (free text, e.g. "Other purposes beneficial to the community")
 *   9. Category code (4-digit CRA activity code)
 *  10. Address, 11. City, 12. Province/territory code (ON, QC, …)
 *  13. Country code (CA), 14. Postal code (compact)
 */
export const CraRowZ = z.object({
  bnRegistrationNumber: z.string(),
  organizationName: z.string(),
  status: z.string(),
  typeOfQualifiedDonee: z.string(),
  effectiveDateOfStatus: z.string(),
  sanction: z.string(),
  designationCode: z.string(),
  charityType: z.string(),
  categoryCode: z.string(),
  address: z.string(),
  city: z.string(),
  provinceTerritory: z.string(),
  country: z.string(),
  postalCode: z.string(),
})
export type CraRow = z.infer<typeof CraRowZ>

/**
 * Seed JSON shape used across the project (see `data/charities.seed.json`
 * and `scripts/ingest-charities.ts`). Kept in lockstep with that file so
 * the CRA parser output drops into the existing ingest pipeline unchanged.
 */
export const CharityFinancialZ = z.object({
  totalRevenue: z.number(),
  totalExpenses: z.number(),
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  charitableExpenditure: z.number(),
  fundraisingExpenditure: z.number(),
  managementExpenditure: z.number(),
  fiscalYearEnd: z.string(),
})
export type CharityFinancial = z.infer<typeof CharityFinancialZ>

export const CharityRecordZ = z.object({
  id: z.string(),
  bnRegistrationNumber: z.string(),
  organizationName: z.string(),
  charityStatus: z.string(),
  typeOfQualifiedDonee: z.string(),
  effectiveDateOfStatus: z.string(),
  description: z.string(),
  sanction: z.string(),
  designation: z.string(),
  charityType: z.string(),
  category: z.string(),
  address: z.string(),
  city: z.string(),
  provinceTerritory: z.string(),
  country: z.string(),
  postalCode: z.string(),
  financial: CharityFinancialZ,
  tags: z.array(z.string()),
})
export type CharityRecord = z.infer<typeof CharityRecordZ>

export const ParseCraExportOptionsZ = z
  .object({
    onlyRegistered: z.boolean().optional(),
    limit: z.number().int().positive().optional(),
  })
  .optional()
export type ParseCraExportOptions = z.infer<typeof ParseCraExportOptionsZ>

export const DESIGNATION_CODE_MAP: Record<string, string> = {
  '0001': 'Charitable organization',
  '0002': 'Public foundation',
  '0003': 'Private foundation',
}

export const PROVINCE_CODE_MAP: Record<string, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
}

export const COUNTRY_CODE_MAP: Record<string, string> = {
  CA: 'Canada',
  US: 'United States',
}

export const CRA_STATUS_MAP: Record<string, string> = {
  Registered: 'Active',
  'Revoked-Voluntary': 'Revoked (voluntary)',
  'Revoked-Failure to File': 'Revoked (failure to file)',
  'Revoked-Other': 'Revoked (other)',
  Annulled: 'Annulled',
  Suspended: 'Suspended',
}

/** Canonical column order for the CRA TSV header (trailing whitespace ignored). */
export const EXPECTED_HEADERS = [
  'BN/Registration number',
  'Organization name',
  'Status',
  'Type of qualified donee',
  'Effective date of status',
  'Sanction',
  'Designation',
  'Charity type',
  'Category',
  'Address',
  'City',
  'Province, territory, outside of Canada',
  'Country',
  'Postal code/Zip code',
] as const
