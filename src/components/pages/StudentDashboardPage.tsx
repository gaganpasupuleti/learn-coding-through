import { useMemo, useState } from 'react'

import { ExpandedCalendarDrawer } from '@/components/calendar/ExpandedCalendarDrawer'
import { CompactCalendarWidget } from '@/components/student-dashboard/CompactCalendarWidget'
import { DashboardHero, resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { DeadlinesTaskBoard } from '@/components/student-dashboard/DeadlinesTaskBoard'
import { JobReadinessCard } from '@/components/student-dashboard/JobReadinessCard'
import { JobRecommendationsCard } from '@/components/student-dashboard/JobRecommendationsCard'
import { LearningJourneyCard } from '@/components/student-dashboard/LearningJourneyCard'
import { UpcomingClassesTimeline } from '@/components/student-dashboard/UpcomingClassesTimeline'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import type { AuthUser } from '@/lib/auth'
import { computeDaysRemaining, computeReadinessBreakdown } from '@/lib/dashboard-derive'

type DashboardNavTarget = 'roadmapper' | 'jobs'

interface StudentDashboardPageProps {
  user: AuthUser
  onNavigate: (page: DashboardNavTarget) => void
}

function RightSidebar({
  snapshot,
  readiness,
  onExpandCalendar,
  onNavigate,
}: {
  snapshot: ReturnType<typeof useStudentDashboardSnapshot>
  readiness: ReturnType<typeof computeReadinessBreakdown>
  onExpandCalendar: () => void
  onNavigate: (page: DashboardNavTarget) => void
}) {
  return (
    <div className="space-y-6">
      <CompactCalendarWidget
        sessions={snapshot.upcomingSessions}
        onExpand={onExpandCalendar}
      />
      <JobReadinessCard breakdown={readiness} loading={snapshot.loading} />
      <JobRecommendationsCard
        jobs={snapshot.openJobs}
        careerTitle={snapshot.careerJourney?.title ?? null}
        careerSkills={snapshot.careerJourney?.skills ?? []}
        loading={snapshot.loading}
        onViewAll={() => onNavigate('jobs')}
      />
    </div>
  )
}

export function StudentDashboardPage({ user, onNavigate }: StudentDashboardPageProps) {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const snapshot = useStudentDashboardSnapshot(user)
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
      <ExpandedCalendarDrawer
        open={isCalendarExpanded}
        onClose={() => setIsCalendarExpanded(false)}
      />

      {/* Desktop layout */}
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
            snapshot={snapshot}
            readiness={readiness}
            onExpandCalendar={() => setIsCalendarExpanded(true)}
            onNavigate={onNavigate}
          />
        </div>

        <div className="col-span-8">
          <UpcomingClassesTimeline
            sessions={snapshot.upcomingSessions}
            loading={snapshot.loading}
          />
        </div>

        <div className="col-span-8">
          <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
        </div>
      </div>

      {/* Mobile layout */}
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
        <UpcomingClassesTimeline
          sessions={snapshot.upcomingSessions}
          loading={snapshot.loading}
        />
        <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
        <JobReadinessCard breakdown={readiness} loading={snapshot.loading} />
        <JobRecommendationsCard
          jobs={snapshot.openJobs}
          careerTitle={snapshot.careerJourney?.title ?? null}
          careerSkills={snapshot.careerJourney?.skills ?? []}
          loading={snapshot.loading}
          onViewAll={() => onNavigate('jobs')}
        />
        <CompactCalendarWidget
          sessions={snapshot.upcomingSessions}
          onExpand={() => setIsCalendarExpanded(true)}
        />
      </div>
    </div>
  )
}
