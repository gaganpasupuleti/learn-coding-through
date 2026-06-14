import { CalendarDays, Clock } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpcomingSession } from '@/lib/api'
import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import { formatSessionDate, formatTime, toIsoDate } from '@/lib/dashboard-derive'
import {
  getDemoAssignmentsForDate,
  getDemoNotesForDate,
  getDemoResourcesForDate,
} from '@/components/student-calendar/calendar-demo-data'
import { DASHBOARD_CARD_PRIMARY, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface SelectedDaySummaryProps {
  selectedDate: string
  sessions: UpcomingSession[]
  dayPlan: DayLearningPlan | null
  loading: boolean
}

function formatLongDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function SelectedDaySummary({
  selectedDate,
  sessions,
  dayPlan,
  loading,
}: SelectedDaySummaryProps) {
  const today = toIsoDate(new Date())
  const session = sessions.find((s) => s.session_date === selectedDate)
  const relativeLabel = formatSessionDate(selectedDate)
  const note = getDemoNotesForDate(selectedDate)
  const assignmentCount = getDemoAssignmentsForDate(selectedDate).length
  const resourceCount = getDemoResourcesForDate(selectedDate).length

  const hasClass = Boolean(session)
  const hasFocus = Boolean(dayPlan?.topic || note)
  const hasWork = assignmentCount > 0 || resourceCount > 0

  return (
    <Card className={cn(DASHBOARD_CARD_PRIMARY)}>
      <div className={DASHBOARD_CARD_BODY}>
        {loading ? (
          <div className="space-y-3" aria-hidden>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Selected day
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{formatLongDate(selectedDate)}</h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  {relativeLabel}
                  {selectedDate === today ? ' · Today' : ''}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 shrink-0 text-blue-600/80" aria-hidden />
            </div>

            {session ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{session.title}</p>
                {session.topic && (
                  <p className="mt-0.5 text-sm text-slate-600">{session.topic}</p>
                )}
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {formatTime(session.start_time)} – {formatTime(session.end_time)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No live class scheduled for this day.</p>
            )}

            {(hasFocus || hasWork) && (
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                {dayPlan?.topic && (
                  <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                    <dt className="text-xs text-slate-500">Focus</dt>
                    <dd className="font-medium text-slate-800">{dayPlan.topic}</dd>
                  </div>
                )}
                {note && !dayPlan?.topic && (
                  <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                    <dt className="text-xs text-slate-500">Notes</dt>
                    <dd className="font-medium text-slate-800">{note.title}</dd>
                  </div>
                )}
                <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                  <dt className="text-xs text-slate-500">Assignments</dt>
                  <dd className="font-medium tabular-nums text-slate-800">{assignmentCount}</dd>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                  <dt className="text-xs text-slate-500">Resources</dt>
                  <dd className="font-medium tabular-nums text-slate-800">{resourceCount}</dd>
                </div>
              </dl>
            )}

            {!hasClass && !hasFocus && !hasWork && (
              <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                Pick another date on the calendar to see class notes, assignments, and materials.
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
