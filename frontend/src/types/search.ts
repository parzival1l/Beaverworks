import type { Charity, QuestionnaireAnswers } from './charity'

export interface SearchRequest {
  answers: QuestionnaireAnswers
  prompt: string
  userId?: string
}

export interface SearchResultItem {
  charity: Charity
  score: number
  rationale: string
}

export interface SearchResponse {
  queryId: string
  results: SearchResultItem[]
}
