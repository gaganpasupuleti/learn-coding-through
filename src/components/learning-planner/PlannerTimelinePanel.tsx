import { Card } from '@/components/ui/card'
import type { PlannerTimelineItem } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import { EVENT_BADGE, EVENT_COLORS, PLANNER_BODY, PLANNER_CARD } from './planner-styles'

interface PlannerTimelinePanelProps {
  timeline: PlannerTimelineItem[]
  loading: boolean
  onEventClick: (item: PlannerTimelineItem) => void
  compact?: boolean
  id?: string
}

const STATUS_DOT: Record<PlannerTimelineItem['status'], string> = {
  done: 'bg-emerald-400',
  pending: 'bg-blue-400',
  overdue: 'bg-red-400',
}

export function PlannerTimelinePanel({
  timeline,
  loading,
  onEventClick,
  compact = false,
  id,
}: PlannerTimelinePanelProps) {
  return (
    <Card className={cn(PLANNER_CARD, 'flex h-full flex-col overflow-hidden')} id={id}>
      <div className={cn(PLANNER_BODY, 'flex min-h-0 flex-1 flex-col')}>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Day timeline</h3>

        {loading ? (
          <p className="text-sm text-slate-500">Loading timeline…</p>
        ) : timeline.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            No scheduled items — use this day for self-study from your roadmap.
          </p>
        ) : (
          <ol
            className={cn(
              'relative min-h-0 flex-1 space-y-2 overflow-y-auto border-l-2 border-slate-200 pl-4',
              compact && 'max-h-[min(420px,calc(100vh-42vh-8rem))]',
            )}
          >
            {timeline.map((item) => (
              <li key={item.id} className="relative">
                <span
                  className={cn(
                    'absolute -left-[calc(1rem+5px)] top-2.5 h-2 w-2 rounded-full ring-2 ring-white',
                    STATUS_DOT[item.status],
                  )}
                />
                <button
                  type="button"
                  onClick={() => onEventClick(item)}
                  className={cn(
                    'w-full rounded-lg border-l-4 text-left transition-shadow hover:shadow-sm',
                    compact ? 'p-2.5' : 'p-4',
                    EVENT_COLORS[item.kind] ?? 'border-l-slate-400 bg-slate-50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase',
                          EVENT_BADGE[item.kind],
                        )}
                      >
                        {item.kind}
                      </span>
                      <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    </div>
                    <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
                      {item.timeLabel} · {item.durationMinutes}m
                    </span>
                  </div>
                  {item.subtitle && !compact && (
                    <p className="mt-0.5 truncate text-xs text-slate-600">{item.subtitle}</p>
                  )}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  )
}
