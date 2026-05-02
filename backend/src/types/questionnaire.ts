/** Matches `QuestionnaireAnswers` in frontend `src/types/charity.ts` (Altru plan). */
export interface QuestionnaireAnswers {
  causes: string
  beneficiaries: string
  geography: string
  givingStyle: string
}

export interface SubmitQuestionnaireRequest {
  answers: QuestionnaireAnswers
  userId?: string
}

export interface SubmitQuestionnaireResponse {
  success: true
  submissionId: string
  answers: QuestionnaireAnswers
}

export const REQUIRED_QUESTION_IDS: readonly (keyof QuestionnaireAnswers)[] = [
  'causes',
  'beneficiaries',
  'geography',
  'givingStyle',
]
