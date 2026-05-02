import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FinancialDataTab } from '../components/charity/FinancialDataTab'
import { Badge } from '../components/ui/Badge'
import { BackButton } from '../components/ui/BackButton'
import { mockCharities } from '../data/mockCharities'

export function CharityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'financial'>('overview')
  const charity = useMemo(() => mockCharities.find((item) => item.id === id), [id])

  if (!charity) {
    return <p className="p-10">Charity not found.</p>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl">{charity.organizationName}</h1>
          <Badge variant={charity.charityStatus === 'Active' ? 'success' : 'danger'}>
            {charity.charityStatus}
          </Badge>
        </div>

        <div className="mb-5 flex gap-3">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === 'overview' ? 'bg-cherry text-white' : 'bg-cream'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setTab('financial')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === 'financial' ? 'bg-cherry text-white' : 'bg-cream'
            }`}
          >
            Financial Data
          </button>
        </div>

        {tab === 'overview' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="BN / Registration Number" value={charity.bnRegistrationNumber} />
            <Field label="Organization Name" value={charity.organizationName} />
            <Field label="Charity Status" value={charity.charityStatus} />
            <Field label="Type of Qualified Donee" value={charity.typeOfQualifiedDonee} />
            <Field label="Effective Date of Status" value={charity.effectiveDateOfStatus} />
            <Field label="Description" value={charity.description} />
            <Field label="Sanction" value={charity.sanction} />
            <Field label="Designation" value={charity.designation} />
            <Field label="Charity Type" value={charity.charityType} />
            <Field label="Category" value={charity.category} />
            <Field label="Address" value={charity.address} />
            <Field label="City" value={charity.city} />
            <Field label="Province / Territory" value={charity.provinceTerritory} />
            <Field label="Country" value={charity.country} />
            <Field label="Postal Code" value={charity.postalCode} />
          </div>
        ) : (
          <FinancialDataTab financial={charity.financial} />
        )}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button
          type="button"
          onClick={() => navigate(`/payment/${charity.id}`)}
          className="w-full rounded-xl bg-cherry px-4 py-3 text-lg font-semibold text-white hover:bg-cherry-dark"
        >
          Donate to {charity.organizationName} →
        </button>
      </div>
    </main>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream p-3">
      <p className="text-xs font-semibold uppercase text-text-secondary">{label}</p>
      <p className="mt-1 text-sm text-text-primary">{value}</p>
    </div>
  )
}
