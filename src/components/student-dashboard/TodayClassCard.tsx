import { Clock, Video } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpcomingSession } from '@/lib/api'
import { formatTime, toIsoDate } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_PRIMARY, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface TodayClassCardProps {
  sessions: UpcomingSession[]
  loading: boolean
  onOpenCalendar?: () => void
  emphasized?: boolean
}

export function TodayClassCard({ sessions, loading, onOpenCalendar, emphasized = false }: TodayClassCardProps) {
  const today = toIsoDate(new Date())
  const todaySession = sessions.find((s) => s.session_date === today)

  return (
    <Card className={cn(emphasized ? DASHBOARD_CARD_PRIMARY : DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Class</h2>
          {onOpenCalendar && (
            <button
              type="button"
              onClick={onOpenCalendar}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Calendar
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3" aria-hidden>
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : !todaySession ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No class scheduled today</p>
            <p className="mt-1 text-xs text-slate-500">Use the calendar to review notes and upcoming sessions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{todaySession.title}</p>
              {todaySession.topic && (
                <p className="mt-1 text-sm text-slate-600">{todaySession.topic}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(todaySession.start_time)} – {formatTime(todaySession.end_time)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 font-medium text-blue-700">
                  <Video className="h-3.5 w-3.5" />
                  Live session
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
