import { useMemo, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTaxRebate } from '../lib/taxCalculator'
import { BackButton } from '../components/ui/BackButton'
import { mockCharities } from '../data/mockCharities'

const donationPresets = [10, 25, 50, 100, 250]

function TrustBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-give-light px-2 py-1 text-give-dark">
      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-give" aria-hidden />
      {children}
    </span>
  )
}

export function PaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const charity = useMemo(() => mockCharities.find((item) => item.id === id), [id])
  const [amount, setAmount] = useState(50)
  const [isMonthly, setIsMonthly] = useState(false)
  const [name, setName] = useState('Demo Donor')
  const [showSuccess, setShowSuccess] = useState(false)
  const estimatedTaxSaved = getTaxRebate(85_000, amount)

  if (!charity) {
    return <p className="p-10 text-charcoal">Charity not found.</p>
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <BackButton to={`/charity/${charity.id}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-trust/20 bg-trust-muted p-6">
          <div className="mb-4 h-14 w-14 rounded-xl bg-trust/15" />
          <h1 className="text-2xl text-charcoal">{charity.organizationName}</h1>
          <p className="mt-3 text-sm text-charcoal-muted">{charity.description}</p>
          <p className="mt-5 rounded-xl bg-white/70 p-4 text-sm text-charcoal">
            Your donation supports measurable outcomes for communities in Quebec
            and across Canada.
          </p>
        </section>

        <section className="rounded-2xl border border-divider bg-ivory-dark p-6">
          <h2 className="text-xl text-charcoal">Complete your donation</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {donationPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  amount === preset
                    ? 'border-trust bg-trust text-white'
                    : 'border-divider bg-ivory-dark text-charcoal'
                }`}
              >
                ${preset}
              </button>
            ))}
            <input
              type="number"
              value={amount}
              min={1}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="w-28 rounded-lg border border-form bg-white px-3 py-2 text-sm text-charcoal focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
            />
          </div>

          <div className="mt-4 inline-flex rounded-lg bg-ivory-dark p-1 ring-1 ring-divider">
            <button
              type="button"
              onClick={() => setIsMonthly(false)}
              className={`rounded-md px-3 py-1 text-sm ${
                !isMonthly
                  ? 'bg-trust font-semibold text-white'
                  : 'text-charcoal-muted'
              }`}
            >
              One-time
            </button>
            <button
              type="button"
              onClick={() => setIsMonthly(true)}
              className={`rounded-md px-3 py-1 text-sm ${
                isMonthly
                  ? 'bg-trust font-semibold text-white'
                  : 'text-charcoal-muted'
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="mt-4 rounded-xl border-l-4 border-trust bg-trust-muted px-4 py-3 text-sm text-trust">
            <p className="text-charcoal">
              As a Quebec resident, you are eligible for a combined federal +
              provincial tax credit of up to 53% on donations above $200.
            </p>
            <p className="mt-2 font-semibold text-give-dark">
              You&apos;ll save approximately ${estimatedTaxSaved.toLocaleString()}{' '}
              in taxes.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              placeholder="Name on card"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-form bg-white px-3 py-2 text-charcoal placeholder:text-charcoal-muted focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
            />
            <input
              placeholder="Card number"
              className="rounded-lg border border-form bg-white px-3 py-2 text-charcoal placeholder:text-charcoal-muted focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Expiry"
                className="rounded-lg border border-form bg-white px-3 py-2 text-charcoal placeholder:text-charcoal-muted focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
              />
              <input
                placeholder="CVV"
                className="rounded-lg border border-form bg-white px-3 py-2 text-charcoal placeholder:text-charcoal-muted focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-charcoal-muted">
            <TrustBadge>Secure payment</TrustBadge>
            <TrustBadge>CRA registered charity</TrustBadge>
            <TrustBadge>Tax receipt issued</TrustBadge>
          </div>

          <button
            type="button"
            onClick={() => setShowSuccess(true)}
            className="mt-6 w-full rounded-xl bg-give px-4 py-3 font-semibold text-white hover:bg-give-dark"
          >
            Complete Donation →
          </button>
        </section>
      </div>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-give-light p-6 text-center">
            <div className="pointer-events-none absolute inset-0 confetti" />
            <div className="relative">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-give text-white">
                <CheckCircle className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="text-2xl font-semibold text-charcoal">
                Thank you {name}!
              </h3>
              <p className="mt-2 text-sm text-charcoal-muted">
                Your donation of ${amount.toLocaleString()} to{' '}
                {charity.organizationName} is confirmed.
              </p>
              <button
                type="button"
                className="mt-5 rounded-lg bg-give px-4 py-2 font-semibold text-white hover:bg-give-dark"
                onClick={() => navigate('/dashboard?mode=all')}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
