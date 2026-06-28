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
  getMistakesSummary,
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
  const mistakes = getMistakesSummary()

  const progressPct = snapshot.careerJourney?.pct ?? 0
  const pathTitle = snapshot.careerJourney?.title ?? 'Choose your career path'

  // Single-screen bento: hero band on top, then a height-filling grid.
  // Desktop fills the viewport with no page scroll; cards clip rather than
  // push the page taller. Mobile/tablet collapse to a normal scrolling stack.
  const cell = 'min-h-0 overflow-hidden [&>*]:h-full'

  return (
    <div
      className={cn(
        CQ_PAGE_BG,
        'flex min-h-full flex-col gap-2.5 p-2.5 md:gap-3 md:p-3 lg:h-full lg:min-h-0',
      )}
    >
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

      <div className="grid gap-2.5 md:gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-12">
        {/* Left: 9-col, 4-row bento that fills the available height */}
        <div className="grid gap-2.5 md:gap-3 lg:col-span-9 lg:min-h-0 lg:grid-cols-9 lg:auto-rows-fr">
          <div className={cn(cell, 'lg:col-span-4')}>
            <TodayPanel
              sessions={snapshot.upcomingSessions}
              deadlines={snapshot.deadlines}
              loading={snapshot.loading}
              onOpenCalendar={() => onNavigate('calendar')}
            />
          </div>

          <div className={cn(cell, 'lg:col-span-5')}>
            <PracticeProgressGrid
              sql={sqlSummary}
              code={codeSummary}
              typing={typingSummary}
              onPracticeSql={() => onNavigate('practice-sql')}
              onPracticeCode={() => onNavigate('practice-code')}
              onPracticeTyping={() => onNavigate('practice-typing')}
            />
          </div>

          <div className={cn(cell, 'lg:col-span-9')}>
            <ProgressPanel
              careerJourney={snapshot.careerJourney}
              stageRows={snapshot.stageRows}
              catalogSteps={snapshot.catalogSteps}
              mistakes={mistakes}
              loading={snapshot.loading}
              onViewProgress={() => onNavigate('progress')}
            />
          </div>

          <div className={cn(cell, 'lg:col-span-4')}>
            <UpcomingClassesPanel sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
          </div>

          <div className={cn(cell, 'lg:col-span-5')}>
            <SyllabusPanel
              careerJourney={snapshot.careerJourney}
              stageRows={snapshot.stageRows}
              loading={snapshot.loading}
              onOpenCareer={() => onNavigate('roadmapper')}
            />
          </div>

          <div className={cn(cell, 'lg:col-span-4')}>
            <DeadlinesPanel deadlines={snapshot.deadlines} loading={snapshot.loading} />
          </div>

          <div className={cn(cell, 'lg:col-span-5')}>
            <JobReadinessPanel
              readiness={readiness}
              loading={snapshot.loading}
              onOpenJobs={() => onNavigate('jobspy')}
            />
          </div>
        </div>

        {/* Right: full-height planner rail */}
        <div className={cn(cell, 'lg:col-span-3')}>
          <PlannerCard
            className="h-full"
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
