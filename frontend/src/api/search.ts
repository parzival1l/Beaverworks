import type { SearchRequest, SearchResponse } from '../types/search'

const SEARCH_PATH =
  import.meta.env.VITE_SEARCH_URL ?? '/api/search'

/**
 * POST `{ answers, prompt }` to the Express search proxy.
 * Express in turn invokes the Botpress `searchCharities` workflow and returns
 * ranked charity records with LLM rationales.
 */
export async function searchCharities(
  request: SearchRequest,
): Promise<SearchResponse> {
  const res = await fetch(SEARCH_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Search request failed'
    throw new Error(message)
  }

  const body = data as SearchResponse
  if (
    typeof body.queryId !== 'string' ||
    !Array.isArray(body.results)
  ) {
    throw new Error('Invalid search response')
  }
  return body
}
