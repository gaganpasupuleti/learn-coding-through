import { useMemo, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { PlannerPreviewWidget } from '@/components/student-dashboard/PlannerPreviewWidget'
import { DashboardHero, resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { DeadlinesTaskBoard } from '@/components/student-dashboard/DeadlinesTaskBoard'
import { JobReadinessCard } from '@/components/student-dashboard/JobReadinessCard'
import { LearningJourneyCard } from '@/components/student-dashboard/LearningJourneyCard'
import { NextDeadlineCard } from '@/components/student-dashboard/NextDeadlineCard'
import { OldMistakesReviewCard } from '@/components/student-dashboard/OldMistakesReviewCard'
import { OverallProgressCard } from '@/components/student-dashboard/OverallProgressCard'
import { PracticeProgressCard } from '@/components/student-dashboard/PracticeProgressCard'
import { PracticeStreakCard } from '@/components/student-dashboard/PracticeStreakCard'
import { ResumeReadinessCard } from '@/components/student-dashboard/ResumeReadinessCard'
import { TodayClassCard } from '@/components/student-dashboard/TodayClassCard'
import { UpcomingClassesTimeline } from '@/components/student-dashboard/UpcomingClassesTimeline'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import {
  DASHBOARD_SECTION_LABEL,
  STUDENT_PAGE_BG,
} from '@/components/student-dashboard/dashboard-styles'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import type { AuthUser } from '@/lib/auth'
import { computeDaysRemaining, computeReadinessBreakdown } from '@/lib/dashboard-derive'
import {
  getCodePracticeSummary,
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

function DashboardSection({
  title,
  description,
  children,
  secondary = false,
}: {
  title: string
  description?: string
  children: ReactNode
  secondary?: boolean
}) {
  return (
    <section className={cn(secondary && 'pt-2')}>
      <div className="mb-3">
        <h2
          className={cn(
            DASHBOARD_SECTION_LABEL,
            !secondary && 'text-slate-700',
            secondary && 'font-medium normal-case tracking-normal text-slate-400',
          )}
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function SupportSidebar({
  readiness,
  plannerPreview,
  onNavigate,
  loading,
}: {
  readiness: ReturnType<typeof computeReadinessBreakdown>
  plannerPreview: ReturnType<typeof useLearningPlanner>
  onNavigate: (page: DashboardNavTarget) => void
  loading: boolean
}) {
  return (
    <aside className="space-y-4 lg:space-y-5">
      <PracticeStreakCard compact />
      <ResumeReadinessCard compact onOpenResume={() => onNavigate('resume')} />
      <PlannerPreviewWidget
        dayPlan={plannerPreview.dayPlan}
        viewMonth={plannerPreview.viewMonth}
        onViewMonthChange={plannerPreview.setViewMonth}
        selectedDate={plannerPreview.selectedDate}
        markedDates={plannerPreview.markedDates}
        loading={plannerPreview.loading}
        onSelectDate={(date) => {
          storeSelectedDateForPlanner(date)
          plannerPreview.setSelectedDate(date)
        }}
        onOpenPlanner={() => {
          storeSelectedDateForPlanner(plannerPreview.selectedDate)
          onNavigate('calendar')
        }}
      />
      <JobReadinessCard breakdown={readiness} loading={loading} />
    </aside>
  )
}

function PracticeRow({
  sqlSummary,
  codeSummary,
  typingSummary,
  onNavigate,
}: {
  sqlSummary: ReturnType<typeof getSqlPracticeSummary>
  codeSummary: ReturnType<typeof getCodePracticeSummary>
  typingSummary: ReturnType<typeof getTypingPracticeSummary>
  onNavigate: (page: DashboardNavTarget) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <PracticeProgressCard
        summary={sqlSummary}
        accent="blue"
        onOpen={() => onNavigate('practice-sql')}
      />
      <PracticeProgressCard
        summary={codeSummary}
        accent="violet"
        onOpen={() => onNavigate('practice-code')}
      />
      <PracticeProgressCard
        summary={typingSummary}
        accent="teal"
        onOpen={() => onNavigate('practice-typing')}
      />
    </div>
  )
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

  const heroProps = {
    firstName,
    careerJourney: snapshot.careerJourney,
    nextLessonTitle,
    daysRemaining,
    loading: snapshot.loading,
    onContinueLearning: () => onNavigate('roadmapper'),
  }

  const sidebarProps = {
    readiness,
    plannerPreview,
    onNavigate,
    loading: snapshot.loading,
  }

  return (
    <div className={cn(STUDENT_PAGE_BG, 'px-4 py-6 md:px-6 md:py-8')}>
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <DashboardHero {...heroProps} />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="space-y-6 lg:col-span-8 lg:space-y-8">
            <DashboardSection
              title="Today"
              description="Your class and the next deadline to focus on."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <TodayClassCard
                  sessions={snapshot.upcomingSessions}
                  loading={snapshot.loading}
                  emphasized
                  onOpenCalendar={() => onNavigate('calendar')}
                />
                <NextDeadlineCard deadlines={snapshot.deadlines} loading={snapshot.loading} />
              </div>
            </DashboardSection>

            <DashboardSection
              title="Practice"
              description="Pick up where you left off in SQL, code, or typing."
            >
              <PracticeRow
                sqlSummary={sqlSummary}
                codeSummary={codeSummary}
                typingSummary={typingSummary}
                onNavigate={onNavigate}
              />
            </DashboardSection>

            <DashboardSection title="Progress">
              <div className="grid gap-4 md:grid-cols-2">
                <OverallProgressCard
                  careerJourney={snapshot.careerJourney}
                  stageRows={snapshot.stageRows}
                  catalogSteps={snapshot.catalogSteps}
                  loading={snapshot.loading}
                  onViewProgress={() => onNavigate('progress')}
                />
                <OldMistakesReviewCard onReview={() => onNavigate('progress')} />
              </div>
            </DashboardSection>

            <DashboardSection title="Upcoming classes" secondary>
              <UpcomingClassesTimeline
                sessions={snapshot.upcomingSessions}
                loading={snapshot.loading}
              />
            </DashboardSection>

            <DashboardSection title="All deadlines" secondary>
              <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
            </DashboardSection>

            <DashboardSection title="Syllabus overview" secondary>
              <LearningJourneyCard
                careerJourney={snapshot.careerJourney}
                stageRows={snapshot.stageRows}
                loading={snapshot.loading}
              />
            </DashboardSection>
          </div>

          <div className="lg:col-span-4">
            <SupportSidebar {...sidebarProps} />
          </div>
        </div>
      </div>
    </div>
  )
}
