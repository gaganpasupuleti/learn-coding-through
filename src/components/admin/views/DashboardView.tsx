import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BookOpen,
  CalendarBlank,
  Cube,
  Lightning,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { bucketIsoDatesInRange } from '../utils/chartSeries'
import {
  computeScopedUserIds,
  filterActivityLogs,
  filterUserActivity,
  formatSlicerSummary,
  type QuarterSlice,
  resolveDateRange,
  uniqueMentorNames,
} from '../utils/dashboardSlicerLogic'
import {
  AdminActivityLineChart,
  AdminUserActivityAreaChart,
} from '../widgets/DashboardCharts'
import { DashboardSlicers } from '../widgets/DashboardSlicers'
import { KpiStatCard } from '../widgets/KpiStatCard'

import { reportCanvasClass, vizTileClass, vizTileInteractiveClass } from './dashboardPolish'

function VizSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="h-3 w-0.5 shrink-0 rounded-full bg-primary/80" aria-hidden />
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-muted-foreground">{children}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50/80 px-1.5 py-1 dark:bg-muted/30">
      <p className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-500 dark:text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-semibold tabular-nums tracking-tight text-slate-900 dark:text-foreground">{value}</p>
    </div>
  )
}

function currentCalendarQuarter(): 1 | 2 | 3 | 4 {
  const m = new Date().getMonth()
  return (Math.floor(m / 3) + 1) as 1 | 2 | 3 | 4
}

