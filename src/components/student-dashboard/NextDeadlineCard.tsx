import { CalendarClock } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpcomingDeadlines } from '@/lib/api'
import {
  formatSessionDate,
  mergeDeadlines,
  toIsoDate,
  type DeadlineItem,
} from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import {
  DASHBOARD_CARD_PRIMARY,
  DASHBOARD_CARD_BODY,
} from './dashboard-styles'

interface NextDeadlineCardProps {
  deadlines: UpcomingDeadlines
  loading: boolean
}

function pickNextDeadline(deadlines: UpcomingDeadlines): DeadlineItem | null {
  const pending = mergeDeadlines(deadlines).filter((item) => !item.done)
  if (pending.length === 0) return null

  const today = toIsoDate(new Date())
  const overdue = pending.filter((item) => item.due < today)
  if (overdue.length > 0) return overdue[0]

  const dueToday = pending.filter((item) => item.due === today)
  if (dueToday.length > 0) return dueToday[0]

  return pending[0]
}

function urgencyClass(due: string): string {
  const today = toIsoDate(new Date())
  if (due < today) return 'text-red-700 bg-red-50 ring-red-100'
  if (due === today) return 'text-amber-800 bg-amber-50 ring-amber-100'
  return 'text-blue-800 bg-blue-50 ring-blue-100'
}

export function NextDeadlineCard({ deadlines, loading }: NextDeadlineCardProps) {
  const next = pickNextDeadline(deadlines)

  return (
    <Card className={cn(DASHBOARD_CARD_PRIMARY, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900">Next deadline</h2>
        </div>

        {loading ? (
          <div className="space-y-3" aria-hidden>
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : !next ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
            <p className="text-sm font-medium text-slate-700">No upcoming deadlines</p>
            <p className="mt-1 text-xs text-slate-500">Focus on practice and today&apos;s class.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                urgencyClass(next.due),
              )}
            >
              {formatSessionDate(next.due)}
            </span>
            <p className="text-base font-semibold leading-snug text-slate-900">{next.title}</p>
            <p className="text-xs text-slate-500 tabular-nums">Due {next.due}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
