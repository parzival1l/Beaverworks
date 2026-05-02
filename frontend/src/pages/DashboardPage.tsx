import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { searchCharities } from '../api/search'
import { CharityCard } from '../components/charity/CharityCard'
import { TaxOptimizer } from '../components/tax/TaxOptimizer'
import { BackButton } from '../components/ui/BackButton'
import { filterMockCharitiesByAnswers, mockCharities } from '../data/mockCharities'
import type { Charity, QuestionnaireAnswers } from '../types/charity'
import type { SearchResultItem } from '../types/search'

const DEFAULT_PROMPT =
  'Recommend Canadian charities that best match my profile.'

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') ?? 'all'
  const location = useLocation()
  const navigate = useNavigate()

  const [filterText, setFilterText] = useState('')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [fallback, setFallback] = useState<Charity[]>(mockCharities)
  const [loading, setLoading] = useState(false)
  const initialFireDone = useRef(false)

  const answers = (location.state ?? null) as QuestionnaireAnswers | null

  const runSearch = useCallback(
    async (currentPrompt: string) => {
      if (!answers) return
      setLoading(true)
      try {
        const res = await searchCharities({ answers, prompt: currentPrompt })
        setResults(res.results)
        setFallback([])
      } catch {
        setResults([])
        setFallback(filterMockCharitiesByAnswers(answers))
      } finally {
        setLoading(false)
      }
    },
    [answers],
  )

  useEffect(() => {
    if (mode !== 'filtered' || !answers) {
      setResults([])
      setFallback(mockCharities)
      return
    }
    if (initialFireDone.current) return
    initialFireDone.current = true
    void runSearch(DEFAULT_PROMPT)
  }, [mode, answers, runSearch])

  const baseCharities: Array<{
    charity: Charity
    score?: number
    rationale?: string
  }> = useMemo(() => {
    if (results.length > 0) {
      return results.map((r) => ({
        charity: r.charity,
        score: r.score,
        rationale: r.rationale,
      }))
    }
    return fallback.map((c) => ({ charity: c }))
  }, [results, fallback])

  const visible = useMemo(() => {
    const query = filterText.toLowerCase().trim()
    if (!query) return baseCharities
    return baseCharities.filter(
      ({ charity }) =>
        charity.organizationName.toLowerCase().includes(query) ||
        charity.category.toLowerCase().includes(query),
    )
  }, [baseCharities, filterText])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between rounded-xl bg-trust px-6 py-4 text-white shadow-sm">
        <p className="text-2xl font-semibold">Altru</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-light text-sm font-semibold text-white">
            DV
          </div>
          <p className="text-sm font-semibold">Demo Viewer</p>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <BackButton to="/questionnaire" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          {mode === 'filtered' && answers ? (
            <div className="rounded-xl border border-border bg-white p-4">
              <label
                htmlFor="search-prompt"
                className="mb-2 block text-sm font-semibold"
              >
                Refine your search
              </label>
              <textarea
                id="search-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Tell us in your own words what you want to support."
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-text-secondary">
                  Combined with your questionnaire answers to rank Canadian
                  charities.
                </p>
                <button
                  type="button"
                  disabled={loading || prompt.trim().length === 0}
                  onClick={() => void runSearch(prompt)}
                  className="rounded-lg bg-cherry px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              <p className="mt-3 text-xs">
                <Link to="/dashboard?mode=all" className="font-semibold text-cherry">
                  Show all charities instead
                </Link>
              </p>
            </div>
          ) : null}

          <input
            placeholder="Filter by charity name or category"
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3"
          />

          {loading && results.length === 0 ? (
            <p className="text-sm text-text-secondary">Loading recommendations...</p>
          ) : (
            <div className="grid gap-4">
              {visible.map(({ charity, score, rationale }) => (
                <CharityCard
                  key={charity.id}
                  charity={charity}
                  score={score}
                  rationale={rationale}
                  onSelect={(id) => navigate(`/charity/${id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2">
          <TaxOptimizer />
        </section>
      </div>
    </main>
  )
}
