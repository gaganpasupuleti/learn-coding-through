import type { MySubmittedProject, StageProgressRecord, TypingAttempt } from '@/lib/api'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import { computeReadinessBreakdown } from '@/lib/dashboard-derive'
import {
  getCodePracticeSummary,
  getSqlPracticeSummary,
  getTypingPracticeSummary,
  type PracticeAreaSummary,
} from '@/lib/practice-progress-summary'

export type SkillNavTarget =
  | 'practice-sql'
  | 'practice-code'
  | 'practice-typing'
  | 'projects'
  | 'resume'
  | 'roadmapper'

export interface SkillProgressItem extends PracticeAreaSummary {
  id: string
  href?: SkillNavTarget
  actionLabel?: string
}

export function buildSkillProgressItems(
  typingAttempts: TypingAttempt[],
  extras?: {
    submittedProjects: MySubmittedProject[]
    careerJourney: CareerJourneySummary | null
    stageRows: StageProgressRecord[] | null
    catalogSteps: number | null
  },
): SkillProgressItem[] {
  const typingWpm =
    typingAttempts.length > 0
      ? Math.round(typingAttempts.reduce((s, a) => s + a.wpm, 0) / typingAttempts.length)
      : null

  const practiceItems: SkillProgressItem[] = [
    {
      id: 'sql',
      ...getSqlPracticeSummary(),
      href: 'practice-sql',
      actionLabel: 'Practice',
    },
    {
      id: 'code',
      ...getCodePracticeSummary(),
      href: 'practice-code',
      actionLabel: 'Practice',
    },
    {
      id: 'typing',
      ...getTypingPracticeSummary(typingWpm),
      href: 'practice-typing',
      actionLabel: 'Practice',
    },
  ]

  if (!extras) return practiceItems

  const approved = extras.submittedProjects.filter((p) => p.status === 'approved').length
  const projectTotal = extras.submittedProjects.length
  const projectPct = projectTotal > 0 ? Math.round((approved / projectTotal) * 100) : 0

  const jobReadiness = computeReadinessBreakdown({
    submittedProjects: extras.submittedProjects,
    careerPct: extras.careerJourney?.pct ?? null,
    stageRows: extras.stageRows,
    typingAttempts,
    catalogSteps: extras.catalogSteps,
  })

  return [
    ...practiceItems,
    {
      id: 'projects',
      label: 'Projects',
      completed: approved,
      total: projectTotal,
      pct: projectPct,
      detail:
        projectTotal > 0
          ? `${approved} of ${projectTotal} approved`
          : 'No project submissions yet',
      href: 'projects',
      actionLabel: 'View',
    },
    {
      id: 'resume',
      label: 'Resume Lab',
      completed: 0,
      total: 1,
      pct: 0,
      detail: 'Full resume builder',
      href: 'resume',
      actionLabel: 'Open',
    },
    {
      id: 'job',
      label: 'Job readiness',
      completed: jobReadiness.overall,
      total: 100,
      pct: jobReadiness.overall,
      detail: 'Career prep snapshot',
      href: 'roadmapper',
      actionLabel: 'Career map',
    },
  ]
}
