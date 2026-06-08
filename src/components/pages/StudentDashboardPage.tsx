import { useMemo } from 'react'

import { PlannerPreviewWidget } from '@/components/student-dashboard/PlannerPreviewWidget'
import { DashboardHero, resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { DeadlinesTaskBoard } from '@/components/student-dashboard/DeadlinesTaskBoard'
import { JobReadinessCard } from '@/components/student-dashboard/JobReadinessCard'
import { LearningJourneyCard } from '@/components/student-dashboard/LearningJourneyCard'
import { UpcomingClassesTimeline } from '@/components/student-dashboard/UpcomingClassesTimeline'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import type { AuthUser } from '@/lib/auth'
import { computeDaysRemaining, computeReadinessBreakdown } from '@/lib/dashboard-derive'
import { storeSelectedDateForPlanner } from '@/lib/learning-planner-derive'

type DashboardNavTarget = 'roadmapper' | 'jobspy' | 'learning-planner'

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
          onNavigate('learning-planner')
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

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 md:p-6">
      <div className="mx-auto hidden max-w-7xl lg:grid lg:grid-cols-12 lg:gap-6">
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
        <div className="col-span-8">
          <LearningJourneyCard
            careerJourney={snapshot.careerJourney}
            stageRows={snapshot.stageRows}
            loading={snapshot.loading}
          />
        </div>
        <div className="col-span-4 row-span-3 row-start-2 self-start lg:sticky lg:top-6">
          <RightSidebar
            readiness={readiness}
            plannerPreview={plannerPreview}
            onNavigate={onNavigate}
            loading={snapshot.loading}
          />
        </div>
        <div className="col-span-8">
          <UpcomingClassesTimeline sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
        </div>
        <div className="col-span-8">
          <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 lg:hidden">
        <DashboardHero
          firstName={firstName}
          careerJourney={snapshot.careerJourney}
          nextLessonTitle={nextLessonTitle}
          daysRemaining={daysRemaining}
          loading={snapshot.loading}
          onContinueLearning={() => onNavigate('roadmapper')}
        />
        <LearningJourneyCard
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          loading={snapshot.loading}
        />
        <UpcomingClassesTimeline sessions={snapshot.upcomingSessions} loading={snapshot.loading} />
        <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
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
            onNavigate('learning-planner')
          }}
        />
      </div>
    </div>
  )
}
