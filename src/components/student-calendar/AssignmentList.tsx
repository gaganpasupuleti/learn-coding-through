import { CheckCircle2, Circle } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getDemoAssignmentsForDate,
  type CalendarAssignmentDue,
} from '@/components/student-calendar/calendar-demo-data'
import { mergeDeadlines, type DeadlineItem } from '@/lib/dashboard-derive'
import type { UpcomingDeadlines } from '@/lib/api'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface AssignmentListProps {
  selectedDate: string
  deadlines: UpcomingDeadlines
  loading: boolean
}

function AssignmentRow({ item }: { item: CalendarAssignmentDue | DeadlineItem & { type?: string } }) {
  const done = 'done' in item ? item.done : false
  const title = item.title

  return (
    <li className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
      {done ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      )}
      <span className={cn('text-sm', done ? 'text-slate-400 line-through' : 'text-slate-800')}>{title}</span>
    </li>
  )
}

function AssignmentsSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      <li><Skeleton className="h-10 w-full rounded-lg" /></li>
      <li><Skeleton className="h-10 w-full rounded-lg" /></li>
    </ul>
  )
}

export function AssignmentList({ selectedDate, deadlines, loading }: AssignmentListProps) {
  const apiItems = mergeDeadlines(deadlines).filter((d) => d.due === selectedDate)
  const demoItems = getDemoAssignmentsForDate(selectedDate)

  const hasAny = apiItems.length > 0 || demoItems.length > 0

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Assignments due</h2>

        {loading ? (
          <AssignmentsSkeleton />
        ) : !hasAny ? (
          <p className="text-sm text-slate-500">Nothing due on this date.</p>
        ) : (
          <ul className="space-y-2">
            {apiItems.map((item) => (
              <AssignmentRow key={item.key} item={item} />
            ))}
            {demoItems.map((item) => (
              <AssignmentRow key={`demo-${item.title}`} item={item} />
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
