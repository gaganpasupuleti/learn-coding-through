import { useMemo } from 'react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpcomingDeadlines } from '@/lib/api'
import {
  bucketDeadlines,
  formatSessionDate,
  mergeDeadlines,
  toIsoDate,
  type DeadlineItem,
} from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface DeadlinesTaskBoardProps {
  deadlines: UpcomingDeadlines
  loading: boolean
}

function deadlineBorder(item: DeadlineItem, today: string): string {
  if (item.done) return 'border-emerald-400'
  if (item.due < today) return 'border-red-400'
  if (item.due === today) return 'border-amber-400'
  return 'border-blue-400'
}

function DeadlineColumn({
  title,
  items,
  today,
  emptyLabel,
}: {
  title: string
  items: DeadlineItem[]
  today: string
  emptyLabel: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
        {items.length > 0 && (
          <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-600">
            {items.length}
          </span>
        )}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className={cn(
                'rounded-lg border-l-[3px] bg-slate-50/80 px-3 py-2.5',
                deadlineBorder(item, today),
              )}
            >
              <p
                className={cn(
                  'truncate text-sm font-medium',
                  item.done ? 'text-slate-400 line-through' : 'text-slate-800',
                )}
              >
                {item.title}
              </p>
              {!item.done && (
                <p className="mt-0.5 text-xs text-slate-500">{formatSessionDate(item.due)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DeadlinesTaskBoard({ deadlines, loading }: DeadlinesTaskBoardProps) {
  const today = toIsoDate(new Date())
  const buckets = useMemo(() => bucketDeadlines(mergeDeadlines(deadlines)), [deadlines])
  const hasAny =
    buckets.today.length + buckets.thisWeek.length + buckets.completed.length > 0

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Deadlines</h2>

        {loading ? (
          <div className="flex flex-col gap-4 md:flex-row" aria-hidden>
            <Skeleton className="h-32 flex-1 rounded-lg" />
            <Skeleton className="h-32 flex-1 rounded-lg" />
            <Skeleton className="h-32 flex-1 rounded-lg" />
          </div>
        ) : !hasAny ? (
          <p className="py-6 text-center text-sm text-slate-500">No deadlines set yet.</p>
        ) : (
          <div className="flex flex-col gap-6 md:flex-row md:gap-4">
            <DeadlineColumn
              title="Due Today"
              items={buckets.today}
              today={today}
              emptyLabel="Nothing due today"
            />
            <DeadlineColumn
              title="This Week"
              items={buckets.thisWeek}
              today={today}
              emptyLabel="Clear for the week"
            />
            <DeadlineColumn
              title="Completed"
              items={buckets.completed}
              today={today}
              emptyLabel="None completed yet"
            />
          </div>
        )}
      </div>
    </Card>
  )
}
