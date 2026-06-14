import { Card } from '@/components/ui/card'
import type { PracticeAreaSummary } from '@/lib/practice-progress-summary'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface PracticeProgressCardProps {
  summary: PracticeAreaSummary
  accent: 'blue' | 'violet' | 'teal'
  onOpen?: () => void
}

const ACCENT_BAR: Record<PracticeProgressCardProps['accent'], string> = {
  blue: 'bg-blue-600',
  violet: 'bg-violet-600',
  teal: 'bg-teal-600',
}

export function PracticeProgressCard({ summary, accent, onOpen }: PracticeProgressCardProps) {
  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{summary.label}</h3>
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Open
            </button>
          )}
        </div>

        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-slate-900">{summary.pct}%</span>
          {summary.total > 0 && (
            <span className="text-xs text-slate-500">
              {summary.completed}/{summary.total}
            </span>
          )}
        </div>

        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full transition-all duration-500', ACCENT_BAR[accent])}
            style={{ width: `${summary.pct}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 line-clamp-2">{summary.detail}</p>
      </div>
    </Card>
  )
}
