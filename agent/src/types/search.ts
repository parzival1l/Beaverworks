import { z } from '@botpress/runtime'

/** Mirrors `QuestionnaireAnswers` in backend/src/types/search.ts (and frontend). */
export const QuestionnaireAnswersZ = z.object({
  causes: z.string().describe('Cause area, e.g. "Environment & Climate".'),
  beneficiaries: z
    .string()
    .describe('Beneficiary group, e.g. "Children & Youth".'),
  geography: z.string().describe('Region of impact, e.g. "Quebec" or "Global".'),
  givingStyle: z
    .string()
    .describe('Engagement style, e.g. "One-time donation" or "Volunteer".'),
})

export const SearchRequestZ = z.object({
  answers: QuestionnaireAnswersZ,
  prompt: z
    .string()
    .min(1)
    .describe('Free-form user query about what they want to support.'),
  userId: z.string().optional(),
})

export const SearchResultItemZ = z.object({
  charityId: z.string(),
  organizationName: z.string(),
  score: z.number().min(0).max(1),
  rationale: z
    .string()
    .describe('1-2 sentence justification grounded in the KB passage.'),
})

export const SearchResponseZ = z.object({
  queryId: z.string(),
  results: z.array(SearchResultItemZ),
})

export type SearchRequest = z.infer<typeof SearchRequestZ>
export type SearchResponse = z.infer<typeof SearchResponseZ>
export type SearchResultItem = z.infer<typeof SearchResultItemZ>
