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
    <div className={cn(CQ_PAGE_BG, 'min-h-full p-3 md:p-4')}>
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
      <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_280px] lg:items-start">

        {/* Left column: stacked rows, tight gaps */}
        <div className="flex flex-col gap-2">

          {/* Row 1: Today + Practice side-by-side */}
          <div className="grid gap-2 lg:grid-cols-[1fr_1.4fr] lg:items-stretch">
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
          <div className="grid gap-2 lg:grid-cols-2 lg:items-stretch">
            <UpcomingClassesPanel sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
            <SyllabusPanel
              careerJourney={snapshot.careerJourney}
              stageRows={snapshot.stageRows}
              loading={snapshot.loading}
              onOpenCareer={() => onNavigate('roadmapper')}
            />
          </div>

          {/* Row 4: Deadlines + Career readiness side-by-side */}
          <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
            <DeadlinesPanel deadlines={snapshot.deadlines} loading={snapshot.loading} />
            <JobReadinessPanel
              readiness={readiness}
              loading={snapshot.loading}
              onOpenJobs={() => onNavigate('jobspy')}
            />
          </div>
        </div>

        {/* Right: Planner — sticky so it stays visible as left column scrolls */}
        <div className="lg:sticky lg:top-3">
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
  )
}
