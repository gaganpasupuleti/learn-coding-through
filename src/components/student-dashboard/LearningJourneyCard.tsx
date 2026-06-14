import { Card } from '@/components/ui/card'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import type { StageProgressRecord } from '@/lib/api'
import { deriveStageJourneyFallback } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface LearningJourneyCardProps {
  careerJourney: CareerJourneySummary | null
  stageRows: StageProgressRecord[] | null
  loading: boolean
}

const MAX_VISIBLE_TOPICS = 4

function TopicChip({ label, completed }: { label: string; completed: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-medium',
        completed
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80'
          : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/80',
      )}
    >
      {label}
    </span>
  )
}

export function LearningJourneyCard({
  careerJourney,
  stageRows,
  loading,
}: LearningJourneyCardProps) {
  const fallback = !careerJourney && stageRows ? deriveStageJourneyFallback(stageRows) : null

  const stageLabel = careerJourney?.currentStageLabel ?? fallback?.currentStageLabel ?? 'Getting started'
  const progressPct = careerJourney?.pct ?? fallback?.progressPct ?? 0
  const completedTopics = careerJourney?.completedTopics ?? fallback?.completedTopics ?? []
  const remainingTopics = careerJourney?.remainingTopics ?? fallback?.remainingTopics ?? []

  const visibleCompleted = completedTopics.slice(-MAX_VISIBLE_TOPICS)
  const visibleRemaining = remainingTopics.slice(0, MAX_VISIBLE_TOPICS)
  const hiddenCompleted = Math.max(0, completedTopics.length - visibleCompleted.length)
  const hiddenRemaining = Math.max(0, remainingTopics.length - visibleRemaining.length)

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Learning Journey</h2>
            <p className="mt-0.5 text-sm text-slate-500">{stageLabel}</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-blue-700">
            {loading ? '…' : `${progressPct}%`}
          </span>
        </div>

        <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: loading ? '0%' : `${progressPct}%` }}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-6 w-2/3 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : completedTopics.length === 0 && remainingTopics.length === 0 ? (
          <p className="text-sm text-slate-500">
            Pick a career path in Career Map to track your syllabus progress here.
          </p>
        ) : (
          <div className="space-y-4">
            {visibleCompleted.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Completed
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleCompleted.map((t) => (
                    <TopicChip key={`done-${t}`} label={t} completed />
                  ))}
                  {hiddenCompleted > 0 && (
                    <TopicChip label={`+${hiddenCompleted} more`} completed />
                  )}
                </div>
              </div>
            )}
            {visibleRemaining.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Up next
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleRemaining.map((t) => (
                    <TopicChip key={`next-${t}`} label={t} completed={false} />
                  ))}
                  {hiddenRemaining > 0 && (
                    <TopicChip label={`+${hiddenRemaining} more`} completed={false} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
