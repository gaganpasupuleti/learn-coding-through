import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SqlPaneCollapseButtonProps {
  side: 'left' | 'right' | 'bottom'
  onClick: () => void
  label: string
}

const ICON = {
  left: ChevronLeft,
  right: ChevronRight,
  bottom: ChevronDown,
} as const

export function SqlPaneCollapseButton({ side, onClick, label }: SqlPaneCollapseButtonProps) {
  const Icon = ICON[side]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1a2332] hover:text-emerald-200',
      )}
      aria-label={`Collapse ${label}`}
      title={`Hide ${label}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