export function DashboardView() {
  const {
    overview,
    metrics,
    monthlyKpis,
    roleSplitInsights,
    activityLogs,
    userActivityEntries,
    students,
    batches,
    setSection,
  } = useAdminWorkspaceContext()

  const defaultYear = new Date().getFullYear()
  const defaultQuarter = currentCalendarQuarter()

  const [slicerYear, setSlicerYear] = useState(defaultYear)
  const [slicerQuarter, setSlicerQuarter] = useState<QuarterSlice>(defaultQuarter)
  const [slicerMentor, setSlicerMentor] = useState<string | null>(null)
  const [slicerBatchId, setSlicerBatchId] = useState<number | null>(null)
  const [slicerStudentId, setSlicerStudentId] = useState<number | null>(null)

  const years = useMemo(() => Array.from({ length: 6 }, (_, i) => defaultYear - i), [defaultYear])

  const mentors = useMemo(() => uniqueMentorNames(batches), [batches])

  const batchesForSelect = useMemo(() => {
    const list = slicerMentor
      ? batches.filter((b) => (b.mentor_name ?? '').trim() === slicerMentor)
      : batches
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [batches, slicerMentor])

  const studentsForSelect = useMemo(() => {
    let list = [...students].sort((a, b) => a.full_name.localeCompare(b.full_name))
    if (slicerMentor) {
      const names = new Set(batchesForSelect.map((b) => b.name))
      list = list.filter((s) => s.batch_name != null && names.has(s.batch_name))
    }
    if (slicerBatchId != null) {
      const batch = batches.find((b) => b.id === slicerBatchId)
      if (batch) list = list.filter((s) => s.batch_name === batch.name)
    }
    return list
  }, [students, batches, slicerMentor, slicerBatchId, batchesForSelect])

  useEffect(() => {
    if (slicerBatchId == null) return
    const b = batches.find((x) => x.id === slicerBatchId)
    if (!b || (slicerMentor && (b.mentor_name ?? '').trim() !== slicerMentor)) {
      setSlicerBatchId(null)
    }
  }, [slicerMentor, slicerBatchId, batches])

  useEffect(() => {
    if (slicerStudentId == null) return
    const st = students.find((s) => s.id === slicerStudentId)
    if (!st) {
      setSlicerStudentId(null)
      return
    }
    if (slicerBatchId != null) {
      const batch = batches.find((x) => x.id === slicerBatchId)
      if (batch && st.batch_name !== batch.name) setSlicerStudentId(null)
    }
  }, [slicerBatchId, slicerStudentId, students, batches])

  const dateRange = useMemo(() => resolveDateRange(slicerYear, slicerQuarter), [slicerYear, slicerQuarter])

  const scopedUserIds = useMemo(
    () =>
      computeScopedUserIds({
        students,
        batches,
        mentorName: slicerMentor,
        batchId: slicerBatchId,
        studentId: slicerStudentId,
      }),
    [students, batches, slicerMentor, slicerBatchId, slicerStudentId],
  )

  const filteredActivityLogs = useMemo(
    () => filterActivityLogs(activityLogs, dateRange.start, dateRange.end, scopedUserIds),
    [activityLogs, dateRange, scopedUserIds],
  )

  const filteredUserActivity = useMemo(
    () => filterUserActivity(userActivityEntries, dateRange.start, dateRange.end, scopedUserIds),
    [userActivityEntries, dateRange, scopedUserIds],
  )

  const adminActivitySeries = useMemo(
    () => bucketIsoDatesInRange(filteredActivityLogs.map((e) => e.created_at), dateRange.start, dateRange.end),
    [filteredActivityLogs, dateRange],
  )
  const userActivitySeries = useMemo(
    () => bucketIsoDatesInRange(filteredUserActivity.map((e) => e.occurred_at), dateRange.start, dateRange.end),
    [filteredUserActivity, dateRange],
  )
  const selectedBatch = slicerBatchId != null ? batches.find((b) => b.id === slicerBatchId) ?? null : null
  const selectedStudent = slicerStudentId != null ? students.find((s) => s.id === slicerStudentId) ?? null : null

  const slicerSummary = useMemo(
    () =>
      formatSlicerSummary({
        year: slicerYear,
        quarter: slicerQuarter,
        batch: selectedBatch,
        student: selectedStudent,
        mentor: slicerMentor,
      }),
    [slicerYear, slicerQuarter, selectedBatch, selectedStudent, slicerMentor],
  )

  const hasCustomFilters =
    slicerYear !== defaultYear ||
    slicerQuarter !== defaultQuarter ||
    slicerMentor != null ||
    slicerBatchId != null ||
    slicerStudentId != null

  const resetSlicers = () => {
    setSlicerYear(defaultYear)
    setSlicerQuarter(defaultQuarter)
    setSlicerMentor(null)
    setSlicerBatchId(null)
    setSlicerStudentId(null)
  }

  const waitlistPending = overview?.waitlist_pending ?? 0

  const iconSm = (node: ReactNode) => (
    <span className="text-slate-400 transition-colors group-hover:text-primary dark:text-muted-foreground [&_svg]:size-3.5">
      {node}
    </span>
  )

  const studentRows = roleSplitInsights?.student_insights ?? []
  const facultyRows = roleSplitInsights?.faculty_insights ?? []

  return (
    <div className={cn(reportCanvasClass, 'flex min-h-0 flex-1 flex-col gap-2 overflow-auto')}>
      <DashboardSlicers
        year={slicerYear}
        quarter={slicerQuarter}
        batchId={slicerBatchId}
        studentId={slicerStudentId}
        mentorName={slicerMentor}
        years={years}
        batchesForSelect={batchesForSelect}
        studentsForSelect={studentsForSelect}
        mentors={mentors}
        onYear={setSlicerYear}
        onQuarter={setSlicerQuarter}
        onBatchId={setSlicerBatchId}
        onStudentId={setSlicerStudentId}
        onMentor={setSlicerMentor}
        onReset={resetSlicers}
        hasCustomFilters={hasCustomFilters}
      />
      <p className="rounded-md border border-slate-200/70 bg-white/60 px-2 py-1 text-[10px] font-medium text-slate-600 dark:border-border dark:bg-card/60 dark:text-muted-foreground">
        Charts: {slicerSummary}
      </p>

      {/* Row 1 */}
      <div className="grid grid-cols-12 gap-2">
        <Card className={cn(vizTileClass, 'col-span-12 p-2.5 lg:col-span-3')}>
          <VizSectionTitle>Snapshot</VizSectionTitle>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <MiniStat label="Users" value={overview?.total_users ?? metrics?.total_students ?? '—'} />
            <MiniStat label="Active batches" value={overview?.active_batches ?? monthlyKpis?.active_classes_running ?? '—'} />
            <MiniStat label="Courses" value={overview ? overview.catalog_quizzes + overview.catalog_projects : '—'} />
            <MiniStat label="WL pending" value={overview?.waitlist_pending ?? '—'} />
            <MiniStat label="Admins" value={overview?.total_admins ?? '—'} />
          </div>
          {hasCustomFilters ? (
            <p className="mt-2 rounded-md border border-primary/15 bg-primary/[0.06] px-2 py-1.5 text-[10px] leading-snug text-slate-700 dark:border-primary/25 dark:bg-primary/10 dark:text-foreground">
              <span className="font-semibold tabular-nums">{studentsForSelect.length}</span> students match slicers · KPI tiles
              below stay global (API totals).
            </p>
          ) : null}
        </Card>

        <Card
          className={cn(
            'col-span-12 flex flex-col justify-center gap-2 rounded-lg border-0 p-2.5 text-primary-foreground shadow-md lg:col-span-6',
            'bg-gradient-to-br from-primary via-primary to-primary/90',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_8px_24px_-8px_rgba(37,99,235,0.45)]',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-0.5 shrink-0 rounded-full bg-primary-foreground/70" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/90">Operations</p>
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 border-0 bg-white/95 px-2.5 text-[11px] font-semibold text-primary shadow-sm hover:bg-white"
                onClick={() => setSection('access')}
              >
                Waitlist
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-primary-foreground/30 bg-primary-foreground/12 px-2.5 text-[11px] text-primary-foreground hover:bg-primary-foreground/22"
                onClick={() => setSection('jobspy-ops')}
              >
                Job Board Ops
              </Button>
            </div>
          </div>
          <p className="pl-2.5 text-[11px] leading-relaxed text-primary-foreground/95">
            {waitlistPending > 0 ? (
              <>
                <span className="font-semibold tabular-nums">{waitlistPending}</span> waitlist pending.{' '}
              </>
            ) : (
              <>Waitlist clear. Job board listings are live. </>
            )}
          </p>
        </Card>

        <Card className={cn(vizTileClass, 'col-span-12 flex flex-col justify-center p-2.5 lg:col-span-3')}>
          <VizSectionTitle>Period</VizSectionTitle>
          <p className="mt-1 truncate pl-2.5 text-sm font-semibold tracking-tight text-slate-900 dark:text-foreground">
            {monthlyKpis?.month_label ?? '—'}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-slate-200/80 pt-2 text-[10px] dark:border-border">
            <span className="text-slate-500 dark:text-muted-foreground">Enrolled</span>
            <span className="text-right font-semibold tabular-nums text-slate-800 dark:text-foreground">
              {monthlyKpis?.total_enrolled_students ?? '—'}
            </span>
            <span className="text-slate-500 dark:text-muted-foreground">Enquiries</span>
            <span className="text-right font-semibold tabular-nums text-slate-800 dark:text-foreground">
              {monthlyKpis?.enquiries_this_month ?? '—'}
            </span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-2">
        <AdminActivityLineChart data={adminActivitySeries} compact className="col-span-12 sm:col-span-6" />
        <AdminUserActivityAreaChart data={userActivitySeries} compact className="col-span-12 sm:col-span-6" />
      </div>

      {/* KPI matrix */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <KpiStatCard
          compact
          label="Total users"
          value={overview?.total_users ?? '—'}
          icon={iconSm(<UsersThree weight="bold" />)}
          onClick={() => setSection('students')}
        />
        <KpiStatCard
          compact
          label="Active users"
          value={overview?.active_users ?? '—'}
          icon={iconSm(<Lightning weight="bold" />)}
          onClick={() => setSection('students')}
        />
        <KpiStatCard
          compact
          label="Admins"
          value={overview?.total_admins ?? '—'}
          icon={iconSm(<ShieldCheck weight="bold" />)}
          onClick={() => setSection('access')}
        />
        <KpiStatCard compact label="Quizzes" value={overview?.catalog_quizzes ?? '—'} icon={iconSm(<BookOpen />)} />
        <KpiStatCard compact label="Projects" value={overview?.catalog_projects ?? '—'} icon={iconSm(<Cube />)} />
        <KpiStatCard
          compact
          label="Classes completing"
          value={monthlyKpis?.classes_completing_this_month ?? '—'}
          icon={iconSm(<CalendarBlank />)}
          onClick={() => setSection('classes')}
        />
        <KpiStatCard
          compact
          label="Total batches"
          value={overview?.total_batches ?? '—'}
          icon={iconSm(<CalendarBlank />)}
          onClick={() => setSection('classes')}
        />
        <KpiStatCard
          compact
          label="Active batches"
          value={overview?.active_batches ?? '—'}
          icon={iconSm(<CalendarBlank />)}
          onClick={() => setSection('classes')}
        />
        <KpiStatCard
          compact
          label="Enquiries"
          value={monthlyKpis?.enquiries_this_month ?? '—'}
          onClick={() => setSection('activity')}
        />
      </div>

      {/* Waitlist + averages */}
      <div className="grid grid-cols-12 gap-2">
        <button
          type="button"
          className={cn(
            vizTileInteractiveClass,
            'col-span-4 border-l-[3px] border-l-amber-500 p-2.5 text-left sm:col-span-2',
          )}
          onClick={() => setSection('access')}
        >
          <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground">WL pending</p>
          <p className="text-lg font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
            {overview?.waitlist_pending ?? '—'}
          </p>
        </button>
        <button
          type="button"
          className={cn(
            vizTileInteractiveClass,
            'col-span-4 border-l-[3px] border-l-emerald-500 p-2.5 text-left sm:col-span-2',
          )}
          onClick={() => setSection('access')}
        >
          <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground">WL approved</p>
          <p className="text-lg font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {overview?.waitlist_approved ?? '—'}
          </p>
        </button>
        <button
          type="button"
          className={cn(
            vizTileInteractiveClass,
            'col-span-4 border-l-[3px] border-l-red-500 p-2.5 text-left sm:col-span-2',
          )}
          onClick={() => setSection('access')}
        >
          <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground">WL rejected</p>
          <p className="text-lg font-bold tabular-nums tracking-tight text-red-600 dark:text-red-400">
            {overview?.waitlist_rejected ?? '—'}
          </p>
        </button>
        <KpiStatCard
          compact
          className="col-span-6 sm:col-span-3"
          label="Avg credits"
          value={metrics?.average_credits ?? '—'}
          onClick={() => setSection('students')}
        />
        <KpiStatCard
          compact
          className="col-span-6 sm:col-span-3"
          label="Avg XP"
          value={metrics?.average_xp_points ?? '—'}
          onClick={() => setSection('students')}
        />
      </div>

      {/* Insights */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-2">
        <Card
          className={cn(
            vizTileClass,
            'col-span-12 flex min-h-[7.5rem] cursor-pointer flex-col p-2.5 transition-colors hover:border-primary/25 lg:col-span-6',
          )}
          role="button"
          tabIndex={0}
          onClick={() => setSection('students')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setSection('students')
            }
          }}
        >
          <VizSectionTitle>Student insights</VizSectionTitle>
          <div className="mt-1 min-h-0 flex-1 overflow-auto rounded-md border border-slate-100/90 bg-slate-50/50 p-1 dark:border-border dark:bg-muted/20">
            {studentRows.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-slate-500 dark:text-muted-foreground">No breakdown yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {studentRows.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-transparent bg-white/80 px-1.5 py-1 transition-colors hover:border-slate-200 hover:bg-white dark:bg-card/60 dark:hover:border-border"
                  >
                    <p className="truncate text-[9px] font-medium text-slate-500 dark:text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-semibold tabular-nums text-slate-900 dark:text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card
          className={cn(
            vizTileClass,
            'col-span-12 flex min-h-[7.5rem] cursor-pointer flex-col p-2.5 transition-colors hover:border-primary/25 lg:col-span-6',
          )}
          role="button"
          tabIndex={0}
          onClick={() => setSection('classes')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setSection('classes')
            }
          }}
        >
          <VizSectionTitle>Faculty insights</VizSectionTitle>
          <div className="mt-1 min-h-0 flex-1 overflow-auto rounded-md border border-slate-100/90 bg-slate-50/50 p-1 dark:border-border dark:bg-muted/20">
            {facultyRows.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-slate-500 dark:text-muted-foreground">No breakdown yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {facultyRows.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-transparent bg-white/80 px-1.5 py-1 transition-colors hover:border-slate-200 hover:bg-white dark:bg-card/60 dark:hover:border-border"
                  >
                    <p className="truncate text-[9px] font-medium text-slate-500 dark:text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-semibold tabular-nums text-slate-900 dark:text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
