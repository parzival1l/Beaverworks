import type { Charity } from '../../types/charity'
import { Badge } from '../ui/Badge'

interface CharityCardProps {
  charity: Charity
  onSelect: (id: string) => void
  /** When present, rendered as the "why this matches" callout (RAG result). */
  rationale?: string
  /** 0..1, rendered as a small badge when present. */
  score?: number
}

export function CharityCard({
  charity,
  onSelect,
  rationale,
  score,
}: CharityCardProps) {
  return (
    <article
      data-testid={`charity-card-${charity.id}`}
      className="cursor-pointer rounded-2xl border border-divider bg-ivory-dark p-5 shadow-sm transition hover:shadow-md"
      onClick={() => onSelect(charity.id)}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-charcoal">
          {charity.organizationName}
        </h3>
        <div className="flex items-center gap-2">
          {typeof score === 'number' ? (
            <Badge variant="info">{`${Math.round(score * 100)}% match`}</Badge>
          ) : null}
          <Badge variant="info">{charity.category}</Badge>
        </div>
      </div>
      <p className="mb-1 text-sm text-text-secondary">{charity.city}</p>
      {rationale ? (
        <p
          data-testid={`charity-rationale-${charity.id}`}
          className="mb-3 rounded-lg border border-border bg-cream px-3 py-2 text-sm italic text-text-secondary"
        >
          Why this matches: {rationale}
        </p>
      ) : null}
      <p className="mb-4 text-sm text-text-secondary">
        {charity.description}
      </p>
      <button
        className="text-sm font-semibold text-trust-light underline decoration-transparent hover:text-trust hover:underline"
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
