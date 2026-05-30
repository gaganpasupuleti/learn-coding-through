import { useCallback, useEffect, useMemo, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  fetchMyEnrollment,
  fetchMyStageProgress,
  fetchMySubmittedProjects,
  fetchStudentJobApplications,
  fetchTypingAttempts,
  fetchUpcomingDeadlines,
  fetchUpcomingSchedule,
  fetchUserProgress,
  type EnrollmentMe,
  type MySubmittedProject,
  type StageProgressRecord,
  type StudentJobApplicationsMe,
  type TypingAttempt,
  type UpcomingDeadlines,
  type UpcomingSession,
} from '@/lib/api'
import { readCareerMapLocalSummary } from '@/lib/career-local-summary'
import {
  blendStudentDashboardDummyIfNeeded,
  blendStudentScheduleDummyIfNeeded,
} from '@/lib/student-dashboard-dummy'
import { ExpandedCalendarDrawer } from '@/components/calendar/ExpandedCalendarDrawer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { AuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

const CARD_SURFACE =
  'bg-white shadow-sm border border-gray-200 rounded-xl gap-0 py-0'

const SCROLL_BODY =
  'overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'

const DUMMY_JOBS = [
  { id: '1', title: 'Junior Data Analyst', company: 'Acme Corp' },
  { id: '2', title: 'Backend Developer', company: 'Nova Labs' },
  { id: '3', title: 'SQL Engineer Intern', company: 'DataFlow' },
] as const

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

interface StudentDashboardPageProps {
  user: AuthUser
}

interface DashboardDataProps {
  loading: boolean
  stageRows: StageProgressRecord[] | null
  catalogSteps: number | null
  careerLocal: { title: string; pct: number } | null
  typingAttempts: TypingAttempt[]
  applications: StudentJobApplicationsMe
  enrollment: EnrollmentMe | null
  submittedProjects: MySubmittedProject[]
  upcomingSessions: UpcomingSession[]
  deadlines: UpcomingDeadlines
}

function computeQuizAvg(stageRows: StageProgressRecord[]): number | null {
  const rows = stageRows.filter((r) => r.total_lessons > 0)
  if (rows.length === 0) return null
  return Math.round(rows.reduce((s, r) => s + r.latest_quiz_score, 0) / rows.length)
}

