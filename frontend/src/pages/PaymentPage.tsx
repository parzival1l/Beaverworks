import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTaxRebate } from '../lib/taxCalculator'
import { BackButton } from '../components/ui/BackButton'
import { mockCharities } from '../data/mockCharities'

const donationPresets = [10, 25, 50, 100, 250]

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
    return <p className="p-10">Charity not found.</p>
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <BackButton to={`/charity/${charity.id}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-4 h-14 w-14 rounded-xl bg-cream-dark" />
          <h1 className="text-2xl">{charity.organizationName}</h1>
          <p className="mt-3 text-sm text-text-secondary">{charity.description}</p>
          <p className="mt-5 rounded-xl bg-cream p-4 text-sm">
            Your donation supports measurable outcomes for communities in Quebec
            and across Canada.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-xl">Complete your donation</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {donationPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  amount === preset ? 'bg-cherry text-white' : 'bg-cream'
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
              className="w-28 rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 inline-flex rounded-lg bg-cream p-1">
            <button
              type="button"
              onClick={() => setIsMonthly(false)}
              className={`rounded-md px-3 py-1 text-sm ${
                !isMonthly ? 'bg-white font-semibold' : ''
              }`}
            >
              One-time
            </button>
            <button
              type="button"
              onClick={() => setIsMonthly(true)}
              className={`rounded-md px-3 py-1 text-sm ${
                isMonthly ? 'bg-white font-semibold' : ''
              }`}
            >
              Monthly
            </button>
          </div>

          <p className="mt-4 text-sm text-text-secondary">
            As a Quebec resident, you are eligible for a combined federal +
            provincial tax credit of up to 53% on donations above $200.
          </p>
          <p className="mt-2 text-sm font-semibold">
            You&apos;ll save approximately ${estimatedTaxSaved.toLocaleString()} in
            taxes.
          </p>

          <div className="mt-4 grid gap-3">
            <input
              placeholder="Name on card"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-border px-3 py-2"
            />
            <input
              placeholder="Card number"
              className="rounded-lg border border-border px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Expiry"
                className="rounded-lg border border-border px-3 py-2"
              />
              <input
                placeholder="CVV"
                className="rounded-lg border border-border px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 text-xs text-text-secondary">
            <span className="rounded-full bg-cream px-2 py-1">Secure payment</span>
            <span className="rounded-full bg-cream px-2 py-1">
              CRA registered charity
            </span>
            <span className="rounded-full bg-cream px-2 py-1">Tax receipt issued</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSuccess(true)}
            className="mt-6 w-full rounded-xl bg-cherry px-4 py-3 font-semibold text-white"
          >
            Complete Donation →
          </button>
        </section>
      </div>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-center">
            <div className="pointer-events-none absolute inset-0 confetti" />
            <h3 className="text-2xl font-semibold text-cherry">Thank you {name}!</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Your donation of ${amount.toLocaleString()} to{' '}
              {charity.organizationName} is confirmed.
            </p>
            <button
              type="button"
              className="mt-5 rounded-lg bg-cherry px-4 py-2 font-semibold text-white"
              onClick={() => navigate('/dashboard?mode=all')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
