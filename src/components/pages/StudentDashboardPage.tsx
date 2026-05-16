import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
  type DeadlineQuizItem,
  type DeadlineStageItem,
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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { AuthUser } from '@/lib/auth'

interface StudentDashboardPageProps {
  user: AuthUser
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
  const {
    stageRows,
    catalogSteps,
    careerLocal,
    typingAttempts,
    applications,
    enrollment,
    submittedProjects,
    upcomingSessions,
    deadlines,
    loading: dashboardLoading,
    reload: reloadDashboard,
  } = useStudentDashboardSnapshot(user)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50/80">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-6 pt-3 md:px-6">
        {/* Header */}
        <header className="shrink-0 rounded-2xl bg-gradient-to-r from-indigo-50 via-indigo-100/80 to-slate-50 px-4 py-4 shadow-sm ring-1 ring-indigo-100/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Dashboard
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Hello {user.full_name.split(' ')[0] ?? user.full_name},
              </h1>
              <p className="text-[13px] text-slate-600">
                Here&apos;s a quick view of your progress and learning signals.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 h-8 gap-1 self-start rounded-full border-indigo-200 bg-white/90 px-3 text-xs text-slate-700 shadow-sm hover:bg-white sm:self-auto"
              onClick={() => void reloadDashboard()}
              disabled={dashboardLoading}
            >
              <Loader2
                className={`h-3.5 w-3.5 ${dashboardLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`}
                aria-hidden
              />
              Refresh
            </Button>
          </div>
        </header>

        {/* KPI Tiles */}
        <KpiTilesRow
          loading={dashboardLoading}
          stageRows={stageRows}
          careerLocal={careerLocal}
          typingAttempts={typingAttempts}
          applications={applications}
          enrollment={enrollment}
          submittedProjects={submittedProjects}
        />

        {/* Schedule + Deadlines row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <UpcomingClassesCard sessions={upcomingSessions} loading={dashboardLoading} />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <DeadlinesCard deadlines={deadlines} loading={dashboardLoading} />
            <TopicsToLearnCard stageRows={stageRows} loading={dashboardLoading} />
          </div>
        </div>

        {/* Charts */}
        <ChartsRow
          loading={dashboardLoading}
          typingAttempts={typingAttempts}
          stageRows={stageRows}
        />

        {/* Stage details table */}
        <StageDetailsTable stageRows={stageRows} loading={dashboardLoading} />

        {/* Quick stats footer */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Catalog steps" value={catalogSteps ?? 0} loading={dashboardLoading} />
          <MiniStat
            label="Stage records"
            value={stageRows?.length ?? 0}
            loading={dashboardLoading}
          />
          <MiniStat
            label="Completion"
            value={careerLocal ? `${careerLocal.pct}%` : '0%'}
            loading={dashboardLoading}
          />
          <MiniStat
            label="Role focus"
            value={careerLocal?.title ?? '—'}
            loading={dashboardLoading}
          />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────── KPI tiles ─────────────────────────────── */

function KpiTile({
  label,
  value,
  sub,
  loading: tileLoading,
}: {
  label: string
  value: string
  sub?: string
  loading: boolean
}) {
  return (
    <Card className="flex min-h-0 flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {tileLoading ? (
        <div className="mt-2 h-7 w-20 max-w-full animate-pulse rounded-md bg-slate-100" />
      ) : (
        <p className="mt-1 line-clamp-2 text-base font-bold leading-tight text-slate-900 tabular-nums">
          {value}
        </p>
      )}
      {sub && !tileLoading ? (
        <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{sub}</p>
      ) : null}
    </Card>
  )
}