function computeTypingAvg(attempts: TypingAttempt[]): number | null {
  if (attempts.length === 0) return null
  return Math.round(attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length)
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function useStudentDashboardSnapshot(user: AuthUser) {
  const [stageRows, setStageRows] = useState<StageProgressRecord[] | null>(null)
  const [catalogSteps, setCatalogSteps] = useState<number | null>(null)
  const [careerLocal, setCareerLocal] = useState<{ title: string; pct: number } | null>(null)
  const [typingAttempts, setTypingAttempts] = useState<TypingAttempt[]>([])
  const [applications, setApplications] = useState<StudentJobApplicationsMe>({ count: 0, items: [] })
  const [enrollment, setEnrollment] = useState<EnrollmentMe | null>(null)
  const [submittedProjects, setSubmittedProjects] = useState<MySubmittedProject[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [deadlines, setDeadlines] = useState<UpcomingDeadlines>({ quizzes: [], stages: [] })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setCareerLocal(readCareerMapLocalSummary())
    try {
      const warn = (label: string) => (err: unknown) => {
        console.warn(`[Dashboard] ${label} failed:`, err)
        return undefined
      }
      const [stages, catalog, typing, apps, enr, projs, sessions, dl] = await Promise.all([
        fetchMyStageProgress().catch(warn('stageProgress')),
        fetchUserProgress().catch(warn('catalogProgress')),
        fetchTypingAttempts(30).catch(warn('typing')),
        fetchStudentJobApplications().catch(warn('jobApps')),
        fetchMyEnrollment().catch(warn('enrollment')),
        fetchMySubmittedProjects().catch(warn('projects')),
        fetchUpcomingSchedule(5).catch(warn('schedule')),
        fetchUpcomingDeadlines().catch(warn('deadlines')),
      ])
      const catalogCount = catalog?.completedSteps?.length ?? 0
      const blended = blendStudentDashboardDummyIfNeeded(user, {
        stageRows: stages ?? [],
        catalogSteps: catalogCount,
        typingAttempts: typing ?? [],
        applications: apps ?? { count: 0, items: [] },
        enrollment: enr ?? { attendance_pct: null, batch_names: [] },
        submittedProjects: projs ?? [],
      })
      setStageRows(blended.stageRows)
      setCatalogSteps(blended.catalogSteps)
      setTypingAttempts(blended.typingAttempts)
      setApplications(blended.applications)
      setEnrollment(blended.enrollment)
      setSubmittedProjects(blended.submittedProjects)
      const scheduleBlend = blendStudentScheduleDummyIfNeeded(
        user,
        sessions ?? [],
        dl ?? { quizzes: [], stages: [] },
      )
      setUpcomingSessions(scheduleBlend.sessions)
      setDeadlines(scheduleBlend.deadlines)
      const failCount = [stages, catalog, typing, apps, enr, projs, sessions, dl].filter(
        (v) => v === undefined,
      ).length
      const hasCoreData =
        blended.stageRows.length > 0 ||
        blended.catalogSteps > 0 ||
        blended.typingAttempts.length > 0
      if (failCount > 0 && !hasCoreData) {
        toast.error(
          'Could not load dashboard data. Check that the API is running and you are signed in.',
        )
      } else if (failCount > 0) {
        console.warn(`[Dashboard] ${failCount} request(s) failed; showing available data.`)
      }
    } catch {
      toast.error('Could not load dashboard data. Is the API running?')
      const blended = blendStudentDashboardDummyIfNeeded(user, {
        stageRows: [],
        catalogSteps: 0,
        typingAttempts: [],
        applications: { count: 0, items: [] },
        enrollment: { attendance_pct: null, batch_names: [] },
        submittedProjects: [],
      })
      setStageRows(blended.stageRows)
      setCatalogSteps(blended.catalogSteps)
      setTypingAttempts(blended.typingAttempts)
      setApplications(blended.applications)
      setEnrollment(blended.enrollment)
      setSubmittedProjects(blended.submittedProjects)
      const scheduleBlend = blendStudentScheduleDummyIfNeeded(user, [], { quizzes: [], stages: [] })
      setUpcomingSessions(scheduleBlend.sessions)
      setDeadlines(scheduleBlend.deadlines)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return {
    stageRows,
    catalogSteps,
    careerLocal,
    typingAttempts,
    applications,
    enrollment,
    submittedProjects,
    upcomingSessions,
    deadlines,
    loading,
    reload: load,
  }
}

export function StudentDashboardPage({ user }: StudentDashboardPageProps) {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const snapshot = useStudentDashboardSnapshot(user)
  const data: DashboardDataProps = {
    loading: snapshot.loading,
    stageRows: snapshot.stageRows,
    catalogSteps: snapshot.catalogSteps,
    careerLocal: snapshot.careerLocal,
    typingAttempts: snapshot.typingAttempts,
    applications: snapshot.applications,
    enrollment: snapshot.enrollment,
    submittedProjects: snapshot.submittedProjects,
    upcomingSessions: snapshot.upcomingSessions,
    deadlines: snapshot.deadlines,
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100 p-6 lg:max-h-[calc(100vh-80px)]">
      <ExpandedCalendarDrawer
        open={isCalendarExpanded}
        onClose={() => setIsCalendarExpanded(false)}
      />
      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-5 lg:overflow-hidden">
        <div className="col-span-12 shrink-0">
          <DashboardHeader
            firstName={user.full_name.split(' ')[0] ?? user.full_name}
            loading={snapshot.loading}
            onRefresh={() => void snapshot.reload()}
          />
        </div>
        <CommandCenterColumn {...data} />
        <ActionCenterColumn {...data} />
        <AttractionCenterColumn {...data} onExpand={() => setIsCalendarExpanded(true)} />
      </div>

      <div className={cn('min-h-0 flex-1 space-y-4 overflow-y-auto lg:hidden')}>
        <DashboardHeader
          firstName={user.full_name.split(' ')[0] ?? user.full_name}
          loading={snapshot.loading}
          onRefresh={() => void snapshot.reload()}
        />
        <CommandCenterColumn {...data} stacked />
        <ActionCenterColumn {...data} stacked />
        <AttractionCenterColumn {...data} stacked onExpand={() => setIsCalendarExpanded(true)} />
      </div>
    </div>
  )
}

/* ───────────────────────────── Layout helpers ───────────────────────────── */

function BentoCard({
  title,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card
      className={cn(
        CARD_SURFACE,
        'flex min-h-0 flex-col overflow-hidden bg-white text-gray-900',
        className,
      )}
    >
      {title ? (
        <div className="shrink-0 border-b border-gray-100 px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
      ) : null}
      <div className={cn('min-h-0 flex-1 p-4', bodyClassName)}>{children}</div>
    </Card>
  )
}

function DashboardHeader({
  firstName,
  loading,
  onRefresh,
}: {
  firstName: string
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <header className={cn(CARD_SURFACE, 'px-4 py-2')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-900">Hello {firstName},</h1>
          <p className="text-sm text-gray-600">Your learning snapshot at a glance.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-2.5 text-xs"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <span className="text-gray-500">Refreshing…</span>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>
    </header>
  )
}

function useCommandCenterStats(props: DashboardDataProps) {
  const stages = props.stageRows ?? []
  const quizAvg = useMemo(() => computeQuizAvg(stages), [stages])
  const typingAvg = useMemo(() => computeTypingAvg(props.typingAttempts), [props.typingAttempts])
  const approvedCount = props.submittedProjects.filter((p) => p.status === 'approved').length
  const unlocked = stages.filter((r) => r.unlocked).length
  const totalTracked = stages.length
  const courseLine = totalTracked > 0 ? `${unlocked}/${totalTracked}` : '—'
  const attendanceLine =
    !props.enrollment || props.enrollment.attendance_pct === null
      ? '—'
      : `${props.enrollment.attendance_pct}%`

  return [
    { label: 'Typing speed', value: typingAvg !== null ? `${typingAvg} WPM` : '—' },
    { label: 'Quiz avg', value: quizAvg !== null ? `${quizAvg}%` : '—' },
    { label: 'Projects done', value: String(approvedCount) },
    { label: 'Course status', value: courseLine },
    { label: 'Jobs applied', value: String(props.applications.count) },
    { label: 'Attendance', value: attendanceLine },
    { label: 'Catalog steps', value: String(props.catalogSteps ?? 0) },
    { label: 'Stage records', value: String(props.stageRows?.length ?? 0) },
    { label: 'Completion', value: props.careerLocal ? `${props.careerLocal.pct}%` : '0%' },
    { label: 'Role focus', value: props.careerLocal?.title ?? '—' },
  ]
}

function StatCell({
  label,
  value,
  loading,
}: {
  label: string
  value: string
  loading: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      {loading ? (
        <div className="h-6 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="text-xl font-bold tabular-nums text-gray-900">{value}</p>
      )}
    </div>
  )
}

/* ───────────────────────────── Command Center ───────────────────────────── */

function CommandCenterColumn({
  stacked,
  ...props
}: DashboardDataProps & { stacked?: boolean }) {
  const stats = useCommandCenterStats(props)

  return (
    <aside className={stacked ? undefined : 'col-span-3 flex min-h-0 flex-col overflow-hidden'}>
      <BentoCard title="Command Center" className="h-full min-h-0" bodyClassName="p-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-5">
          {stats.map((s) => (
            <StatCell
              key={s.label}
              label={s.label}
              value={s.value}
              loading={props.loading}
            />
          ))}
        </div>
      </BentoCard>
    </aside>
  )
}

/* ───────────────────────────── Action Center ────────────────────────────── */

function ActionCenterColumn({
  stacked,
  ...props
}: DashboardDataProps & { stacked?: boolean }) {
  const scrollBody = cn('p-4', SCROLL_BODY)
  const colClass = stacked
    ? 'flex flex-col gap-4'
    : cn(
        'col-span-6 flex h-full max-h-[85vh] flex-col gap-4 overflow-y-auto pr-2',
        SCROLL_BODY,
      )

  return (
    <section className={colClass}>
      <BentoCard title="Upcoming Classes" bodyClassName={scrollBody}>
        <UpcomingClassesContent sessions={props.upcomingSessions} loading={props.loading} />
      </BentoCard>
      <BentoCard title="Deadlines" bodyClassName={scrollBody}>
        <DeadlinesContent deadlines={props.deadlines} loading={props.loading} />
      </BentoCard>
      <BentoCard title="Topics to Learn" bodyClassName={scrollBody}>
        <TopicsToLearnContent stageRows={props.stageRows} loading={props.loading} />
      </BentoCard>
    </section>
  )
}

/* ───────────────────────────── Attraction Center ────────────────────────── */

function AttractionCenterColumn({
  stacked,
  onExpand,
  ...props
}: DashboardDataProps & { stacked?: boolean; onExpand: () => void }) {
  const colClass = stacked
    ? 'flex flex-col gap-4'
    : 'col-span-3 flex min-h-0 flex-col gap-3 overflow-hidden'

  return (
    <aside className={colClass}>
      <BentoCard
        className={stacked ? undefined : 'min-h-0 flex-1'}
        bodyClassName={cn('p-4 pt-3', SCROLL_BODY)}
      >
        <AttendanceCalendarWidget sessions={props.upcomingSessions} onExpand={onExpand} />
      </BentoCard>
      <BentoCard title="Live Job Radar" className="shrink-0" bodyClassName="p-3">
        <LiveJobRadarWidget />
      </BentoCard>
      <BentoCard
        title="Job Readiness Score"
        className={stacked ? undefined : 'min-h-0 flex-1'}
        bodyClassName="p-4"
      >
        <JobReadinessWidget careerLocal={props.careerLocal} />
      </BentoCard>
    </aside>
  )
}

function AttendanceCalendarWidget({
  sessions,
  onExpand,
}: {
  sessions: UpcomingSession[]
  onExpand: () => void
}) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const attendedDates = useMemo(() => {
    const set = new Set<string>()
    for (const s of sessions) {
      set.add(s.session_date)
    }
    const today = new Date()
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i * 2)
      set.add(toIsoDate(d))
    }
    return set
  }, [sessions])

  const { year, month, cells } = useMemo(() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const first = new Date(y, m, 1)
    const startPad = first.getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const grid: { iso: string; day: number; inMonth: boolean }[] = []

    const prevMonthDays = new Date(y, m, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const d = new Date(y, m - 1, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: true })
    }
    while (grid.length < 35) {
      const day = grid.length - startPad - daysInMonth + 1
      const d = new Date(y, m + 1, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: false })
    }
    return { year: y, month: m, cells: grid.slice(0, 35) }
  }, [viewDate])

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <h3 className="text-sm font-semibold text-gray-700">Attendance Calendar</h3>
        <button
          type="button"
          onClick={onExpand}
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-900"
          aria-label="Expand calendar"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
          onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
        >
          Prev
        </button>
        <span className="text-xs font-semibold text-gray-800">{monthLabel}</span>
        <button
          type="button"
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
          onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="py-1 text-[9px] font-medium uppercase text-gray-400">
            {wd}
          </span>
        ))}
        {cells.map((cell, idx) => {
          const attended = attendedDates.has(cell.iso)
          const selected = selectedDay === cell.iso
          return (
            <button
              key={`${cell.iso}-${idx}`}
              type="button"
              onClick={() => setSelectedDay((prev) => (prev === cell.iso ? null : cell.iso))}
              className={cn(
                'mx-auto flex aspect-square w-full max-w-[2rem] flex-col items-center justify-center gap-1 rounded text-[11px] tabular-nums leading-none',
                !cell.inMonth && 'text-gray-300',
                cell.inMonth && 'text-gray-700',
                selected && 'bg-teal-50 ring-1 ring-teal-400',
              )}
            >
              <span className="flex h-4 items-center justify-center">{cell.day}</span>
              <span className="flex h-1.5 w-full items-center justify-center" aria-hidden>
                {attended ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LiveJobRadarWidget() {
  return (
    <ul className={cn('space-y-2', SCROLL_BODY, 'max-h-32')}>
      {DUMMY_JOBS.map((job) => (
        <li
          key={job.id}
          className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500">{job.company}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
          >
            Apply
          </button>
        </li>
      ))}
    </ul>
  )
}

function JobReadinessWidget({
  careerLocal,
}: {
  careerLocal: { title: string; pct: number } | null
}) {
  const pct = careerLocal?.pct ?? 85
  const displayPct = `${pct}%`

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">Job Readiness</p>
        <p className="text-xs text-gray-500">Ready for next role</p>
      </div>
      <p className="shrink-0 text-3xl font-bold tabular-nums leading-none text-gray-900">
        {displayPct}
      </p>
    </div>
  )
}

/* ─────────────────────────── Content: upcoming classes ────────────────── */

function formatSessionDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / 86400000
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function UpcomingClassesContent({
  sessions,
  loading,
}: {
  sessions: UpcomingSession[]
  loading: boolean
}) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading schedule…</p>
  }
  if (sessions.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-500">No upcoming classes scheduled.</p>
  }

  return (
    <ol className="ml-1 space-y-3 border-l-2 border-gray-200 pl-5">
      {sessions.map((s) => {
        const dateLabel = formatSessionDate(s.session_date)
        const timeRange = `${formatTime(s.start_time)} – ${formatTime(s.end_time)}`
        return (
          <li
            key={s.id}
            className="relative flex items-start justify-between gap-4 before:absolute before:-left-[calc(1.25rem+1px)] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-gray-300 before:ring-2 before:ring-white"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate text-sm font-medium text-gray-800">{s.title}</p>
              {s.topic && <p className="mt-0.5 truncate text-xs text-gray-600">{s.topic}</p>}
            </div>
            <div className="shrink-0 text-right text-xs leading-snug">
              {dateLabel === 'Today' ? (
                <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800 ring-1 ring-amber-200/80">
                  Today
                </span>
              ) : (
                <span className="block font-medium text-gray-500">{dateLabel}</span>
              )}
              <span className="mt-0.5 block tabular-nums text-gray-500">{timeRange}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ─────────────────────────── Content: deadlines ─────────────────────────── */

function DeadlineCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold leading-none',
        checked
          ? 'border-gray-700 bg-gray-800 text-white'
          : 'border-gray-300 bg-white text-transparent',
      )}
      aria-hidden
    >
      ✓
    </span>
  )
}

function DeadlinesContent({
  deadlines,
  loading,
}: {
  deadlines: UpcomingDeadlines
  loading: boolean
}) {
  const items = useMemo(() => {
    const all: { key: string; title: string; due: string; done: boolean }[] = []
    for (const q of deadlines.quizzes) {
      all.push({ key: `q-${q.quiz_id}`, title: q.title, due: q.due_date, done: q.passed })
    }
    for (const s of deadlines.stages) {
      all.push({ key: `s-${s.stage_id}`, title: s.title, due: s.due_date, done: s.unlocked })
    }
    all.sort((a, b) => a.due.localeCompare(b.due))
    return all
  }, [deadlines])

  const today = new Date().toISOString().slice(0, 10)

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>
  }
  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-500">No deadlines set yet.</p>
  }

  return (
    <ul className="space-y-4" role="list">
      {items.map((it) => {
        const overdue = !it.done && it.due < today
        const dueLabel = formatSessionDate(it.due)
        return (
          <li key={it.key} className="flex items-start gap-3">
            <DeadlineCheckbox checked={it.done} />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
              <span
                className={cn(
                  'min-w-0 truncate text-sm',
                  it.done
                    ? 'text-gray-400 line-through'
                    : overdue
                      ? 'font-medium text-red-700'
                      : 'text-gray-700',
                )}
              >
                {it.title}
              </span>
              {!it.done && (
                <span
                  className={cn(
                    'shrink-0 text-xs tabular-nums',
                    overdue ? 'font-medium text-red-600' : 'text-gray-500',
                  )}
                >
                  {dueLabel}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ─────────────────────────── Content: topics to learn ───────────────────── */

function TopicsToLearnContent({
  stageRows,
  loading,
}: {
  stageRows: StageProgressRecord[] | null
  loading: boolean
}) {
  const upcoming = useMemo(() => {
    if (!stageRows || stageRows.length === 0) return []
    const locked = stageRows.filter((r) => !r.unlocked)
    const inProgress = stageRows.filter(
      (r) => r.unlocked && r.total_lessons > 0 && r.lessons_completed < r.total_lessons,
    )
    return [...inProgress, ...locked].slice(0, 3)
  }, [stageRows])

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>
  }
  if (upcoming.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        No upcoming topics — all stages are complete or no data yet.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {upcoming.map((row) => {
        const pct =
          row.total_lessons > 0
            ? Math.round((row.lessons_completed / row.total_lessons) * 100)
            : 0
        return (
          <li key={row.stage_id}>
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium text-gray-700">Stage {row.stage_id}</span>
              <span className="shrink-0 text-xs tabular-nums text-gray-500">
                {row.lessons_completed}/{row.total_lessons}
              </span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{pct}% complete</span>
              {!row.unlocked && (
                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 font-medium text-amber-600">
                  Locked
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
