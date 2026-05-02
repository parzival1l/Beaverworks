import { filterMockCharitiesByAnswers } from '../data/mockCharities'
import type { Charity, QuestionnaireAnswers } from '../types/charity'

const SUBMIT_PATH =
  import.meta.env.VITE_QUESTIONNAIRE_SUBMIT_URL ?? '/api/questionnaire/submit'

export interface SubmitQuestionnaireResponse {
  success: true
  submissionId: string
  answers: QuestionnaireAnswers
}

/** POST validated answers to the Express API (dev: Vite proxies `/api` → backend). */
export async function submitQuestionnaire(
  answers: QuestionnaireAnswers,
): Promise<SubmitQuestionnaireResponse> {
  const res = await fetch(SUBMIT_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Questionnaire submit failed'
    throw new Error(message)
  }

  const body = data as SubmitQuestionnaireResponse
  if (!body.success || typeof body.submissionId !== 'string' || !body.answers) {
    throw new Error('Invalid questionnaire response')
  }
  return body
}

/**
 * Calls backend submit (cursor/questionnaire-feature integration), then filters mock
 * charities using echoed answers. If the API is down, falls back to client-only filter.
 */
export async function getFilteredCharities(
  answers: QuestionnaireAnswers,
): Promise<Charity[]> {
  try {
    const result = await submitQuestionnaire(answers)
    return filterMockCharitiesByAnswers(result.answers)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return filterMockCharitiesByAnswers(answers)
  }
}
