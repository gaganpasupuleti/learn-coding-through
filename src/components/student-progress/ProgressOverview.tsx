import { Card } from '@/components/ui/card'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import type { MySubmittedProject, StageProgressRecord } from '@/lib/api'
import {
  getPracticeStreakSummary,
} from '@/lib/practice-progress-summary'
import { deriveStageJourneyFallback } from '@/lib/dashboard-derive'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface ProgressOverviewProps {
  careerJourney: CareerJourneySummary | null
  stageRows: StageProgressRecord[] | null
  submittedProjects: MySubmittedProject[]
  loading: boolean
}

export function ProgressOverview({
  careerJourney,
  stageRows,
  submittedProjects,
  loading,
}: ProgressOverviewProps) {
  const fallback = !careerJourney && stageRows ? deriveStageJourneyFallback(stageRows) : null
  const coursePct = careerJourney?.pct ?? fallback?.progressPct ?? 0
  const streak = getPracticeStreakSummary()
  const approvedProjects = submittedProjects.filter((p) => p.status === 'approved').length
  const avgQuiz =
    stageRows && stageRows.length > 0
      ? Math.round(
          stageRows.reduce((s, r) => s + r.latest_quiz_score, 0) / stageRows.length,
        )
      : null

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Progress overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Course completion" value={loading ? '…' : `${coursePct}%`} />
          <Metric label="Practice streak" value={`${streak.currentStreak} days`} />
          <Metric label="Quiz average" value={avgQuiz !== null ? `${avgQuiz}%` : '—'} />
          <Metric
            label="Projects approved"
            value={`${approvedProjects}/${submittedProjects.length || 0}`}
          />
        </div>
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}
