import { cn } from '@/lib/utils'

import type { AuthUser } from '@/lib/auth'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import {
  DASHBOARD_SECTION_LABEL,
  STUDENT_PAGE_BG,
} from '@/components/student-dashboard/dashboard-styles'
import { ProgressOverview } from '@/components/student-progress/ProgressOverview'
import {
  buildSkillProgressItems,
  type SkillNavTarget,
} from '@/components/student-progress/skill-progress-items'
import { SkillProgressGrid } from '@/components/student-progress/SkillProgressGrid'
import { MistakesReviewCard } from '@/components/student-progress/MistakesReviewCard'

interface StudentProgressPageProps {
  user: AuthUser
  onNavigate: (page: SkillNavTarget) => void
}

function ProgressSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className={DASHBOARD_SECTION_LABEL}>{title}</h2>
      {children}
    </section>
  )
}

export function StudentProgressPage({ user, onNavigate }: StudentProgressPageProps) {
  const snapshot = useStudentDashboardSnapshot(user)
  const skillItems = buildSkillProgressItems(snapshot.typingAttempts, {
    submittedProjects: snapshot.submittedProjects,
    careerJourney: snapshot.careerJourney,
    stageRows: snapshot.stageRows,
    catalogSteps: snapshot.catalogSteps,
  })

  return (
    <div className={cn(STUDENT_PAGE_BG, 'p-4 md:p-6')}>
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Your learning progress
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            A clear report on course work, practice skills, and areas to improve — updated from
            your activity in CodeQuest.
          </p>
        </header>

        <ProgressSection title="Overview">
          <ProgressOverview
            careerJourney={snapshot.careerJourney}
            stageRows={snapshot.stageRows}
            submittedProjects={snapshot.submittedProjects}
            loading={snapshot.loading}
          />
        </ProgressSection>

        <ProgressSection title="Skills & readiness">
          <SkillProgressGrid items={skillItems} onNavigate={onNavigate} />
        </ProgressSection>

        <ProgressSection title="Mistakes to review">
          <MistakesReviewCard onOpenPractice={(page) => onNavigate(page)} />
        </ProgressSection>
      </div>
    </div>
  )
}
