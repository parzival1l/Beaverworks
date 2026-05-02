import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getFilteredCharities } from '../api/questionnaire'
import { CharityCard } from '../components/charity/CharityCard'
import { TaxOptimizer } from '../components/tax/TaxOptimizer'
import { BackButton } from '../components/ui/BackButton'
import { mockCharities } from '../data/mockCharities'
import type { Charity, QuestionnaireAnswers } from '../types/charity'

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') ?? 'all'
  const location = useLocation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [charities, setCharities] = useState<Charity[]>(mockCharities)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const answers = (location.state ?? null) as QuestionnaireAnswers | null

    if (mode !== 'filtered' || !answers) {
      setCharities(mockCharities)
      return
    }

    setLoading(true)
    getFilteredCharities(answers)
      .then((result) => setCharities(result.length > 0 ? result : mockCharities))
      .finally(() => setLoading(false))
  }, [location.state, mode])

  const visibleCharities = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return charities
    return charities.filter(
      (charity) =>
        charity.organizationName.toLowerCase().includes(query) ||
        charity.category.toLowerCase().includes(query),
    )
  }, [charities, search])

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
          {mode === 'filtered' ? (
            <div className="rounded-xl border-l-4 border-trust bg-trust-muted px-4 py-3 text-sm text-trust">
              Charities matched to your answers.{' '}
              <Link
                to="/dashboard?mode=all"
                className="font-semibold text-trust-light underline decoration-transparent hover:text-trust hover:underline"
              >
                Show all
              </Link>
            </div>
          ) : null}

          <input
            placeholder="Search by charity name or category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-form bg-white px-4 py-3 text-charcoal placeholder:text-charcoal-muted focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
          />

          {loading ? (
            <p className="text-sm text-charcoal-muted">Loading recommendations...</p>
          ) : (
            <div className="grid gap-4">
              {visibleCharities.map((charity) => (
                <CharityCard
                  key={charity.id}
                  charity={charity}
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
