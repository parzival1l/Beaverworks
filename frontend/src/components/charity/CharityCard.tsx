import type { Charity } from '../../types/charity'
import { Badge } from '../ui/Badge'

interface CharityCardProps {
  charity: Charity
  onSelect: (id: string) => void
}

export function CharityCard({ charity, onSelect }: CharityCardProps) {
  return (
    <article
      className="cursor-pointer rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md"
      onClick={() => onSelect(charity.id)}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{charity.organizationName}</h3>
        <Badge variant="info">{charity.category}</Badge>
      </div>
      <p className="mb-1 text-sm text-text-secondary">{charity.city}</p>
      <p className="mb-4 text-sm text-text-secondary">
        {charity.description}
      </p>
      <button
        className="text-sm font-semibold text-cherry hover:text-cherry-dark"
        onClick={(event) => {
          event.stopPropagation()
          onSelect(charity.id)
        }}
      >
        Learn more →
      </button>
    </article>
  )
}
