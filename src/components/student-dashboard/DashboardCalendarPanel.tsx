import { ArrowRight, Briefcase, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import type { UpcomingSession } from '@/lib/api'
import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import { formatTime, toIsoDate, type ReadinessBreakdown } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { CQActionButton, CQCard, CQProgressBar } from './cq/CQKit'
import { CQ_FOCUS, CQ_TONE_SOFT, type CQTone } from './cq/cqTheme'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const TIMELINE_TONES: CQTone[] = ['yellow', 'pink', 'sage', 'blue', 'lavender']

interface DashboardCalendarPanelProps {
  viewMonth: Date
  onViewMonthChange: (month: Date) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  markedDates: Set<string>
  dayPlan: DayLearningPlan | null
  plannerLoading: boolean
  onOpenPlanner: () => void
  sessions: UpcomingSession[]
  readiness: ReadinessBreakdown
  loading: boolean
  onOpenJobs: () => void
}

function buildMonthCells(viewMonth: Date): (string | null)[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(toIsoDate(new Date(year, month, d)))
  return cells
}

export function DashboardCalendarPanel({
  viewMonth,
  onViewMonthChange,
  selectedDate,
  onSelectDate,
  markedDates,
  dayPlan,
  plannerLoading,
  onOpenPlanner,
  sessions,
  readiness,
  loading,
  onOpenJobs,
}: DashboardCalendarPanelProps) {
  const cells = buildMonthCells(viewMonth)
  const todayIso = toIsoDate(new Date())
  const monthLabel = viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const timeline = sessions.slice(0, 4)

  return (
    <aside className="space-y-3.5">
      {/* Calendar */}
      <CQCard>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
            <CalendarDays className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
            Learning Planner
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className={cn('grid h-7 w-7 place-items-center rounded-full text-[#374151] hover:bg-[#0A1020]/6', CQ_FOCUS)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[92px] text-center text-[12px] font-semibold text-[#374151]">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className={cn('grid h-7 w-7 place-items-center rounded-full text-[#374151] hover:bg-[#0A1020]/6', CQ_FOCUS)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
          {WEEKDAYS.map((d, i) => (
            <span key={`${d}-${i}`} className="py-0.5 font-semibold text-[#708090]">
              {d}
            </span>
          ))}
          {cells.map((iso, i) =>
            iso === null ? (
              <span key={`empty-${i}`} />
            ) : (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDate(iso)}
                className={cn(
                  'relative mx-auto grid h-7 w-7 place-items-center rounded-full text-[12px] transition-colors',
                  CQ_FOCUS,
                  iso === selectedDate
                    ? 'bg-[#0A1020] font-semibold text-[#FAF3E0]'
                    : iso === todayIso
                      ? 'font-semibold text-[#1D4ED8]'
                      : 'text-[#374151] hover:bg-[#0A1020]/6',
                )}
              >
                {Number(iso.slice(-2))}
                {markedDates.has(iso) && iso !== selectedDate && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#14B8A6]" />
                )}
              </button>
            ),
          )}
        </div>

        <div className="mt-3 rounded-xl border border-[#708090]/15 bg-[#FAF3E0]/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#708090]">
            Selected day focus
          </p>
          {plannerLoading ? (
            <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-[#0A1020]/8" aria-hidden />
          ) : (
            <p className="mt-1 text-sm font-medium text-[#111827]">
              {dayPlan?.topic ?? 'Select a date to preview'}
            </p>
          )}
          {dayPlan && !plannerLoading && (
            <p className="mt-1 text-[12px] text-[#708090]">{dayPlan.estimatedMinutes} min estimated</p>
          )}
        </div>

        <CQActionButton variant="ghost" className="mt-3 w-full" onClick={onOpenPlanner}>
          Open full planner
          <ArrowRight className="h-3.5 w-3.5" />
        </CQActionButton>
      </CQCard>

      {/* Today's timeline */}
      {timeline.length > 0 && (
        <CQCard>
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">Upcoming timeline</h3>
          <div className="relative space-y-2 pl-3">
            <span
              aria-hidden
              className="absolute bottom-1.5 left-1 top-1.5 border-l border-dotted border-[#708090]/40"
            />
            {timeline.map((s, i) => (
              <div key={s.id} className="relative">
                <span className="absolute -left-[7px] top-2 h-2 w-2 rounded-full bg-[#0A1020]/60" />
                <div
                  className={cn(
                    'ml-3 rounded-lg border border-[#708090]/15 px-3 py-1.5',
                    CQ_TONE_SOFT[TIMELINE_TONES[i % TIMELINE_TONES.length]],
                  )}
                >
                  <p className="text-[12px] font-semibold text-[#111827]">{s.title}</p>
                  <p className="text-[11px] text-[#708090]">{formatTime(s.start_time)}</p>
                </div>
              </div>
            ))}
          </div>
        </CQCard>
      )}

      {/* Job readiness */}
      <CQCard>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
            <Briefcase className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
            Job readiness
          </h3>
          <span className="rounded-full bg-[#C2CDB0]/45 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-[#3F6212]">
            {loading ? '…' : `${readiness.overall}%`}
          </span>
        </div>
        <div className="space-y-1.5">
          <CQProgressBar label="Resume" value={readiness.resume} />
          <CQProgressBar label="Skills" value={readiness.skill} />
          <CQProgressBar label="Interview" value={readiness.interview} />
          <CQProgressBar label="ATS" value={readiness.ats} />
        </div>
        <CQActionButton variant="ghost" className="mt-3 w-full" onClick={onOpenJobs}>
          Explore jobs
          <ArrowRight className="h-3.5 w-3.5" />
        </CQActionButton>
      </CQCard>
    </aside>
  )
}