function KpiTilesRow({
  loading,
  stageRows,
  careerLocal,
  typingAttempts,
  applications,
  enrollment,
  submittedProjects,
}: {
  loading: boolean
  stageRows: StageProgressRecord[] | null
  careerLocal: { title: string; pct: number } | null
  typingAttempts: TypingAttempt[]
  applications: StudentJobApplicationsMe
  enrollment: EnrollmentMe | null
  submittedProjects: MySubmittedProject[]
}) {
  const stages = stageRows ?? []
  const quizAvg = useMemo(() => computeQuizAvg(stages), [stages])
  const typingAvg = useMemo(() => computeTypingAvg(typingAttempts), [typingAttempts])
  const approvedCount = submittedProjects.filter((p) => p.status === 'approved').length
  const submittedCount = submittedProjects.length
  const unlocked = stages.filter((r) => r.unlocked).length
  const totalTracked = stages.length
  const courseLine =
    totalTracked > 0 ? `${unlocked}/${totalTracked} stages` : 'No data yet'
  const courseSub = careerLocal ? `Roadmap ${careerLocal.pct}%` : undefined
  const attendanceLine =
    !enrollment || enrollment.attendance_pct === null ? 'Not enrolled' : `${enrollment.attendance_pct}%`
  const attendanceSub =
    enrollment && enrollment.batch_names.length > 0 ? enrollment.batch_names.join(', ') : undefined

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <KpiTile
        label="Typing speed"
        value={typingAvg !== null ? `${typingAvg} WPM` : '—'}
        sub="Avg of recent attempts"
        loading={loading}
      />
      <KpiTile
        label="Quiz avg"
        value={quizAvg !== null ? `${quizAvg}%` : '—'}
        sub="Across tracked stages"
        loading={loading}
      />
      <KpiTile
        label="Projects done"
        value={String(approvedCount)}
        sub={submittedCount > 0 ? `${submittedCount} submitted` : 'Portfolio submissions'}
        loading={loading}
      />
      <KpiTile label="Course status" value={courseLine} sub={courseSub} loading={loading} />
      <KpiTile
        label="Jobs applied"
        value={String(applications.count)}
        sub="Total applications"
        loading={loading}
      />
      <KpiTile label="Attendance" value={attendanceLine} sub={attendanceSub} loading={loading} />
    </div>
  )
}

/* ─────────────────────────── Upcoming classes ──────────────────────────── */

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

