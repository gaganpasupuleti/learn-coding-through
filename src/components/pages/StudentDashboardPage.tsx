import { useMemo, type ReactNode } from 'react'
import {
  CalendarClock,
  FileText,
  Flame,
  GraduationCap,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { PlannerPreviewWidget } from '@/components/student-dashboard/PlannerPreviewWidget'
import { DashboardHero, resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { DeadlinesTaskBoard } from '@/components/student-dashboard/DeadlinesTaskBoard'
import { JobReadinessCard } from '@/components/student-dashboard/JobReadinessCard'
import { JobsCareerCard } from '@/components/student-dashboard/JobsCareerCard'
import { LearningJourneyCard } from '@/components/student-dashboard/LearningJourneyCard'
import { NextDeadlineCard } from '@/components/student-dashboard/NextDeadlineCard'
import { OldMistakesReviewCard } from '@/components/student-dashboard/OldMistakesReviewCard'
import { OverallProgressCard } from '@/components/student-dashboard/OverallProgressCard'
import { PracticeProgressCard } from '@/components/student-dashboard/PracticeProgressCard'
import { PracticeStreakCard } from '@/components/student-dashboard/PracticeStreakCard'
import { QuickStatsStrip, type DashboardStat } from '@/components/student-dashboard/QuickStatsStrip'
import { ResumeReadinessCard } from '@/components/student-dashboard/ResumeReadinessCard'
import { TodayClassCard } from '@/components/student-dashboard/TodayClassCard'
import { UpcomingClassesTimeline } from '@/components/student-dashboard/UpcomingClassesTimeline'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import type { AuthUser } from '@/lib/auth'
import {
  computeDaysRemaining,
  computeReadinessBreakdown,
  mergeDeadlines,
} from '@/lib/dashboard-derive'
import {
  getCodePracticeSummary,
  getPracticeStreakSummary,
  getSqlPracticeSummary,
  getTypingPracticeSummary,
} from '@/lib/practice-progress-summary'
import { computeResumeReadinessScore } from '@/lib/resume-score'
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

function SectionHeading({
  title,
  description,
  tone = 'primary',
}: {
  title: string
  description?: string
  tone?: 'primary' | 'muted'
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={cn(
          'h-5 w-1 rounded-full',
          tone === 'primary' ? 'bg-blue-600' : 'bg-slate-300',
        )}
        aria-hidden
      />
      <div>
        <h2
          className={cn(
            'text-sm font-bold uppercase tracking-wide',
            tone === 'primary' ? 'text-slate-800' : 'text-slate-500',
          )}
        >
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
    </div>
  )
}

function DashboardSection({
  title,
  description,
  tone = 'primary',
  children,
}: {
  title: string
  description?: string
  tone?: 'primary' | 'muted'
  children: ReactNode
}) {
  return (
    <section>
      <SectionHeading title={title} description={description} tone={tone} />
      {children}
    </section>
  )
}

function CommandRail({
  readiness,
  plannerPreview,
  careerJourney,
  onNavigate,
  loading,
}: {
  readiness: ReturnType<typeof computeReadinessBreakdown>
  plannerPreview: ReturnType<typeof useLearningPlanner>
  careerJourney: ReturnType<typeof useStudentDashboardSnapshot>['careerJourney']
  onNavigate: (page: DashboardNavTarget) => void
  loading: boolean
}) {
  return (
    <aside className="space-y-5">
      <PracticeStreakCard compact />
      <ResumeReadinessCard compact onOpenResume={() => onNavigate('resume')} />
      <JobsCareerCard careerJourney={careerJourney} onOpenJobs={() => onNavigate('jobspy')} />
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

  const openDeadlines = useMemo(
    () => mergeDeadlines(snapshot.deadlines).filter((item) => !item.done).length,
    [snapshot.deadlines],
  )

  const streak = getPracticeStreakSummary()
  const resumeScore = computeResumeReadinessScore()

  const typingWpm =
    snapshot.typingAttempts.length > 0
      ? Math.round(
          snapshot.typingAttempts.reduce((s, a) => s + a.wpm, 0) / snapshot.typingAttempts.length,
        )
      : null

  const sqlSummary = getSqlPracticeSummary()
  const codeSummary = getCodePracticeSummary()
  const typingSummary = getTypingPracticeSummary(typingWpm)

  const stats: DashboardStat[] = [
    {
      id: 'course',
      label: 'Course progress',
      value: `${snapshot.careerJourney?.pct ?? 0}%`,
      hint: snapshot.careerJourney?.currentStageLabel ?? 'Pick a path',
      icon: <GraduationCap className="h-5 w-5" aria-hidden />,
      accent: 'blue',
      onClick: () => onNavigate('progress'),
    },
    {
      id: 'streak',
      label: 'Practice streak',
      value: `${streak.currentStreak}d`,
      hint: streak.practicedToday ? 'Practiced today' : 'Keep it going',
      icon: <Flame className="h-5 w-5" aria-hidden />,
      accent: 'amber',
      onClick: () => onNavigate('practice-code'),
    },
    {
      id: 'resume',
      label: 'Resume readiness',
      value: `${resumeScore.overall}%`,
      hint: 'ATS-friendly draft',
      icon: <FileText className="h-5 w-5" aria-hidden />,
      accent: 'violet',
      onClick: () => onNavigate('resume'),
    },
    {
      id: 'deadlines',
      label: 'Open deadlines',
      value: `${openDeadlines}`,
      hint: openDeadlines === 0 ? 'All clear' : 'Stay on track',
      icon: <CalendarClock className="h-5 w-5" aria-hidden />,
      accent: 'teal',
      onClick: () => onNavigate('calendar'),
    },
  ]

  return (
    <div className={cn(STUDENT_PAGE_BG, 'px-4 py-6 md:px-6 md:py-8')}>
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHero
          firstName={firstName}
          careerJourney={snapshot.careerJourney}
          nextLessonTitle={nextLessonTitle}
          daysRemaining={daysRemaining}
          currentStreak={streak.currentStreak}
          practicedToday={streak.practicedToday}
          loading={snapshot.loading}
          onContinuePractice={() => onNavigate('practice-code')}
          onContinueLearning={() => onNavigate('roadmapper')}
          onOpenCalendar={() => onNavigate('calendar')}
          onOpenResume={() => onNavigate('resume')}
          onOpenJobs={() => onNavigate('jobspy')}
        />

        <QuickStatsStrip stats={stats} loading={snapshot.loading} />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="space-y-8 lg:col-span-8">
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

            <DashboardSection title="Upcoming classes" tone="muted">
              <UpcomingClassesTimeline
                sessions={snapshot.upcomingSessions}
                loading={snapshot.loading}
              />
            </DashboardSection>

            <DashboardSection title="All deadlines" tone="muted">
              <DeadlinesTaskBoard deadlines={snapshot.deadlines} loading={snapshot.loading} />
            </DashboardSection>

            <DashboardSection title="Syllabus overview" tone="muted">
              <LearningJourneyCard
                careerJourney={snapshot.careerJourney}
                stageRows={snapshot.stageRows}
                loading={snapshot.loading}
              />
            </DashboardSection>
          </div>

          <div className="lg:col-span-4">
            <CommandRail
              readiness={readiness}
              plannerPreview={plannerPreview}
              careerJourney={snapshot.careerJourney}
              onNavigate={onNavigate}
              loading={snapshot.loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
