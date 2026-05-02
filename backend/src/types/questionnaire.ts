export interface QuestionnaireAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

export interface SubmitQuestionnaireRequest {
  answers: QuestionnaireAnswers;
  userId?: string;
}

export interface SubmitQuestionnaireResponse {
  success: true;
  submissionId: string;
  answers: QuestionnaireAnswers;
}

export const REQUIRED_QUESTION_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;
