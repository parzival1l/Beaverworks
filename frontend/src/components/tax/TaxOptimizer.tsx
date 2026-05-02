import { useMemo, useState } from 'react'
import {
  getFederalMarginalRate,
  getOptimalDonationAmount,
  getOptimizationScore,
  getQuebecMarginalRate,
  getTaxSaved,
} from '../../lib/taxCalculator'
import { ProgressBar } from '../ui/ProgressBar'

const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

export function TaxOptimizer() {
  const [income, setIncome] = useState(85000)
  const [donation, setDonation] = useState(0)

  const metrics = useMemo(() => {
    const marginal =
      getFederalMarginalRate(income) + getQuebecMarginalRate(income)
    const optimal = getOptimalDonationAmount(income)
    const saved = getTaxSaved(income, donation)
    const optimalSaved = getTaxSaved(income, optimal)
    const additionalDonation = Math.max(0, optimal - donation)
    const additionalSavings = Math.max(0, optimalSaved - saved)
    const score = getOptimizationScore(income, donation)

    return {
      marginal,
      optimal,
      saved,
      additionalDonation,
      additionalSavings,
      score,
    }
  }, [donation, income])

  return (
    <aside className="sticky top-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Quebec Tax Optimizer</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Plan your donation for maximum combined federal + Quebec credit.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Income</label>
          <input
            type="range"
            min={30000}
            max={300000}
            value={income}
            onChange={(event) => setIncome(Number(event.target.value))}
            className="w-full accent-cherry"
          />
          <input
            type="number"
            min={30000}
            max={300000}
            value={income}
            onChange={(event) => setIncome(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Current donation amount
          </label>
          <input
            type="range"
            min={0}
            max={10000}
            value={donation}
            onChange={(event) => setDonation(Number(event.target.value))}
            className="w-full accent-cherry"
          />
          <p className="mt-2 text-sm text-text-secondary">
            {currency.format(donation)}
          </p>
        </div>

        <div className="rounded-xl bg-cream p-4 text-sm">
          <p>
            Marginal tax rate:{' '}
            <span className="font-semibold">
              {(metrics.marginal * 100).toFixed(2)}%
            </span>
          </p>
          <p className="mt-1">
            Tax saved now:{' '}
            <span className="font-semibold">{currency.format(metrics.saved)}</span>
          </p>
          <p className="mt-1">
            Optimal donation recommendation:{' '}
            <span className="font-semibold">
              {currency.format(metrics.optimal)}
            </span>
          </p>
        </div>

        <ProgressBar
          value={metrics.score}
          label={`Tax optimization score: ${metrics.score}%`}
        />

        <p className="text-sm text-text-secondary">
          You could save an additional{' '}
          <span className="font-semibold text-text-primary">
            {currency.format(metrics.additionalSavings)}
          </span>{' '}
          in taxes by donating{' '}
          <span className="font-semibold text-text-primary">
            {currency.format(metrics.additionalDonation)}
          </span>{' '}
          more.
        </p>
      </div>
    </aside>
  )
}
