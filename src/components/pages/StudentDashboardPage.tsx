import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'

import { DashboardActionCards } from '@/components/student-dashboard/DashboardActionCards'
import { JobReadinessPanel, PlannerCard } from '@/components/student-dashboard/DashboardCalendarPanel'
import { DashboardStatsRow } from '@/components/student-dashboard/DashboardStatsRow'
import { DashboardTopHeader } from '@/components/student-dashboard/DashboardTopHeader'
import {
  DeadlinesPanel,
  PracticeProgressGrid,
  ProgressPanel,
  SyllabusPanel,
  TodayPanel,
  UpcomingClassesPanel,
} from '@/components/student-dashboard/DashboardContentSections'
import { CQSectionTitle } from '@/components/student-dashboard/cq/CQKit'
import { CQ_PAGE_BG } from '@/components/student-dashboard/cq/cqTheme'
import { resolveNextLessonTitle } from '@/components/student-dashboard/DashboardHero'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import type { AuthUser } from '@/lib/auth'
import {
  computeDaysRemaining,
  computeReadinessBreakdown,
  formatSessionDate,
} from '@/lib/dashboard-derive'
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

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
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

  const stageCount = snapshot.stageRows?.length ?? 0
  const stagesComplete =
    snapshot.stageRows?.filter((r) => r.total_lessons > 0 && r.lessons_completed >= r.total_lessons)
      .length ?? 0

  const todaySessions = snapshot.upcomingSessions.filter(
    (s) => formatSessionDate(s.session_date) === 'Today',
  )
  const nextSession = snapshot.upcomingSessions[0]
  const todayValue =
    todaySessions.length > 0
      ? `${todaySessions.length} live session${todaySessions.length > 1 ? 's' : ''}`
      : nextSession
        ? `Next: ${formatSessionDate(nextSession.session_date)}`
        : 'No classes today'
  const todayDetail = nextSession
    ? nextSession.topic ?? nextSession.title
    : 'Use the calendar to plan your week'

  const practiceAvg = clampPct((sqlSummary.pct + codeSummary.pct + typingSummary.pct) / 3)
  const courseBars = [
    { label: 'Course', value: progressPct },
    { label: 'Practice', value: practiceAvg },
  ]
  const masteryDetail =
    stageCount > 0 ? `${stagesComplete}/${stageCount} modules complete` : 'Career roadmap progress'
  const weeklyHeights = [
    sqlSummary.pct,
    codeSummary.pct,
    typingSummary.pct,
    readiness.skill,
    readiness.interview,
    progressPct,
    readiness.overall,
  ]
  const skills = [
    { label: 'SQL', value: sqlSummary.pct },
    { label: 'Code', value: codeSummary.pct },
    { label: 'Typing', value: typingSummary.pct },
  ]

  return (
    <div className={cn(CQ_PAGE_BG, 'min-h-full')}>
      {/* px lives inside max-w-7xl so content edges align exactly with the nav container */}
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 md:px-6 md:py-5">
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

        <DashboardStatsRow
          loading={snapshot.loading}
          todayValue={todayValue}
          todayDetail={todayDetail}
          courseBars={courseBars}
          progressPct={progressPct}
          masteryDetail={masteryDetail}
          weeklyHeights={weeklyHeights}
          skills={skills}
          currentStreak={streak.currentStreak}
          bestStreak={streak.bestStreak}
          mistakesTotal={mistakes.total}
          practiceSessions={typingSummary.completed}
          onOpenCalendar={() => onNavigate('calendar')}
          onOpenProgress={() => onNavigate('progress')}
        />

        {/* Quick actions — own full row, 4-up */}
        <section>
          <CQSectionTitle sub="Jump straight back into practice or your resume.">
            Quick actions
          </CQSectionTitle>
          <DashboardActionCards
            onPracticeCode={() => onNavigate('practice-code')}
            onPracticeSql={() => onNavigate('practice-sql')}
            onPracticeTyping={() => onNavigate('practice-typing')}
            onOpenResume={() => onNavigate('resume')}
          />
        </section>

        {/* Command row: left Today + Practice (height-matched to right Planner) */}
        <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col gap-4 lg:col-span-8">
            <section>
              <CQSectionTitle sub="Your class and the next deadline to focus on.">
                Today
              </CQSectionTitle>
              <TodayPanel
                sessions={snapshot.upcomingSessions}
                deadlines={snapshot.deadlines}
                loading={snapshot.loading}
                onOpenCalendar={() => onNavigate('calendar')}
              />
            </section>

            <section className="flex flex-1 flex-col">
              <CQSectionTitle sub="Pick up where you left off in SQL, code, or typing.">
                Practice
              </CQSectionTitle>
              <div className="flex-1">
                <PracticeProgressGrid
                  sql={sqlSummary}
                  code={codeSummary}
                  typing={typingSummary}
                  onPracticeSql={() => onNavigate('practice-sql')}
                  onPracticeCode={() => onNavigate('practice-code')}
                  onPracticeTyping={() => onNavigate('practice-typing')}
                />
              </div>
            </section>
          </div>

          <section className="flex flex-col lg:col-span-4">
            <CQSectionTitle icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />}>
              Planner
            </CQSectionTitle>
            <PlannerCard
              className="flex-1"
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
          </section>
        </div>

        {/* Progress + mistakes (balanced 2-up, full width) */}
        <section>
          <CQSectionTitle sub="Your overall growth and what to revisit.">Progress</CQSectionTitle>
          <ProgressPanel
            careerJourney={snapshot.careerJourney}
            stageRows={snapshot.stageRows}
            catalogSteps={snapshot.catalogSteps}
            mistakes={mistakes}
            loading={snapshot.loading}
            onViewProgress={() => onNavigate('progress')}
          />
        </section>

        {/* Upcoming classes + syllabus (balanced 2-up, full width) */}
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <section className="flex flex-col">
            <CQSectionTitle>Upcoming classes</CQSectionTitle>
            <div className="flex-1">
              <UpcomingClassesPanel
                sessions={snapshot.upcomingSessions}
                loading={snapshot.loading}
              />
            </div>
          </section>

          <section className="flex flex-col">
            <CQSectionTitle>Syllabus overview</CQSectionTitle>
            <div className="flex-1">
              <SyllabusPanel
                careerJourney={snapshot.careerJourney}
                stageRows={snapshot.stageRows}
                loading={snapshot.loading}
                onOpenCareer={() => onNavigate('roadmapper')}
              />
            </div>
          </section>
        </div>

        {/* Deadlines board + job readiness (12-col, no detached rail) */}
        <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
          <section className="flex flex-col lg:col-span-8">
            <CQSectionTitle>All deadlines</CQSectionTitle>
            <div className="flex-1">
              <DeadlinesPanel deadlines={snapshot.deadlines} loading={snapshot.loading} />
            </div>
          </section>

          <section className="flex flex-col lg:col-span-4">
            <CQSectionTitle>Career readiness</CQSectionTitle>
            <div className="flex-1">
              <JobReadinessPanel
                readiness={readiness}
                loading={snapshot.loading}
                onOpenJobs={() => onNavigate('jobspy')}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
