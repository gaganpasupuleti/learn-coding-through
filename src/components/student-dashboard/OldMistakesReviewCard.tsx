import { AlertCircle } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { getMistakesSummary } from '@/lib/practice-progress-summary'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface OldMistakesReviewCardProps {
  onReview?: () => void
}

export function OldMistakesReviewCard({ onReview }: OldMistakesReviewCardProps) {
  const mistakes = getMistakesSummary()

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-700" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Old Mistakes Review</h2>
            <p className="text-xs text-slate-500">Saved locally in this browser</p>
          </div>
        </div>

        {mistakes.total === 0 ? (
          <p className="text-sm text-slate-500">No mistakes logged yet — great work!</p>
        ) : (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">SQL</span>
              <span className="font-semibold tabular-nums text-slate-900">{mistakes.sql}</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Code</span>
              <span className="font-semibold tabular-nums text-slate-900">{mistakes.code}</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Typing</span>
              <span className="font-semibold tabular-nums text-slate-900">{mistakes.typing}</span>
            </li>
          </ul>
        )}

        {onReview && mistakes.total > 0 && (
          <button
            type="button"
            onClick={onReview}
            className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Review on Progress page
          </button>
        )}
      </div>
    </Card>
  )
}
