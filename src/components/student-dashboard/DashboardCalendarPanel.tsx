import { ArrowRight, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'

import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import { toIsoDate, type ReadinessBreakdown } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { CQActionButton, CQCard, CQProgressBar } from './cq/CQKit'
import { CQ_FOCUS } from './cq/cqTheme'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface PlannerCardProps {
  viewMonth: Date
  onViewMonthChange: (month: Date) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  markedDates: Set<string>
  dayPlan: DayLearningPlan | null
  plannerLoading: boolean
  onOpenPlanner: () => void
  className?: string
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

export function PlannerCard({
  viewMonth,
  onViewMonthChange,
  selectedDate,
  onSelectDate,
  markedDates,
  dayPlan,
  plannerLoading,
  onOpenPlanner,
  className,
}: PlannerCardProps) {
  const cells = buildMonthCells(viewMonth)
  const todayIso = toIsoDate(new Date())
  const monthLabel = viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <CQCard className={cn('flex flex-col', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#708090]">
          This month
        </span>
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

      <CQActionButton variant="ghost" className="mt-auto w-full" onClick={onOpenPlanner}>
        Open full planner
        <ArrowRight className="h-3.5 w-3.5" />
      </CQActionButton>
    </CQCard>
  )
}

interface JobReadinessPanelProps {
  readiness: ReadinessBreakdown
  loading: boolean
  onOpenJobs: () => void
  className?: string
}

export function JobReadinessPanel({
  readiness,
  loading,
  onOpenJobs,
  className,
}: JobReadinessPanelProps) {
  return (
    <CQCard className={cn('flex h-full flex-col', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
          <Briefcase className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
          Job readiness
        </h3>
        <span className="rounded-full bg-[#C2CDB0]/45 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-[#3F6212]">
          {loading ? '…' : `${readiness.overall}%`}
        </span>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-5">
        <CQProgressBar label="Resume" value={readiness.resume} />
        <CQProgressBar label="Skills" value={readiness.skill} />
        <CQProgressBar label="Interview" value={readiness.interview} />
        <CQProgressBar label="ATS" value={readiness.ats} />
      </div>
      <CQActionButton variant="ghost" className="mt-3 w-full sm:w-auto sm:self-start" onClick={onOpenJobs}>
        Explore jobs
        <ArrowRight className="h-3.5 w-3.5" />
      </CQActionButton>
    </CQCard>
  )
}
