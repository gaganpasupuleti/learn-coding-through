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

const TYPE_LABEL: Record<CalendarAssignmentDue['type'], string> = {
  quiz: 'Quiz',
  project: 'Project',
  practice: 'Practice',
}

function AssignmentRow({
  item,
  type,
}: {
  item: CalendarAssignmentDue | DeadlineItem & { type?: string }
  type?: CalendarAssignmentDue['type']
}) {
  const done = 'done' in item ? item.done : false
  const title = item.title

  return (
    <li className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      {done ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <span className={cn('text-sm', done ? 'text-slate-400 line-through' : 'text-slate-800')}>
          {title}
        </span>
        {type && (
          <span className="mt-0.5 block text-xs text-slate-500">{TYPE_LABEL[type]}</span>
        )}
      </div>
    </li>
  )
}

function AssignmentsSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      <li><Skeleton className="h-12 w-full rounded-lg" /></li>
      <li><Skeleton className="h-12 w-full rounded-lg" /></li>
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
        {loading ? (
          <AssignmentsSkeleton />
        ) : !hasAny ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No assignments due this day</p>
            <p className="mt-1 text-xs text-slate-500">
              Check nearby dates on the calendar for upcoming quizzes and projects.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {apiItems.map((item) => (
              <AssignmentRow key={item.key} item={item} />
            ))}
            {demoItems.map((item) => (
              <AssignmentRow key={`demo-${item.title}`} item={item} type={item.type} />
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
