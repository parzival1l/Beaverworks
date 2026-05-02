import { Workflow, adk } from '@botpress/runtime'
import { randomUUID } from 'node:crypto'
import { basename } from 'node:path'
import Charities from '../knowledge/charities'
import {
  SearchRequestZ,
  SearchResponseZ,
  type SearchResultItem,
} from '../types/search'

const TOP_K = 5

/**
 * Combine the deterministic questionnaire answers with the free-form prompt
 * into a single embedding query. The KB embeds plain text, so we phrase it
 * naturally rather than as key=value pairs.
 */
function buildQuery(
  answers: { causes: string; beneficiaries: string; geography: string; givingStyle: string },
  prompt: string,
): string {
  return [
    `Donor cause focus: ${answers.causes}.`,
    `Beneficiaries: ${answers.beneficiaries}.`,
    `Geography of impact: ${answers.geography}.`,
    `Giving style: ${answers.givingStyle}.`,
    `Donor prompt: ${prompt}`,
  ].join(' ')
}

function charityIdFromPassage(passage: { metadata?: unknown }): string | null {
  const meta = (passage.metadata ?? {}) as Record<string, unknown>
  const path =
    typeof meta.path === 'string'
      ? meta.path
      : typeof meta.source === 'string'
        ? meta.source
        : typeof meta.file === 'string'
          ? meta.file
          : null
  if (!path) return null
  return basename(path).replace(/\.md$/, '')
}

export default new Workflow({
  name: 'searchCharities',
  description:
    'Match a donor (questionnaire answers + free-form prompt) to charities ' +
    'in the KB. Returns ranked charityIds with a short LLM rationale per hit.',
  input: SearchRequestZ,
  output: SearchResponseZ,
  handler: async ({ input, step }) => {
    const query = buildQuery(input.answers, input.prompt)

    const search = await step('kb-search', async () => {
      return Charities.search(query, { limit: TOP_K })
    })

    const passages = search.passages ?? []
    const seen = new Set<string>()
    const candidates: { charityId: string; content: string; rank: number }[] = []
    for (let i = 0; i < passages.length; i++) {
      const id = charityIdFromPassage(passages[i])
      if (!id || seen.has(id)) continue
      seen.add(id)
      candidates.push({ charityId: id, content: passages[i].content, rank: i })
    }

    const results: SearchResultItem[] = await step('rationales', async () => {
      const out: SearchResultItem[] = []
      for (const c of candidates) {
        const rationale = await adk.zai.text(
          `You are helping a donor. Given the donor profile and prompt below ` +
            `and the charity passage, write a single-sentence reason this ` +
            `charity is a good match. No marketing fluff. Quote one concrete ` +
            `detail from the passage.\n\n` +
            `Donor profile + prompt:\n${query}\n\n` +
            `Charity passage:\n${c.content}`,
        )
        out.push({
          charityId: c.charityId,
          organizationName: c.charityId,
          score: candidates.length > 0 ? 1 - c.rank / candidates.length : 0,
          rationale,
        })
      }
      return out
    })

    return {
      queryId: randomUUID(),
      results,
    }
  },
})
