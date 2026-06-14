import { Card } from '@/components/ui/card'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import type { StageProgressRecord } from '@/lib/api'
import { deriveStageJourneyFallback } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface OverallProgressCardProps {
  careerJourney: CareerJourneySummary | null
  stageRows: StageProgressRecord[] | null
  catalogSteps: number | null
  loading: boolean
  onViewProgress?: () => void
}

export function OverallProgressCard({
  careerJourney,
  stageRows,
  catalogSteps,
  loading,
  onViewProgress,
}: OverallProgressCardProps) {
  const fallback = !careerJourney && stageRows ? deriveStageJourneyFallback(stageRows) : null
  const progressPct = careerJourney?.pct ?? fallback?.progressPct ?? 0
  const stageLabel = careerJourney?.currentStageLabel ?? fallback?.currentStageLabel ?? 'Program'

  const stageCount = stageRows?.length ?? 0
  const stagesComplete =
    stageRows?.filter((r) => r.total_lessons > 0 && r.lessons_completed >= r.total_lessons).length ?? 0

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Overall Progress</h2>
            <p className="text-sm text-slate-500">{stageLabel}</p>
          </div>
          {onViewProgress && (
            <button
              type="button"
              onClick={onViewProgress}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Details
            </button>
          )}
        </div>

        <div className="mb-4 flex items-end gap-3">
          <span className="text-4xl font-bold tabular-nums text-slate-900">
            {loading ? '…' : `${progressPct}%`}
          </span>
          <span className="pb-1 text-sm text-slate-500">course complete</span>
        </div>

        <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: loading ? '0%' : `${progressPct}%` }}
          />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">Modules</dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {loading ? '—' : `${stagesComplete}/${stageCount || '—'}`}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">Catalog steps</dt>
            <dd className="font-semibold tabular-nums text-slate-900">{loading ? '—' : catalogSteps ?? 0}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
