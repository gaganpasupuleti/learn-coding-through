import { useMemo } from 'react'
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  Clock3,
  GraduationCap,
  ListChecks,
} from 'lucide-react'

import type { StageProgressRecord, UpcomingDeadlines, UpcomingSession } from '@/lib/api'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import {
  bucketDeadlines,
  deriveStageJourneyFallback,
  formatSessionDate,
  formatTime,
  mergeDeadlines,
  toIsoDate,
  type DeadlineItem,
} from '@/lib/dashboard-derive'
import type { PracticeAreaSummary } from '@/lib/practice-progress-summary'
import { cn } from '@/lib/utils'

import { CQActionButton, CQCard, CQInlineLink, CQProgressBar } from './cq/CQKit'
import { CQ_TONE_SOFT, type CQTone } from './cq/cqTheme'

function CQSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-[#0A1020]/8', className)} aria-hidden />
}

/* ------------------------------------------------------------------ Today */

export function TodayPanel({
  sessions,
  deadlines,
  loading,
  onOpenCalendar,
}: {
  sessions: UpcomingSession[]
  deadlines: UpcomingDeadlines
  loading: boolean
  onOpenCalendar: () => void
}) {
  const nextSession = sessions[0]
  const todayLabel = nextSession ? formatSessionDate(nextSession.session_date) : null
  const isToday = todayLabel === 'Today'

  const nextDeadline = useMemo(
    () => mergeDeadlines(deadlines).find((d) => !d.done) ?? null,
    [deadlines],
  )

  return (
    <div className="grid min-w-0 gap-3 grid-cols-1 md:grid-cols-2">
      <CQCard className="flex min-w-0 flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[#111827]">
            <CalendarClock className="h-4 w-4 shrink-0 text-[#0A1020]/70" strokeWidth={1.75} />
            {isToday ? "Today's class" : 'Next class'}
          </h3>
          <CQInlineLink onClick={onOpenCalendar}>Calendar</CQInlineLink>
        </div>
        {loading ? (
          <CQSkeleton className="h-20 w-full" />
        ) : nextSession ? (
          <div className={cn('rounded-xl border border-[#708090]/15 p-3', CQ_TONE_SOFT.yellow)}>
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-sm font-semibold text-[#111827]">{nextSession.title}</p>
              <span className="shrink-0 rounded-full bg-[#0A1020]/8 px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
                {todayLabel}
              </span>
            </div>
            {nextSession.topic && (
              <p className="mt-1 text-[13px] text-[#4B5563]">{nextSession.topic}</p>
            )}
            <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[#374151]">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(nextSession.start_time)} – {formatTime(nextSession.end_time)}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#708090]/30 p-4 text-center">
            <p className="text-sm font-medium text-[#374151]">No class scheduled today</p>
            <p className="mt-1 text-[12px] text-[#708090]">
              Use the calendar to review notes and upcoming sessions.
            </p>
          </div>
        )}
      </CQCard>

      <CQCard className="flex flex-col">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-[#111827]">Next deadline</h3>
        </div>
        {loading ? (
          <CQSkeleton className="h-20 w-full" />
        ) : nextDeadline ? (
          <div className="rounded-xl border-l-[3px] border-[#2563EB] bg-[#B8C9E8]/30 p-3">
            <span className="inline-flex rounded-full bg-[#0A1020]/8 px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
              {formatSessionDate(nextDeadline.due)}
            </span>
            <p className="mt-2 text-sm font-semibold text-[#111827]">{nextDeadline.title}</p>
            <p className="mt-1 text-[12px] text-[#708090]">Due {nextDeadline.due}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#708090]/30 p-4 text-center">
            <p className="text-sm font-medium text-[#374151]">You&apos;re all caught up</p>
            <p className="mt-1 text-[12px] text-[#708090]">No upcoming deadlines.</p>
          </div>
        )}
      </CQCard>
    </div>
  )
}

/* --------------------------------------------------------------- Practice */

const PRACTICE_DOT: Record<string, string> = {
  blue: 'bg-[#2563EB]',
  violet: 'bg-[#7C3AED]',
  teal: 'bg-[#14B8A6]',
}

function PracticeCard({
  summary,
  dot,
  onOpen,
}: {
  summary: PracticeAreaSummary
  dot: keyof typeof PRACTICE_DOT
  onOpen: () => void
}) {
  return (
    <CQCard interactive className="flex h-full flex-col">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111827]">
          <span className={cn('h-2 w-2 flex-shrink-0 rounded-full', PRACTICE_DOT[dot])} />
          {summary.label}
        </h3>
        <CQInlineLink onClick={onOpen}>Open</CQInlineLink>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[22px] font-bold leading-none tabular-nums text-[#111827]">{summary.pct}%</span>
        <span className="text-[11px] text-[#708090]">{summary.completed}/{summary.total}</span>
      </div>
      <CQProgressBar value={summary.pct} className="mt-2" />
      <p className="mt-1.5 text-[11px] leading-snug text-[#708090]">{summary.detail}</p>
    </CQCard>
  )
}

export function PracticeProgressGrid({
  sql,
  code,
  typing,
  onPracticeSql,
  onPracticeCode,
  onPracticeTyping,
}: {
  sql: PracticeAreaSummary
  code: PracticeAreaSummary
  typing: PracticeAreaSummary
  onPracticeSql: () => void
  onPracticeCode: () => void
  onPracticeTyping: () => void
}) {
  return (
    <div className="grid h-full min-w-0 gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      <PracticeCard summary={sql} dot="blue" onOpen={onPracticeSql} />
      <PracticeCard summary={code} dot="violet" onOpen={onPracticeCode} />
      <PracticeCard summary={typing} dot="teal" onOpen={onPracticeTyping} />
    </div>
  )
}

/* --------------------------------------------------------------- Progress */

export function ProgressPanel({
  careerJourney,
  stageRows,
  catalogSteps,
  loading,
  onViewProgress,
}: {
  careerJourney: CareerJourneySummary | null
  stageRows: StageProgressRecord[] | null
  catalogSteps: number | null
  loading: boolean
  onViewProgress: () => void
}) {
  const fallback = !careerJourney && stageRows ? deriveStageJourneyFallback(stageRows) : null
  const progressPct = careerJourney?.pct ?? fallback?.progressPct ?? 0
  const stageLabel = careerJourney?.currentStageLabel ?? fallback?.currentStageLabel ?? 'Program'
  const stageCount = stageRows?.length ?? 0
  const stagesComplete =
    stageRows?.filter((r) => r.total_lessons > 0 && r.lessons_completed >= r.total_lessons).length ??
    0

  return (
    <CQCard className="flex flex-col">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Overall progress</h3>
          <p className="text-[12px] text-[#708090]">{stageLabel}</p>
        </div>
        <CQInlineLink onClick={onViewProgress}>Details</CQInlineLink>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-[34px] font-bold leading-none tabular-nums text-[#111827]">
          {loading ? '…' : `${progressPct}%`}
        </span>
        <span className="pb-1 text-[12px] text-[#708090]">course complete</span>
      </div>
      <CQProgressBar value={progressPct} className="mt-3" />
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-[#708090]/15 bg-[#FAF3E0]/60 px-3 py-2">
          <dt className="text-[12px] text-[#708090]">Modules</dt>
          <dd className="font-semibold tabular-nums text-[#111827]">
            {loading ? '—' : `${stagesComplete}/${stageCount || '—'}`}
          </dd>
        </div>
        <div className="rounded-lg border border-[#708090]/15 bg-[#FAF3E0]/60 px-3 py-2">
          <dt className="text-[12px] text-[#708090]">Catalog steps</dt>
          <dd className="font-semibold tabular-nums text-[#111827]">
            {loading ? '—' : catalogSteps ?? 0}
          </dd>
        </div>
      </dl>
    </CQCard>
  )
}

/* ------------------------------------------------------ Upcoming classes */

function SessionRow({ session, featured }: { session: UpcomingSession; featured?: boolean }) {
  const dateLabel = formatSessionDate(session.session_date)
  const timeRange = `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`

  if (featured) {
    return (
      <div className="rounded-xl border-l-[3px] border-[#2563EB] bg-[#B8C9E8]/25 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111827]">{session.title}</p>
            {session.topic && <p className="mt-1 text-[13px] text-[#4B5563]">{session.topic}</p>}
            <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-[#708090]">
              <Clock3 className="h-3.5 w-3.5" />
              {timeRange}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#0A1020]/8 px-2.5 py-0.5 text-[12px] font-semibold text-[#374151]">
            {dateLabel}
          </span>
        </div>
      </div>
    )
  }

  return (
    <li className="flex items-center justify-between gap-3 border-b border-[#708090]/15 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#111827]">{session.title}</p>
        {session.topic && <p className="truncate text-[12px] text-[#708090]">{session.topic}</p>}
      </div>
      <div className="shrink-0 text-right text-[12px] text-[#708090]">
        <span className="block font-medium text-[#374151]">{dateLabel}</span>
        <span className="tabular-nums">{timeRange}</span>
      </div>
    </li>
  )
}

export function UpcomingClassesPanel({
  sessions,
  loading,
}: {
  sessions: UpcomingSession[]
  loading: boolean
}) {
  const [next, ...rest] = sessions
  return (
    <CQCard className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <CalendarClock className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
          Upcoming classes
        </h3>
        {sessions.length > 0 && (
          <span className="rounded-full bg-[#B8C9E8]/40 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[#1D4ED8]">
            {sessions.length}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          <CQSkeleton className="h-20 w-full rounded-xl" />
          <CQSkeleton className="h-9 w-full" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-[#708090]">
          No upcoming classes scheduled.
        </p>
      ) : (
        <div className="space-y-3">
          {next && <SessionRow session={next} featured />}
          {rest.length > 0 && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] [&::-webkit-details-marker]:hidden">
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                {rest.length} more class{rest.length === 1 ? '' : 'es'}
              </summary>
              <ul className="mt-1 pl-1">
                {rest.map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </CQCard>
  )
}

/* ------------------------------------------------------------- Deadlines */

function deadlineBorder(item: DeadlineItem, today: string): string {
  if (item.done) return 'border-[#14B8A6]'
  if (item.due < today) return 'border-[#EF4444]'
  if (item.due === today) return 'border-[#FBBF24]'
  return 'border-[#2563EB]'
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
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#708090]">
        {title}
        {items.length > 0 && (
          <span className="ml-1.5 rounded-full bg-[#0A1020]/8 px-1.5 py-0.5 text-[#374151]">
            {items.length}
          </span>
        )}
      </h4>
      {items.length === 0 ? (
        <p className="text-[12px] text-[#9CA3AF]">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className={cn(
                'rounded-lg border-l-[3px] bg-[#FAF3E0]/70 px-3 py-2.5',
                deadlineBorder(item, today),
              )}
            >
              <p
                className={cn(
                  'truncate text-sm font-medium',
                  item.done ? 'text-[#9CA3AF] line-through' : 'text-[#111827]',
                )}
              >
                {item.title}
              </p>
              {!item.done && (
                <p className="mt-0.5 text-[12px] text-[#708090]">{formatSessionDate(item.due)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DeadlinesPanel({
  deadlines,
  loading,
}: {
  deadlines: UpcomingDeadlines
  loading: boolean
}) {
  const today = toIsoDate(new Date())
  const buckets = useMemo(() => bucketDeadlines(mergeDeadlines(deadlines)), [deadlines])
  const openCount = buckets.today.length + buckets.thisWeek.length
  const hasAny = buckets.today.length + buckets.thisWeek.length + buckets.completed.length > 0

  return (
    <CQCard className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <ListChecks className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
          All deadlines
        </h3>
        {openCount > 0 && (
          <span className="rounded-full bg-[#FBBF24]/25 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[#92400E]">
            {openCount} open
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex flex-col gap-4 md:flex-row">
          <CQSkeleton className="h-28 flex-1" />
          <CQSkeleton className="h-28 flex-1" />
          <CQSkeleton className="h-28 flex-1" />
        </div>
      ) : !hasAny ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-[#708090]">
          No deadlines set yet.
        </p>
      ) : (
        <div className="flex flex-1 flex-col gap-6 md:flex-row md:gap-4">
          <DeadlineColumn title="Due today" items={buckets.today} today={today} emptyLabel="Nothing due today" />
          <DeadlineColumn title="This week" items={buckets.thisWeek} today={today} emptyLabel="Clear for the week" />
          <DeadlineColumn title="Completed" items={buckets.completed} today={today} emptyLabel="None completed yet" />
        </div>
      )}
    </CQCard>
  )
}

/* -------------------------------------------------------------- Syllabus */

const MAX_VISIBLE_TOPICS = 4

function TopicChip({ label, tone }: { label: string; tone: CQTone }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full truncate rounded-full border border-[#708090]/20 px-2.5 py-1 text-[12px] font-medium text-[#374151]',
        CQ_TONE_SOFT[tone],
      )}
    >
      {label}
    </span>
  )
}

export function SyllabusPanel({
  careerJourney,
  stageRows,
  loading,
  onOpenCareer,
}: {
  careerJourney: CareerJourneySummary | null
  stageRows: StageProgressRecord[] | null
  loading: boolean
  onOpenCareer: () => void
}) {
  const fallback = !careerJourney && stageRows ? deriveStageJourneyFallback(stageRows) : null
  const stageLabel = careerJourney?.currentStageLabel ?? fallback?.currentStageLabel ?? 'Getting started'
  const progressPct = careerJourney?.pct ?? fallback?.progressPct ?? 0
  const completedTopics = careerJourney?.completedTopics ?? fallback?.completedTopics ?? []
  const remainingTopics = careerJourney?.remainingTopics ?? fallback?.remainingTopics ?? []

  const visibleCompleted = completedTopics.slice(-MAX_VISIBLE_TOPICS)
  const visibleRemaining = remainingTopics.slice(0, MAX_VISIBLE_TOPICS)
  const hiddenCompleted = Math.max(0, completedTopics.length - visibleCompleted.length)
  const hiddenRemaining = Math.max(0, remainingTopics.length - visibleRemaining.length)
  const empty = completedTopics.length === 0 && remainingTopics.length === 0

  return (
    <CQCard className="h-full">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
            <GraduationCap className="h-4 w-4 text-[#0A1020]/70" strokeWidth={1.75} />
            Syllabus overview
          </h3>
          <p className="mt-0.5 text-[12px] text-[#708090]">{stageLabel}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#B8C9E8]/40 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-[#1D4ED8]">
          {loading ? '…' : `${progressPct}%`}
        </span>
      </div>

      <CQProgressBar value={progressPct} className="mb-4" />

      {loading ? (
        <div className="space-y-2">
          <CQSkeleton className="h-6 w-full" />
          <CQSkeleton className="h-6 w-2/3" />
        </div>
      ) : empty ? (
        <div>
          <p className="text-sm text-[#708090]">
            Pick a career path in Career Map to track your syllabus progress here.
          </p>
          <CQActionButton variant="ghost" className="mt-3" onClick={onOpenCareer}>
            Open Career Map
            <ArrowRight className="h-3.5 w-3.5" />
          </CQActionButton>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleCompleted.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
                Completed
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleCompleted.map((t) => (
                  <TopicChip key={`done-${t}`} label={t} tone="sage" />
                ))}
                {hiddenCompleted > 0 && <TopicChip label={`+${hiddenCompleted} more`} tone="sage" />}
              </div>
            </div>
          )}
          {visibleRemaining.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#708090]">
                Up next
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleRemaining.map((t) => (
                  <TopicChip key={`next-${t}`} label={t} tone="lavender" />
                ))}
                {hiddenRemaining > 0 && <TopicChip label={`+${hiddenRemaining} more`} tone="lavender" />}
              </div>
            </div>
          )}
        </div>
      )}
    </CQCard>
  )
}
