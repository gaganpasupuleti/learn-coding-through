import { FileText } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { CircularProgress } from '@/components/ui/circular-progress'
import { computeResumeReadinessScore } from '@/lib/resume-score'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY, DASHBOARD_CARD_BODY_COMPACT } from './dashboard-styles'

interface ResumeReadinessCardProps {
  onOpenResume?: () => void
  compact?: boolean
}

export function ResumeReadinessCard({ onOpenResume, compact = false }: ResumeReadinessCardProps) {
  const score = computeResumeReadinessScore()

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={compact ? DASHBOARD_CARD_BODY_COMPACT : DASHBOARD_CARD_BODY}>
        <div className={cn('mb-4 flex items-center gap-2', compact && 'mb-3')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <FileText className="h-5 w-5 text-slate-700" aria-hidden />
          </div>
          <div>
            <h2 className={cn('font-semibold text-slate-900', compact ? 'text-sm' : 'text-lg')}>
              Resume Readiness
            </h2>
            {!compact && <p className="text-xs text-slate-500">Local draft · ATS-friendly template</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CircularProgress
            value={score.overall}
            size={compact ? 72 : 112}
            strokeWidth={compact ? 6 : 8}
            label="Ready"
          />
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold tabular-nums text-slate-900">{score.overall}%</p>
            <p className="text-xs text-slate-500">complete</p>
          </div>
        </div>

        {!compact && (
          <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
            {score.checklist.slice(0, 4).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span className={item.done ? 'text-emerald-700' : ''}>{item.label}</span>
                <span className="font-medium text-slate-900">{item.done ? '✓' : '—'}</span>
              </li>
            ))}
          </ul>
        )}

        {onOpenResume && (
          <button
            type="button"
            onClick={onOpenResume}
            className={cn(
              'w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800',
              compact ? 'mt-3 py-2 text-xs' : 'mt-4',
            )}
          >
            Open Resume Builder
          </button>
        )}
      </div>
    </Card>
  )
}
