import { useMemo } from 'react'

import { PlannerPreviewWidget } from '@/components/student-dashboard/PlannerPreviewWidget'
import { DashboardHero, resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { DeadlinesTaskBoard } from '@/components/student-dashboard/DeadlinesTaskBoard'
import { JobReadinessCard } from '@/components/student-dashboard/JobReadinessCard'
import { LearningJourneyCard } from '@/components/student-dashboard/LearningJourneyCard'
import { OldMistakesReviewCard } from '@/components/student-dashboard/OldMistakesReviewCard'
import { OverallProgressCard } from '@/components/student-dashboard/OverallProgressCard'
import { PracticeProgressCard } from '@/components/student-dashboard/PracticeProgressCard'
import { PracticeStreakCard } from '@/components/student-dashboard/PracticeStreakCard'
import { ResumeReadinessCard } from '@/components/student-dashboard/ResumeReadinessCard'
import { TodayClassCard } from '@/components/student-dashboard/TodayClassCard'
import { UpcomingClassesTimeline } from '@/components/student-dashboard/UpcomingClassesTimeline'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
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

function RightSidebar({
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
    <div className="space-y-6">
      <PracticeStreakCard />
      <ResumeReadinessCard onOpenResume={() => onNavigate('resume')} />
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
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Job Board</h3>
        <p className="text-sm text-slate-600 mt-2">Browse live roles from JobSpy — LinkedIn, Indeed, and more.</p>
        <button
          type="button"
          onClick={() => onNavigate('jobspy')}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Open Job Board
        </button>
      </div>
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

  const mainGrid = (
    <>
      <div className="col-span-12">
        <DashboardHero
          firstName={firstName}
          careerJourney={snapshot.careerJourney}
          nextLessonTitle={nextLessonTitle}
          daysRemaining={daysRemaining}
          loading={snapshot.loading}
          onContinueLearning={() => onNavigate('roadmapper')}
        />
      </div>

      <div className="col-span-12 grid gap-6 md:grid-cols-2 lg:col-span-8 lg:grid-cols-1">
        <TodayClassCard
          sessions={snapshot.upcomingSessions}
          loading={snapshot.loading}
          onOpenCalendar={() => onNavigate('calendar')}
        />
        <UpcomingClassesTimeline sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
      </div>

      <div className="col-span-12 lg:col-span-4 lg:row-span-2 lg:row-start-2">
        <RightSidebar
          readiness={readiness}
          plannerPreview={plannerPreview}
          onNavigate={onNavigate}
          loading={snapshot.loading}
        />
      </div>

      <div className="col-span-12 lg:col-span-8">
        <LearningJourneyCard
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          loading={snapshot.loading}
        />
      </div>

      <div className="col-span-12 lg:col-span-8">
        <OverallProgressCard
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          catalogSteps={snapshot.catalogSteps}
          loading={snapshot.loading}
          onViewProgress={() => onNavigate('progress')}
        />
      </div>

      <div className="col-span-12 grid gap-4 sm:grid-cols-3 lg:col-span-8">
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

      <div className="col-span-12 lg:col-span-8">
        <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
      </div>

      <div className="col-span-12 lg:col-span-8">
        <OldMistakesReviewCard onReview={() => onNavigate('progress')} />
      </div>
    </>
  )

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 md:p-6">
      <div className="mx-auto hidden max-w-7xl lg:grid lg:grid-cols-12 lg:gap-6">{mainGrid}</div>

      <div className="mx-auto max-w-7xl space-y-6 lg:hidden">
        <DashboardHero
          firstName={firstName}
          careerJourney={snapshot.careerJourney}
          nextLessonTitle={nextLessonTitle}
          daysRemaining={daysRemaining}
          loading={snapshot.loading}
          onContinueLearning={() => onNavigate('roadmapper')}
        />
        <TodayClassCard
          sessions={snapshot.upcomingSessions}
          loading={snapshot.loading}
          onOpenCalendar={() => onNavigate('calendar')}
        />
        <PracticeStreakCard />
        <LearningJourneyCard
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          loading={snapshot.loading}
        />
        <OverallProgressCard
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          catalogSteps={snapshot.catalogSteps}
          loading={snapshot.loading}
          onViewProgress={() => onNavigate('progress')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PracticeProgressCard summary={sqlSummary} accent="blue" onOpen={() => onNavigate('practice-sql')} />
          <PracticeProgressCard summary={codeSummary} accent="violet" onOpen={() => onNavigate('practice-code')} />
          <PracticeProgressCard summary={typingSummary} accent="teal" onOpen={() => onNavigate('practice-typing')} />
        </div>
        <UpcomingClassesTimeline sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
        <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
        <OldMistakesReviewCard onReview={() => onNavigate('progress')} />
        <ResumeReadinessCard onOpenResume={() => onNavigate('resume')} />
        <JobReadinessCard breakdown={readiness} loading={snapshot.loading} />
        <button
          type="button"
          onClick={() => onNavigate('jobspy')}
          className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
        >
          <span className="font-semibold text-slate-900">Job Board</span>
          <p className="text-sm text-slate-600 mt-1">Browse live JobSpy listings</p>
        </button>
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
      </div>
    </div>
  )
}