function UpcomingClassesCard({
  sessions,
  loading,
}: {
  sessions: UpcomingSession[]
  loading: boolean
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <Calendar className="h-4 w-4 text-indigo-500" aria-hidden />
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
          Upcoming Classes
        </p>
      </div>
      <div className="divide-y divide-slate-50 px-4">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-[13px] text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading schedule…
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-slate-500">
            No upcoming classes scheduled.
          </div>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="flex items-start gap-3 py-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-slate-800">{s.title}</p>
                {s.topic && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{s.topic}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                    {formatSessionDate(s.session_date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                  </span>
                  <span className="text-slate-400">{s.batch_name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

/* ──────────────────────────── Deadlines card ──────────────────────────── */

function DeadlinesCard({
  deadlines,
  loading,
}: {
  deadlines: UpcomingDeadlines
  loading: boolean
}) {
  const items = useMemo(() => {
    const all: { key: string; title: string; due: string; done: boolean; type: 'quiz' | 'stage' }[] = []
    for (const q of deadlines.quizzes) {
      all.push({ key: `q-${q.quiz_id}`, title: q.title, due: q.due_date, done: q.passed, type: 'quiz' })
    }
    for (const s of deadlines.stages) {
      all.push({ key: `s-${s.stage_id}`, title: s.title, due: s.due_date, done: s.unlocked, type: 'stage' })
    }
    all.sort((a, b) => a.due.localeCompare(b.due))
    return all
  }, [deadlines])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
          Deadlines
        </p>
      </div>
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-[13px] text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-slate-500">No deadlines set yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => {
              const overdue = !it.done && it.due < today
              const dueToday = !it.done && it.due === today
              return (
                <li key={it.key} className="flex items-center gap-2 text-[13px]">
                  {it.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : overdue ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <span
                    className={`min-w-0 flex-1 truncate ${it.done ? 'text-slate-400 line-through' : overdue ? 'font-medium text-red-700' : 'text-slate-700'}`}
                  >
                    {it.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      it.done
                        ? 'bg-emerald-50 text-emerald-700'
                        : overdue
                          ? 'bg-red-50 text-red-700'
                          : dueToday
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {it.done ? 'Done' : formatSessionDate(it.due)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}

/* ───────────────────────── Topics to learn card ───────────────────────── */

function TopicsToLearnCard({
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

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <BookOpen className="h-4 w-4 text-violet-500" aria-hidden />
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
          Topics to Learn
        </p>
      </div>
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-[13px] text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : upcoming.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-slate-500">
            No upcoming topics — all stages are complete or no data yet.
          </p>
        ) : (
          <ul className="space-y-3 py-1">
            {upcoming.map((row) => {
              const pct =
                row.total_lessons > 0
                  ? Math.round((row.lessons_completed / row.total_lessons) * 100)
                  : 0
              return (
                <li key={row.stage_id}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="truncate font-medium text-slate-700">
                      Stage {row.stage_id}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                      {row.lessons_completed}/{row.total_lessons}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{pct}% complete</span>
                    {!row.unlocked && (
                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 font-medium text-amber-600">
                        Locked — pass quiz to unlock
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}

/* ──────────────────────────── Charts row ───────────────────────────────── */

function ChartsRow({
  loading,
  typingAttempts,
  stageRows,
}: {
  loading: boolean
  typingAttempts: TypingAttempt[]
  stageRows: StageProgressRecord[] | null
}) {
  const stages = stageRows ?? []
  const typingSeries = useMemo(
    () => [...typingAttempts].reverse().map((a, i) => ({ idx: i + 1, wpm: a.wpm })),
    [typingAttempts],
  )
  const quizBars = useMemo(() => {
    const tracked = stages.filter((r) => r.total_lessons > 0)
    const source = tracked.length > 0 ? tracked : stages
    return source.map((r) => ({ stage: String(r.stage_id), score: r.latest_quiz_score }))
  }, [stages])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Card className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Typing WPM trend
        </p>
        <p className="text-[10px] text-slate-400">Recent attempts, oldest to newest</p>
        <div className="mt-2 h-44 w-full min-w-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
              Loading…
            </div>
          ) : typingSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-[12px] text-slate-500">
              No typing data yet. Practice in Typing Trainer to see a trend.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={typingSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="idx" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis width={36} tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v: number) => [`${v} WPM`, 'Speed']}
                  labelFormatter={(idx) => `Attempt ${idx}`}
                />
                <Line type="monotone" dataKey="wpm" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Quiz score by stage
        </p>
        <p className="text-[10px] text-slate-400">Latest quiz score per stage</p>
        <div className="mt-2 h-44 w-full min-w-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
              Loading…
            </div>
          ) : quizBars.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-[12px] text-slate-500">
              No stage progress yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizBars} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200"
                  vertical={false}
                />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis width={36} tick={{ fontSize: 10 }} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Score']}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ─────────────────────── Stage details table ──────────────────────────── */

function StageDetailsTable({
  stageRows,
  loading,
}: {
  stageRows: StageProgressRecord[] | null
  loading: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  if (loading || !stageRows || stageRows.length === 0) return null

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-2.5 text-left"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Stage details
        </p>
        <span className="text-[11px] text-slate-500">
          {stageRows.length} rows — {expanded ? 'collapse' : 'expand'}
        </span>
      </button>
      {expanded && (
        <div className="overflow-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Stage</th>
                <th className="px-4 py-2 font-semibold">Lessons</th>
                <th className="px-4 py-2 font-semibold">Quiz</th>
                <th className="px-4 py-2 font-semibold">Unlocked</th>
              </tr>
            </thead>
            <tbody>
              {stageRows.map((row) => (
                <tr key={row.stage_id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-slate-800">{row.stage_id}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {row.lessons_completed}/{row.total_lessons}
                  </td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">
                    {row.latest_quiz_score}%
                  </td>
                  <td className="px-4 py-2 text-slate-600">{row.unlocked ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/* ──────────────────────────── Mini stat card ───────────────────────────── */

function MiniStat({
  label,
  value,
  loading,
}: {
  label: string
  value: string | number
  loading: boolean
}) {
  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-5 w-16 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</p>
      )}
    </Card>
  )
}
