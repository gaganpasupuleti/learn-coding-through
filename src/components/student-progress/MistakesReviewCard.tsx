import { Card } from '@/components/ui/card'
import { getMistakesSummary } from '@/lib/practice-progress-summary'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface MistakesReviewCardProps {
  onOpenPractice?: (page: 'practice-sql' | 'practice-code' | 'practice-typing') => void
}

export function MistakesReviewCard({ onOpenPractice }: MistakesReviewCardProps) {
  const mistakes = getMistakesSummary()

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <p className="mb-4 text-sm text-slate-600">
          Failed SQL queries, code runs, and typing errors saved in this browser.
        </p>

        {mistakes.total === 0 ? (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
            No mistakes to review — keep practicing!
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <MistakeTile
              label="SQL"
              count={mistakes.sql}
              onOpen={onOpenPractice ? () => onOpenPractice('practice-sql') : undefined}
            />
            <MistakeTile
              label="Code"
              count={mistakes.code}
              onOpen={onOpenPractice ? () => onOpenPractice('practice-code') : undefined}
            />
            <MistakeTile
              label="Typing"
              count={mistakes.typing}
              onOpen={onOpenPractice ? () => onOpenPractice('practice-typing') : undefined}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

function MistakeTile({
  label,
  count,
  onOpen,
}: {
  label: string
  count: number
  onOpen?: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{count}</p>
      {onOpen && count > 0 && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 rounded text-xs font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          Review in practice
        </button>
      )}
    </div>
  )
}
