import { filterMockCharitiesByAnswers } from '../data/mockCharities'
import type { Charity, QuestionnaireAnswers } from '../types/charity'

// STUB - replace body with real RAG call when backend is ready
export async function getFilteredCharities(
  answers: QuestionnaireAnswers,
): Promise<Charity[]> {
  // TODO: POST to /api/questionnaire with answers, get back filtered charity IDs
  // For now: filter mockCharities by tag matching answers
  await new Promise((resolve) => setTimeout(resolve, 600))
  return filterMockCharitiesByAnswers(answers)
}
