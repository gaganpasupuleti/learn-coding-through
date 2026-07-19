import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import { JobReadinessPanel, PlannerCard } from '@/components/student-dashboard/DashboardCalendarPanel'
import { DashboardTopHeader } from '@/components/student-dashboard/DashboardTopHeader'
import {
  DeadlinesPanel,
  PracticeProgressGrid,
  ProgressPanel,
  SyllabusPanel,
  TodayPanel,
  UpcomingClassesPanel,
} from '@/components/student-dashboard/DashboardContentSections'
import { CQ_PAGE_BG } from '@/components/student-dashboard/cq/cqTheme'
import { resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import type { AuthUser } from '@/lib/auth'
import { computeDaysRemaining, computeReadinessBreakdown } from '@/lib/dashboard-derive'
import {
  getCodePracticeSummary,
  getPracticeStreakSummary,
  getSqlPracticeSummary,
  getTypingPracticeSummary,
} from '@/lib/practice-progress-summary'
import { storeSelectedDateForPlanner } from '@/lib/learning-planner-derive'

type DashboardNavTarget =
  | 'roadmapper'
  | 'jobspy'
  | 'learning-planner'
  | 'calendar'
  | 'progress'
  | 'resume'
  | 'practice-sql'
  | 'practice-code'
  | 'practice-typing'

interface StudentDashboardPageProps {
  user: AuthUser
  onNavigate: (page: DashboardNavTarget) => void
}

export function StudentDashboardPage({ user, onNavigate }: StudentDashboardPageProps) {
  const snapshot = useStudentDashboardSnapshot(user)
  const plannerPreview = useLearningPlanner(user)
  const firstName = user.full_name.split(' ')[0] ?? user.full_name

  const daysRemaining = useMemo(
    () => computeDaysRemaining(snapshot.deadlines),
    [snapshot.deadlines],
  )

  const nextLessonTitle = useMemo(
    () => resolveNextLessonTitle(snapshot.careerJourney, snapshot.upcomingSessions),
    [snapshot.careerJourney, snapshot.upcomingSessions],
  )

  const readiness = useMemo(
    () =>
      computeReadinessBreakdown({
        submittedProjects: snapshot.submittedProjects,
        careerPct: snapshot.careerJourney?.pct ?? null,
        stageRows: snapshot.stageRows,
        typingAttempts: snapshot.typingAttempts,
        catalogSteps: snapshot.catalogSteps,
      }),
    [
      snapshot.submittedProjects,
      snapshot.careerJourney,
      snapshot.stageRows,
      snapshot.typingAttempts,
      snapshot.catalogSteps,
    ],
  )

  const typingWpm =
    snapshot.typingAttempts.length > 0
      ? Math.round(
          snapshot.typingAttempts.reduce((s, a) => s + a.wpm, 0) / snapshot.typingAttempts.length,
        )
      : null

  const sqlSummary = getSqlPracticeSummary()
  const codeSummary = getCodePracticeSummary()
  const typingSummary = getTypingPracticeSummary(typingWpm)
  const streak = getPracticeStreakSummary()

  const progressPct = snapshot.careerJourney?.pct ?? 0
  const pathTitle = snapshot.careerJourney?.title ?? 'Choose your career path'

  return (
    <div className={cn(CQ_PAGE_BG, 'min-h-full')}>
      <div className="mx-auto w-full min-w-0 max-w-7xl space-y-2 p-3 md:p-4 lg:max-w-[1440px] xl:max-w-[1600px]">
      {/* Hero */}
      <DashboardTopHeader
        firstName={firstName}
        pathTitle={pathTitle}
        progressPct={progressPct}
        currentStreak={streak.currentStreak}
        practicedToday={streak.practicedToday}
        daysRemaining={daysRemaining}
        nextLessonTitle={nextLessonTitle}
        loading={snapshot.loading}
        onContinuePractice={() => onNavigate('practice-code')}
        onOpenCareer={() => onNavigate('roadmapper')}
        onOpenCalendar={() => onNavigate('calendar')}
        onOpenResume={() => onNavigate('resume')}
        onOpenJobs={() => onNavigate('jobspy')}
      />

      {/* Main grid: left content + right planner */}
      <div className="mt-2 grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] xl:items-start">

        {/* Left column: stacked rows, tight gaps */}
        <div className="flex min-w-0 flex-col gap-2">

          {/* Row 1: Today + Practice — stack until xl so practice cards stay readable */}
          <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] xl:items-stretch">
            <TodayPanel
              sessions={snapshot.upcomingSessions}
              deadlines={snapshot.deadlines}
              loading={snapshot.loading}
              onOpenCalendar={() => onNavigate('calendar')}
            />
            <PracticeProgressGrid
              sql={sqlSummary}
              code={codeSummary}
              typing={typingSummary}
              onPracticeSql={() => onNavigate('practice-sql')}
              onPracticeCode={() => onNavigate('practice-code')}
              onPracticeTyping={() => onNavigate('practice-typing')}
            />
          </div>

          {/* Row 2: Progress + Mistakes full width */}
          <ProgressPanel
            careerJourney={snapshot.careerJourney}
            stageRows={snapshot.stageRows}
            catalogSteps={snapshot.catalogSteps}
            loading={snapshot.loading}
            onViewProgress={() => onNavigate('progress')}
          />

          {/* Row 3: Upcoming + Syllabus side-by-side */}
          <div className="grid min-w-0 gap-2 md:grid-cols-2 md:items-stretch">
            <UpcomingClassesPanel sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
            <SyllabusPanel
              careerJourney={snapshot.careerJourney}
              stageRows={snapshot.stageRows}
              loading={snapshot.loading}
              onOpenCareer={() => onNavigate('roadmapper')}
            />
          </div>

          {/* Row 4: Deadlines + Career readiness side-by-side */}
          <div className="grid min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr] xl:items-stretch">
            <DeadlinesPanel deadlines={snapshot.deadlines} loading={snapshot.loading} />
            <JobReadinessPanel
              readiness={readiness}
              loading={snapshot.loading}
              onOpenJobs={() => onNavigate('jobspy')}
            />
          </div>
        </div>

        {/* Right: Planner — sticky on large screens when it sits beside the left column */}
        <div className="min-w-0 xl:sticky xl:top-3">
          <PlannerCard
            viewMonth={plannerPreview.viewMonth}
            onViewMonthChange={plannerPreview.setViewMonth}
            selectedDate={plannerPreview.selectedDate}
            onSelectDate={(date) => {
              storeSelectedDateForPlanner(date)
              plannerPreview.setSelectedDate(date)
            }}
            markedDates={plannerPreview.markedDates}
            dayPlan={plannerPreview.dayPlan}
            plannerLoading={plannerPreview.loading}
            onOpenPlanner={() => {
              storeSelectedDateForPlanner(plannerPreview.selectedDate)
              onNavigate('calendar')
            }}
          />
        </div>
      </div>
      </div>
    </div>
  )
}
