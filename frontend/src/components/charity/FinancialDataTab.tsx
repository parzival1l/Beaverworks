import type { FinancialData } from '../../types/charity'

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

interface FinancialDataTabProps {
  financial: FinancialData
}

export function FinancialDataTab({ financial }: FinancialDataTabProps) {
  const totalOperational =
    financial.charitableExpenditure +
    financial.fundraisingExpenditure +
    financial.managementExpenditure

  const charitableShare = (financial.charitableExpenditure / totalOperational) * 100
  const fundraisingShare =
    (financial.fundraisingExpenditure / totalOperational) * 100
  const managementShare = (financial.managementExpenditure / totalOperational) * 100

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Fiscal year end: {financial.fiscalYearEnd}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Total Revenue"
          value={currencyFormatter.format(financial.totalRevenue)}
        />
        <MetricCard
          label="Total Expenses"
          value={currencyFormatter.format(financial.totalExpenses)}
        />
        <MetricCard
          label="Total Assets"
          value={currencyFormatter.format(financial.totalAssets)}
        />
        <MetricCard
          label="Total Liabilities"
          value={currencyFormatter.format(financial.totalLiabilities)}
        />
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-text-primary">
          Expenditure breakdown
        </h4>
        <div className="flex h-5 overflow-hidden rounded-full bg-cream-dark">
          <div
            className="bg-success"
            style={{ width: `${charitableShare}%` }}
            title={`Charitable ${charitableShare.toFixed(1)}%`}
          />
          <div
            className="bg-warning"
            style={{ width: `${fundraisingShare}%` }}
            title={`Fundraising ${fundraisingShare.toFixed(1)}%`}
          />
          <div
            className="bg-cherry"
            style={{ width: `${managementShare}%` }}
            title={`Management ${managementShare.toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}
