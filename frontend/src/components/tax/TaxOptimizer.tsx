import { useMemo, useState } from 'react'
import {
  getAbove200CreditRate,
  getDonationGap,
  getEffectiveDiscountRate,
  getNetCost,
  getOptimalDonation,
  getOptimizationScore,
  getTaxRebate,
} from '../../lib/taxCalculator'

const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const COLOR_GIVE = '#27AE60'
const COLOR_WARM = '#E67E22'

function formatMoneyPlain(n: number): string {
  return n.toLocaleString('en-CA')
}

type DonationState = 'below' | 'optimal' | 'above'

function getDonationState(score: number): DonationState {
  if (score < 100) return 'below'
  if (score === 100) return 'optimal'
  return 'above'
}

export interface TaxOptimizerProps {
  defaultIncome?: number
  defaultDonation?: number
}

export function TaxOptimizer({
  defaultIncome = 85_000,
  defaultDonation = 0,
}: TaxOptimizerProps) {
  const [income, setIncome] = useState(defaultIncome)
  const [donation, setDonation] = useState(defaultDonation)

  const optimal = useMemo(() => getOptimalDonation(income), [income])
  const score = useMemo(
    () => getOptimizationScore(donation, optimal),
    [donation, optimal],
  )
  const gap = useMemo(
    () => getDonationGap(income, donation),
    [income, donation],
  )
  const state = getDonationState(score)
  const excessAmount = state === 'above' ? Math.abs(gap) : 0
  const shortfallAmount = state === 'below' ? gap : 0

  const rebate = getTaxRebate(income, donation)
  const netCost = getNetCost(income, donation)
  const discountPct = getEffectiveDiscountRate(income, donation)
  const aboveRate = getAbove200CreditRate(income)
  const abovePct = Math.round(aboveRate * 100)
  const netPerDollarAbove200 = (1 - aboveRate).toFixed(2)

  const optimalRebate = getTaxRebate(income, optimal)
  const optimalNet = getNetCost(income, optimal)
  const optimalDiscount = getEffectiveDiscountRate(income, optimal)

  const firstPortion = Math.min(donation, 200)
  const firstRebate = firstPortion * 0.35
  const aboveAmount = Math.max(0, donation - 200)

  const barWidth = Math.min(score, 100)
  const barFillColor =
    state === 'above' ? COLOR_WARM : COLOR_GIVE

  const progressHelpText = (() => {
    if (donation === 0) {
      return `Start with $201 to unlock a ${abovePct}% tax credit rate`
    }
    if (state === 'below') {
      return `You're ${currency.format(shortfallAmount)} away from your optimal donation`
    }
    if (state === 'optimal') {
      return "You're at your optimal donation — well done 🎉"
    }
    return (
      <>
        <span className="block font-medium" style={{ color: COLOR_WARM }}>
          {score}% of optimal
        </span>
        <span className="mt-1 block" style={{ color: COLOR_WARM }}>
          You&apos;re {currency.format(excessAmount)} above your optimal donation
        </span>
        <span className="mt-1 block text-xs text-text-secondary">
          Your extra {currency.format(excessAmount)} still earns a {abovePct}%
          tax credit — nothing is wasted.
        </span>
      </>
    )
  })()

  const cardBorderColor = state === 'above' ? COLOR_WARM : '#C0392B'

  return (
    <aside className="sticky top-4 space-y-6 rounded-2xl border border-border bg-cream p-6 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-text-primary">
          Quebec tax optimizer
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          See your rebate, net cost, and recommended donation in real time.
        </p>
      </header>

      {/* Section 1: inputs */}
      <section className="space-y-5 rounded-xl border border-border bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Annual income (Quebec)
          </label>
          <p className="mt-0.5 text-xs text-text-secondary">
            Used only to calculate your tax bracket
          </p>
          <input
            type="range"
            min={30_000}
            max={300_000}
            step={1_000}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="mt-3 w-full accent-cherry"
          />
          <p className="mt-2 font-mono text-sm font-semibold text-text-primary">
            ${formatMoneyPlain(income)}
          </p>
          <input
            type="number"
            min={30_000}
            max={300_000}
            step={1_000}
            value={income}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v))
                setIncome(Math.min(300_000, Math.max(30_000, v)))
            }}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary">
            I want to donate
          </label>
          <input
            type="range"
            min={0}
            max={10_000}
            step={50}
            value={donation}
            onChange={(e) => setDonation(Number(e.target.value))}
            className="mt-3 w-full accent-cherry"
          />
          <p className="mt-2 font-mono text-sm font-semibold text-text-primary">
            ${formatMoneyPlain(donation)}
          </p>
          <input
            type="number"
            min={0}
            max={10_000}
            step={50}
            value={donation}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v))
                setDonation(Math.min(10_000, Math.max(0, v)))
            }}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>
      </section>

      {/* Section 2: your breakdown */}
      {donation > 0 ? (
        <section className="space-y-3 rounded-xl border border-border bg-white p-4">
          <h3 className="text-base font-semibold text-text-primary">
            Your donation breakdown
          </h3>
          <div className="overflow-hidden rounded-lg border border-border bg-cream/50">
            <table className="w-full border-collapse font-mono text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 text-text-secondary">
                    Your donation:
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-text-primary">
                    ${formatMoneyPlain(donation)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border-b border-border px-0">
                    <div className="h-px bg-border" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-text-secondary">
                    First ${formatMoneyPlain(firstPortion)} × 35% credit
                  </td>
                  <td className="px-3 py-2 text-right text-text-primary">
                    ${formatMoneyPlain(Math.round(firstRebate))}
                  </td>
                </tr>
                {aboveAmount > 0 ? (
                  <tr>
                    <td className="px-3 py-2 text-text-secondary">
                      Next ${formatMoneyPlain(aboveAmount)} × {abovePct}% credit
                    </td>
                    <td className="px-3 py-2 text-right text-text-primary">
                      $
                      {formatMoneyPlain(
                        Math.round(aboveAmount * aboveRate),
                      )}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td colSpan={2} className="border-b border-border px-0">
                    <div className="h-px bg-border" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-text-primary">
                    Total tax rebate:
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-green-700">
                    ${formatMoneyPlain(rebate)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-gray-500">Net cost to you:</td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    ${formatMoneyPlain(netCost)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-text-secondary">
                    Effective discount:
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="inline-flex rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-800">
                      {discountPct}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed text-text-primary">
            Every $1 you donate above $200 costs you just{' '}
            <strong className="text-cherry">${netPerDollarAbove200}</strong> —
            the government covers the rest.
          </p>
        </section>
      ) : null}

      {/* Section 3: Altru recommends */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-text-primary">
          Altru recommends
        </h3>
        <div
          className="rounded-xl border border-red-100 bg-[#FDF2F2] py-4 pl-5 pr-4"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: cardBorderColor,
            transition: 'border-color 300ms ease',
          }}
        >
          {state === 'above' ? (
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Your donation:</span>
                <span className="text-right font-medium text-text-primary">
                  ${formatMoneyPlain(donation)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Expected rebate:</span>
                <span className="text-right font-medium text-green-700">
                  ${formatMoneyPlain(rebate)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Your net cost:</span>
                <span className="text-right text-gray-500">
                  ${formatMoneyPlain(netCost)}
                </span>
              </div>
              <div className="my-2 border-t border-border" />
              <div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Optimal was:</span>
                  <span className="text-right font-medium text-text-primary">
                    ${formatMoneyPlain(optimal)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-snug text-text-secondary">
                  You&apos;ve donated {currency.format(excessAmount)} more than
                  optimal — and that&apos;s okay.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">
                  Optimal donation for your income:
                </span>
                <span className="text-right font-medium text-text-primary">
                  ${formatMoneyPlain(optimal)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Expected rebate:</span>
                <span className="text-right font-medium text-green-700">
                  ${formatMoneyPlain(optimalRebate)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Your net cost:</span>
                <span className="text-right text-gray-500">
                  ${formatMoneyPlain(optimalNet)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Effective discount:</span>
                <span className="text-right">
                  <span className="inline-flex rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-stone-800">
                    {optimalDiscount}%
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-text-secondary">
            Tax optimization score
          </p>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-cream-dark"
            style={{ height: 10 }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                borderRadius: 999,
                background: barFillColor,
                transition: 'width 300ms ease, background-color 300ms ease',
              }}
            />
          </div>
          <div
            className={`mt-2 text-sm ${
              donation === 0 || state === 'below'
                ? 'text-text-secondary'
                : state === 'optimal'
                  ? 'font-medium text-green-800'
                  : ''
            }`}
          >
            {progressHelpText}
          </div>
        </div>

        {state === 'below' && donation < optimal ? (
          <button
            type="button"
            onClick={() => setDonation(optimal)}
            className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: COLOR_GIVE }}
          >
            Add {currency.format(shortfallAmount)} more to reach optimal →
          </button>
        ) : null}
      </section>

      {/* Section 4: disclaimer */}
      <p className="text-xs leading-relaxed text-text-secondary">
        Tax estimates are based on 2024 Quebec and federal rates. Actual savings
        may vary. This is not tax advice — consult a professional.
      </p>
    </aside>
  )
}
