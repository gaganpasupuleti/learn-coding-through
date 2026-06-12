import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

interface SqlExpandRailProps {
  side: 'left' | 'right' | 'bottom'
  label: string
  onExpand: () => void
}

const SIDE_CONFIG = {
  left: {
    icon: ChevronRight,
    className: 'w-7 shrink-0 border-r',
    vertical: true,
  },
  right: {
    icon: ChevronLeft,
    className: 'w-7 shrink-0 border-l',
    vertical: true,
  },
  bottom: {
    icon: ChevronUp,
    className: 'h-7 shrink-0 border-t',
    vertical: false,
  },
} as const

export function SqlExpandRail({ side, label, onExpand }: SqlExpandRailProps) {
  const config = SIDE_CONFIG[side]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        wb.panel,
        wb.border,
        config.className,
        config.vertical ? 'flex-col' : 'flex-row',
      )}
    >
      <button
        type="button"
        onClick={onExpand}
        className={cn(
          'flex items-center justify-center rounded p-1 text-emerald-300 transition-colors hover:bg-emerald-950/40',
          wb.textMuted,
        )}
        aria-label={`Expand ${label}`}
        title={`Show ${label}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  )
}
