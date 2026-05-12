import { useCallback, useEffect, useMemo, useState } from 'react'
import { Briefcase, ClipboardList, ExternalLink, Loader2, Sparkles } from 'lucide-react'
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
  applyToJob,
  fetchMyEnrollment,
  fetchMyStageProgress,
  fetchMySubmittedProjects,
  fetchOpenJobs,
  fetchStudentJobApplications,
  fetchTypingAttempts,
  fetchUserProgress,
  type EnrollmentMe,
  type MySubmittedProject,
  type StageProgressRecord,
  type StudentJobApplicationsMe,
  type StudentJobOpen,
  type TypingAttempt,
} from '@/lib/api'
import { readCareerMapLocalSummary } from '@/lib/career-local-summary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { AuthUser } from '@/lib/auth'

type StudentDashboardTab = 'progress' | 'jobs'

type JobsLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; jobs: StudentJobOpen[] }

type JobsSortKey = 'newest' | 'company' | 'title'

interface StudentDashboardPageProps {
  initialTab?: StudentDashboardTab
}

function metaStr(meta: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const v = meta?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
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

function useStudentDashboardSnapshot() {
  const [stageRows, setStageRows] = useState<StageProgressRecord[] | null>(null)
  const [catalogSteps, setCatalogSteps] = useState<number | null>(null)
  const [careerLocal, setCareerLocal] = useState<{ title: string; pct: number } | null>(null)
  const [typingAttempts, setTypingAttempts] = useState<TypingAttempt[]>([])
  const [applications, setApplications] = useState<StudentJobApplicationsMe>({ count: 0, items: [] })
  const [enrollment, setEnrollment] = useState<EnrollmentMe | null>(null)
  const [submittedProjects, setSubmittedProjects] = useState<MySubmittedProject[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setCareerLocal(readCareerMapLocalSummary())
    try {
      const [stages, catalog, typing, apps, enr, projs] = await Promise.all([
        fetchMyStageProgress().catch(() => [] as StageProgressRecord[]),
        fetchUserProgress().catch(() => ({ completedSteps: [] })),
        fetchTypingAttempts(30).catch(() => [] as TypingAttempt[]),
        fetchStudentJobApplications().catch(() => ({ count: 0, items: [] })),
        fetchMyEnrollment().catch(
          () => ({ attendance_pct: null, batch_names: [] }) satisfies EnrollmentMe,
        ),
        fetchMySubmittedProjects().catch(() => [] as MySubmittedProject[]),
      ])
      setStageRows(stages)
      setCatalogSteps(catalog.completedSteps?.length ?? 0)
      setTypingAttempts(typing)
      setApplications(apps)
      setEnrollment(enr)
      setSubmittedProjects(projs)
    } catch {
      toast.error('Could not load dashboard data. Is the API running?')
      setStageRows([])
      setCatalogSteps(0)
      setTypingAttempts([])
      setApplications({ count: 0, items: [] })
      setEnrollment({ attendance_pct: null, batch_names: [] })
      setSubmittedProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

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
    loading,
    reload: load,
  }
}

function useStudentJobsDashboard(onApplySuccess?: () => void) {
  const [state, setState] = useState<JobsLoadState>({ status: 'idle' })
  const [applyBusyId, setApplyBusyId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<JobsSortKey>('newest')

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const list = await fetchOpenJobs()
      setState({ status: 'ready', jobs: list })
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'We could not reach the jobs service. Check your connection or try again in a moment.'
      setState({ status: 'error', message })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const jobs = state.status === 'ready' ? state.jobs : []

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()

    const postedTime = (job: StudentJobOpen) => {
      const raw = metaStr(job.listing_metadata, 'postedAt')
      const fromMeta = raw ? Date.parse(raw) : NaN
      if (!Number.isNaN(fromMeta)) return fromMeta
      return new Date(job.created_at).getTime()
    }

    let list = jobs.filter((job) => {
      if (!q) return true
      const meta = job.listing_metadata ?? undefined
      const industries = metaStr(meta, 'industries') ?? ''
      const fn = metaStr(meta, 'jobFunction') ?? ''
      const hay = `${job.title} ${job.company_name} ${job.location} ${job.employment_type} ${industries} ${fn}`.toLowerCase()
      return hay.includes(q)
    })

    list = [...list].sort((a, b) => {
      if (sortKey === 'company') return a.company_name.localeCompare(b.company_name)
      if (sortKey === 'title') return a.title.localeCompare(b.title)
      return postedTime(b) - postedTime(a)
    })

    return list
  }, [jobs, query, sortKey])

  const handleApply = async (jobId: number) => {
    setApplyBusyId(jobId)
    try {
      const result = await applyToJob(jobId)
      toast.success(result.message || 'Applied')
      onApplySuccess?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Apply failed')
    } finally {
      setApplyBusyId(null)
    }
  }

  return {
    state,
    jobs,
    filteredSorted,
    query,
    setQuery,
    sortKey,
    setSortKey,
    applyBusyId,
    handleApply,
    reload: load,
  }
}

export function StudentDashboardPage({
  initialTab = 'progress',
  user,
}: StudentDashboardPageProps & { user: AuthUser }) {
  const [tab, setTab] = useState<StudentDashboardTab>(initialTab)

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  const {
    stageRows,
    catalogSteps,
    careerLocal,
    typingAttempts,
    applications,
    enrollment,
    submittedProjects,
    loading: dashboardLoading,
    reload: reloadDashboard,
  } = useStudentDashboardSnapshot()

  const {
    state: jobsState,
    jobs,
    filteredSorted,
    query,
    setQuery,
    sortKey,
    setSortKey,
    applyBusyId,
    handleApply,
    reload: reloadJobs,
  } = useStudentJobsDashboard(reloadDashboard)

  const jobsLoading = jobsState.status === 'idle' || jobsState.status === 'loading'

  const handleRefreshAll = () => {
    void reloadDashboard()
    void reloadJobs()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/80">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 px-4 pb-4 pt-3 md:px-6 md:pb-5">
        {/* Hero */}
        <header className="shrink-0 space-y-3 rounded-3xl bg-gradient-to-r from-indigo-50 via-indigo-100/80 to-slate-50 px-4 py-4 shadow-sm ring-1 ring-indigo-100/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Dashboard
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Hello {user.full_name.split(' ')[0] ?? user.full_name},
              </h1>
              <p className="text-[13px] text-slate-600">
                Here&apos;s a quick view of your progress and open opportunities.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 h-8 gap-1 self-start rounded-full border-indigo-200 bg-white/90 px-3 text-xs text-slate-700 shadow-sm hover:bg-white sm:self-auto"
              onClick={handleRefreshAll}
              disabled={dashboardLoading && jobsLoading}
            >
              <Loader2
                className={`h-3.5 w-3.5 ${dashboardLoading || jobsLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`}
                aria-hidden
              />
              Refresh
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="shrink-0 rounded-full border border-slate-200 bg-white p-0.5 shadow-sm">
          <div className="flex items-center justify-between gap-1 px-1 py-0.5 text-[11px] font-medium text-slate-600">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTab('progress')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all ${
                  tab === 'progress'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Progress
              </button>
              <button
                type="button"
                onClick={() => setTab('jobs')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all ${
                  tab === 'jobs'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" aria-hidden />
                Jobs
                {jobsState.status === 'ready' && jobs.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="ml-0.5 h-4 min-w-[1.5rem] justify-center rounded-full border-slate-300 bg-white/80 px-1 text-[10px] font-semibold text-slate-800"
                  >
                    {jobs.length}
                  </Badge>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {tab === 'progress' ? (
          <DashboardKpisAndCharts
            loading={dashboardLoading}
            stageRows={stageRows}
            careerLocal={careerLocal}
            typingAttempts={typingAttempts}
            applications={applications}
            enrollment={enrollment}
            submittedProjects={submittedProjects}
          />
        ) : null}

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === 'progress' ? (
            <ProgressPane
              loading={dashboardLoading}
              stageRows={stageRows}
              catalogSteps={catalogSteps}
              careerLocal={careerLocal}
            />
          ) : (
            <JobsPane
              state={jobsState}
              filteredJobs={filteredSorted}
              allJobsCount={jobs.length}
              query={query}
              setQuery={setQuery}
              sortKey={sortKey}
              setSortKey={setSortKey}
              applyBusyId={applyBusyId}
              onApply={handleApply}
              onReload={reloadJobs}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface DashboardKpisAndChartsProps {
  loading: boolean
  stageRows: StageProgressRecord[] | null
  careerLocal: { title: string; pct: number } | null
  typingAttempts: TypingAttempt[]
  applications: StudentJobApplicationsMe
  enrollment: EnrollmentMe | null
  submittedProjects: MySubmittedProject[]
}

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
        <p className="mt-1 line-clamp-2 text-base font-bold leading-tight text-slate-900 tabular-nums">{value}</p>
      )}
      {sub && !tileLoading ? (
        <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{sub}</p>
      ) : null}
    </Card>
  )
}

function DashboardKpisAndCharts({
  loading,
  stageRows,
  careerLocal,
  typingAttempts,
  applications,
  enrollment,
  submittedProjects,
}: DashboardKpisAndChartsProps) {
  const stages = stageRows ?? []
  const quizAvg = useMemo(() => computeQuizAvg(stages), [stages])
  const typingAvg = useMemo(() => computeTypingAvg(typingAttempts), [typingAttempts])
  const typingSeries = useMemo(
    () => [...typingAttempts].reverse().map((a, i) => ({ idx: i + 1, wpm: a.wpm })),
    [typingAttempts],
  )
  const quizBars = useMemo(() => {
    const tracked = stages.filter((r) => r.total_lessons > 0)
    const source = tracked.length > 0 ? tracked : stages
    return source.map((r) => ({ stage: String(r.stage_id), score: r.latest_quiz_score }))
  }, [stages])

  const approvedCount = submittedProjects.filter((p) => p.status === 'approved').length
  const submittedCount = submittedProjects.length
  const unlocked = stages.filter((r) => r.unlocked).length
  const totalTracked = stages.length
  const courseLine =
    totalTracked > 0 ? `Unlocked ${unlocked} / ${totalTracked} tracked stages` : 'No stage data yet'
  const courseSub = careerLocal ? `Roadmap focus ${careerLocal.pct}%` : undefined

  const attendanceLine =
    !enrollment || enrollment.attendance_pct === null ? 'Not enrolled' : `${enrollment.attendance_pct}%`
  const attendanceSub =
    enrollment && enrollment.batch_names.length > 0 ? enrollment.batch_names.join(', ') : undefined

  return (
    <div className="flex shrink-0 flex-col gap-3">
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
          sub={submittedCount > 0 ? `${submittedCount} submitted (portfolio)` : 'Portfolio submissions'}
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

      <div className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Typing WPM trend</p>
          <p className="text-[10px] text-slate-400">Recent attempts, oldest to newest</p>
          <div className="mt-2 h-44 w-full min-w-0">
            {loading ? (
              <div className="flex h-full items-center justify-center text-[12px] text-slate-400">Loading…</div>
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Quiz score by stage</p>
          <p className="text-[10px] text-slate-400">Latest quiz score per stage</p>
          <div className="mt-2 h-44 w-full min-w-0">
            {loading ? (
              <div className="flex h-full items-center justify-center text-[12px] text-slate-400">Loading…</div>
            ) : quizBars.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-[12px] text-slate-500">
                No stage progress yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizBars} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis width={36} tick={{ fontSize: 10 }} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Score']} />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

interface ProgressPaneProps {
  loading: boolean
  stageRows: StageProgressRecord[] | null
  catalogSteps: number | null
  careerLocal: { title: string; pct: number } | null
}

function ProgressPane({ loading, stageRows, catalogSteps, careerLocal }: ProgressPaneProps) {
  const hasStages = (stageRows?.length ?? 0) > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white/90 px-4 py-2 text-[13px] text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-hidden />
          Loading your dashboard…
        </div>
      ) : null}

      {/* Top hero-style grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-4 lg:grid-rows-2">
        {/* Main profile / growth card */}
        <Card className="relative col-span-1 row-span-2 flex min-h-0 flex-col overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-indigo-500 via-indigo-400 to-indigo-600 p-4 text-indigo-50 shadow-xl lg:col-span-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100/80">
                Profile growth
              </p>
              <p className="mt-1 text-xs text-indigo-100/90">Overall learning progress</p>
            </div>
            {careerLocal && (
              <div className="rounded-2xl bg-indigo-900/20 px-3 py-1.5 text-right text-[11px]">
                <p className="text-indigo-100/80">Role focus</p>
                <p className="font-semibold text-white">{careerLocal.title}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs text-indigo-100/80">Completion</p>
              <p className="text-3xl font-semibold tabular-nums text-white">
                {careerLocal ? `${careerLocal.pct}%` : '0%'}
              </p>
              <p className="mt-1 text-[11px] text-indigo-100/80">
                Based on syllabus items completed in this browser and backend records.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <div className="rounded-full bg-indigo-900/25 px-3 py-1">
                Catalog steps{' '}
                <span className="font-semibold text-white">{catalogSteps ?? 0}</span>
              </div>
              <div className="rounded-full bg-indigo-900/25 px-3 py-1">
                Stage rows{' '}
                <span className="font-semibold text-white">{stageRows?.length ?? 0}</span>
              </div>
            </div>
          </div>
          {/* Faux line chart */}
          <div className="mt-5 flex min-h-0 flex-1 items-end">
            <div className="relative h-32 w-full rounded-2xl bg-indigo-950/10 px-4 py-3">
              <div className="absolute inset-x-4 bottom-6 flex items-end justify-between gap-2">
                {[0.4, 0.7, 0.9, 0.6, 0.8].map((h, idx) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: synthetic chart only
                    key={idx}
                    className="w-6 rounded-full bg-indigo-300/70 shadow-sm shadow-indigo-900/20"
                    style={{ height: `${h * 80}px` }}
                  />
                ))}
              </div>
              <div className="absolute inset-x-4 bottom-2 flex justify-between text-[10px] text-indigo-200/80">
                <span>Start</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Side KPI cards */}
        <Card className="row-span-1 flex min-h-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Catalog steps
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{catalogSteps ?? 0}</p>
          <p className="mt-1 text-[11px] text-slate-500">Completed project steps across tracks.</p>
        </Card>

        <Card className="row-span-1 flex min-h-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Stage records
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {stageRows?.length ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Synced progress rows from roadmap stages.</p>
        </Card>
      </div>

      {hasStages ? (
        <Card className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Stage details
            </p>
            <span className="text-[11px] text-slate-500">{stageRows!.length} rows</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
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
                {stageRows!.map((row) => (
                  <tr key={row.stage_id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 font-mono text-xs text-slate-800">{row.stage_id}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {row.lessons_completed}/{row.total_lessons}
                    </td>
                    <td className="px-4 py-2 text-slate-600 tabular-nums">{row.latest_quiz_score}%</td>
                    <td className="px-4 py-2 text-slate-600">{row.unlocked ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

interface JobsPaneProps {
  state: JobsLoadState
  filteredJobs: StudentJobOpen[]
  allJobsCount: number
  query: string
  setQuery: (value: string) => void
  sortKey: JobsSortKey
  setSortKey: (value: JobsSortKey) => void
  applyBusyId: number | null
  onApply: (jobId: number) => void
  onReload: () => void
}

function JobsPane({
  state,
  filteredJobs,
  allJobsCount,
  query,
  setQuery,
  sortKey,
  setSortKey,
  applyBusyId,
  onApply,
  onReload,
}: JobsPaneProps) {
  const loading = state.status === 'idle' || state.status === 'loading'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <Card className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              <Sparkles className="h-3 w-3 text-blue-600" aria-hidden />
              Job pipeline
            </div>
            <p className="text-[13px] text-slate-600">
              Open listings from your program, with quick filters and apply actions.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-full border-slate-200 bg-white px-3 text-xs text-slate-700"
            onClick={() => onReload()}
            disabled={loading}
          >
            <Loader2 className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            Refresh
          </Button>
        </div>
      </Card>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {state.status === 'error' ? (
          <Card className="shrink-0 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[13px] text-amber-900 shadow-sm">
            <p className="font-semibold">Couldn&apos;t load jobs</p>
            <p className="mt-1 text-[12px] leading-snug">{state.message}</p>
          </Card>
        ) : null}

        <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
          <Card className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 space-y-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, company, location…"
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[13px] outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Search jobs"
                />
                {state.status === 'ready' && (
                  <p className="text-[11px] text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{filteredJobs.length}</span> of{' '}
                    {allJobsCount} roles
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                {(['newest', 'company', 'title'] as JobsSortKey[]).map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant={sortKey === key ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 text-[11px] ${
                      sortKey === key ? 'bg-slate-900 text-white' : 'border-slate-200 bg-white'
                    }`}
                    onClick={() => setSortKey(key)}
                  >
                    {key === 'newest' ? 'Newest' : key === 'company' ? 'Company' : 'Title'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-2 min-h-0 flex-1 overflow-auto space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-500 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading jobs…
              </div>
            ) : null}

            {state.status === 'ready' && filteredJobs.length === 0 && allJobsCount === 0 ? (
              <Card className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-[13px] text-slate-600 shadow-sm">
                <p>No openings yet. When admins publish roles, they&apos;ll appear here automatically.</p>
              </Card>
            ) : null}

            {state.status === 'ready' &&
              filteredJobs.map((job) => (
                <Card key={job.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{job.title}</h3>
                      <p className="truncate text-[12px] text-slate-600">
                        {job.company_name} · {job.location} · {job.employment_type}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-6 rounded-full border-slate-200 px-2 text-[11px]">
                      {metaStr(job.listing_metadata ?? undefined, 'seniorityLevel') ?? 'Any level'}
                    </Badge>
                  </div>
                  {job.description && (
                    <p className="line-clamp-3 text-[12px] leading-snug text-slate-600">{job.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {job.eligible_batch_name && (
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-[11px]">
                        Eligible batch: {job.eligible_batch_name}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    {job.external_apply_url ? (
                      <a
                        href={job.external_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        View listing
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1 rounded-lg bg-blue-600 px-3 text-[12px] font-semibold text-white hover:bg-blue-700"
                      onClick={() => onApply(job.id)}
                      disabled={applyBusyId === job.id}
                    >
                      {applyBusyId === job.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : null}
                      {job.external_apply_url ? 'Log interest' : 'Apply'}
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

