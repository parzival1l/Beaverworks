import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-give-light text-give-dark',
  warning: 'bg-warm-light text-warm',
  danger: 'bg-urgent-light text-urgent',
  info: 'bg-trust-muted text-trust',
  neutral: 'bg-ivory-dark text-charcoal-muted',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
