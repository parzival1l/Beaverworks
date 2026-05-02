import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  label?: string
}

export function BackButton({ to, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="inline-flex items-center gap-2 rounded-full border-2 border-trust bg-transparent px-4 py-2 text-sm font-semibold text-trust hover:bg-trust-muted"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}
