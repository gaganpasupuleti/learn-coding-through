import { ChevronDown } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpcomingSession } from '@/lib/api'
import { formatSessionDate, formatTime } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface UpcomingClassesTimelineProps {
  sessions: UpcomingSession[]
  loading: boolean
}

function SessionRow({ session, featured }: { session: UpcomingSession; featured?: boolean }) {
  const dateLabel = formatSessionDate(session.session_date)
  const timeRange = `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`
  const isToday = dateLabel === 'Today'

  if (featured) {
    return (
      <div className="relative rounded-xl border-l-4 border-blue-500 bg-blue-50/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{session.title}</p>
            {session.topic && (
              <p className="mt-1 text-sm text-slate-600">{session.topic}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">{timeRange}</p>
          </div>
          <div className="shrink-0 text-right">
            {isToday ? (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Join soon
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-600">{dateLabel}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <li className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{session.title}</p>
        {session.topic && (
          <p className="truncate text-xs text-slate-500">{session.topic}</p>
        )}
      </div>
      <div className="shrink-0 text-right text-xs text-slate-500">
        <span className="block font-medium">{dateLabel}</span>
        <span className="tabular-nums">{timeRange}</span>
      </div>
    </li>
  )
}

export function UpcomingClassesTimeline({ sessions, loading }: UpcomingClassesTimelineProps) {
  const [next, ...rest] = sessions

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Upcoming Classes</h2>

        {loading ? (
          <div className="space-y-3" aria-hidden>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No upcoming classes scheduled.
          </p>
        ) : (
          <div className="space-y-4">
            {next && <SessionRow session={next} featured />}
            {rest.length > 0 && (
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  {rest.length} more class{rest.length === 1 ? '' : 'es'}
                </summary>
                <ul className="mt-2 pl-1">
                  {rest.map((s) => (
                    <SessionRow key={s.id} session={s} />
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
