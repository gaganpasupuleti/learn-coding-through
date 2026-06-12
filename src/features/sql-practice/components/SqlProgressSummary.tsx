import type { SqlDatabaseProgressSummary } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlProgressSummaryProps {
  summary: SqlDatabaseProgressSummary
  compact?: boolean
}

export function SqlProgressSummary({ summary, compact }: SqlProgressSummaryProps) {
  if (summary.totalQuestions === 0) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-emerald-700/40 bg-emerald-950/25',
        compact ? 'px-2.5 py-1.5 text-xs' : 'p-3 text-sm',
        wb.textSecondary,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-emerald-200">
          {summary.passedCount} / {summary.totalQuestions} passed
        </span>
        <span className={wb.textMuted}>{summary.percentComplete}% complete</span>
      </div>
      {!compact && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${summary.percentComplete}%` }}
          />
        </div>
      )}
    </div>
  )
}
