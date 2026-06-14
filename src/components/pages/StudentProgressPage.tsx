import type { AuthUser } from '@/lib/auth'

import { LearningJourneyCard } from '@/components/student-dashboard/LearningJourneyCard'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'
import { ProgressOverview } from '@/components/student-progress/ProgressOverview'
import { buildSkillProgressItems } from '@/components/student-progress/skill-progress-items'
import { SkillProgressGrid } from '@/components/student-progress/SkillProgressGrid'
import { MistakesReviewCard } from '@/components/student-progress/MistakesReviewCard'

type ProgressNavTarget = 'practice-sql' | 'practice-code' | 'practice-typing'

interface StudentProgressPageProps {
  user: AuthUser
  onNavigate: (page: ProgressNavTarget) => void
}

export function StudentProgressPage({ user, onNavigate }: StudentProgressPageProps) {
  const snapshot = useStudentDashboardSnapshot(user)
  const skillItems = buildSkillProgressItems(snapshot.typingAttempts)

  return (
    <div className={`${STUDENT_PAGE_BG} p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Your progress</h1>
          <p className="mt-1 text-sm text-slate-600">
            Course completion, practice scores, quiz trends, and mistake review in one place.
          </p>
        </header>

        <ProgressOverview
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          submittedProjects={snapshot.submittedProjects}
          loading={snapshot.loading}
        />

        <LearningJourneyCard
          careerJourney={snapshot.careerJourney}
          stageRows={snapshot.stageRows}
          loading={snapshot.loading}
        />

        <SkillProgressGrid items={skillItems} onNavigate={onNavigate} />

        <MistakesReviewCard onOpenPractice={onNavigate} />
      </div>
    </div>
  )
}
