interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className="w-full">
      {label ? (
        <p className="mb-2 text-sm font-medium text-charcoal-muted">{label}</p>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-dark">
        <div
          className="h-full rounded-full bg-trust transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}
