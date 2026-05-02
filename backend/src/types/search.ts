import type { QuestionnaireAnswers } from './questionnaire'

/** Single shape used by: questionnaire submit, /api/search request, and the
 * Botpress `searchCharities` workflow input. */
export interface SearchRequest {
  answers: QuestionnaireAnswers
  prompt: string
  userId?: string
}

/** Full charity record shape — mirrors `Charity` in `frontend/src/types/charity.ts`
 * and what `scripts/ingest-charities.ts` emits. */
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

export interface SearchResultItem {
  charity: CharityRecord
  score: number
  rationale: string
}

export interface SearchResponse {
  queryId: string
  results: SearchResultItem[]
}

/** Raw shape returned by the Botpress workflow — charityId only. The Express
 * route hydrates this into a full `CharityRecord` via the metadata map. */
export interface BotSearchResultItem {
  charityId: string
  organizationName: string
  score: number
  rationale: string
}

export interface BotSearchResponse {
  queryId: string
  results: BotSearchResultItem[]
}
