import type { SqlPracticeDifficulty, SqlPracticeTopic } from '../../types/sqlPractice.types'
import {
  DIFFICULTY_LABELS,
  TOPIC_LABELS,
  type SqlDifficultyAnalyticsRow,
  type SqlTopicAnalyticsRow,
} from '../../utils/sqlPracticeAnalytics'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlProgressAnalyticsProps {
  summary: {
    passed: number
    failed: number
    unattempted: number
    total: number
    hintsUsedTotal: number
    solutionsRevealedCount: number
  }
  topicRows: SqlTopicAnalyticsRow[]
  difficultyRows: SqlDifficultyAnalyticsRow[]
  compact?: boolean
}

function ProgressBar({ passed, total, label }: { passed: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px]">
        <span className={wb.textMuted}>{label}</span>
        <span className="text-emerald-200/90">
          {passed} / {total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-emerald-500/80 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function SqlProgressAnalytics({
  summary,
  topicRows,
  difficultyRows,
  compact,
}: SqlProgressAnalyticsProps) {
  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-slate-700/50 bg-[#111827]',
        compact ? 'p-2.5' : 'p-3',
      )}
    >
      <p className={cn('text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Progress analytics</p>
      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="rounded-md bg-emerald-950/40 px-1.5 py-1">
          <div className="font-semibold text-emerald-200">{summary.passed}</div>
          <div className={wb.textMuted}>Passed</div>
        </div>
        <div className="rounded-md bg-rose-950/40 px-1.5 py-1">
          <div className="font-semibold text-rose-200">{summary.failed}</div>
          <div className={wb.textMuted}>Failed</div>
        </div>
        <div className="rounded-md bg-slate-800/80 px-1.5 py-1">
          <div className="font-semibold text-slate-200">{summary.unattempted}</div>
          <div className={wb.textMuted}>Unattempted</div>
        </div>
      </div>
      {!compact && (summary.hintsUsedTotal > 0 || summary.solutionsRevealedCount > 0) && (
        <p className={cn('text-[11px]', wb.textMuted)}>
          {summary.hintsUsedTotal > 0 && `${summary.hintsUsedTotal} hints used`}
          {summary.hintsUsedTotal > 0 && summary.solutionsRevealedCount > 0 && ' · '}
          {summary.solutionsRevealedCount > 0 && `${summary.solutionsRevealedCount} solutions revealed`}
        </p>
      )}
      {topicRows.length > 0 && (
        <div className="space-y-1.5">
          <p className={cn('text-[10px] font-bold uppercase tracking-widest', wb.textMuted)}>By topic</p>
          {topicRows.map((row) => (
            <ProgressBar
              key={row.topic}
              label={TOPIC_LABELS[row.topic as SqlPracticeTopic]}
              passed={row.passed}
              total={row.total}
            />
          ))}
        </div>
      )}
      {difficultyRows.length > 0 && (
        <div className="space-y-1.5">
          <p className={cn('text-[10px] font-bold uppercase tracking-widest', wb.textMuted)}>By difficulty</p>
          {difficultyRows.map((row) => (
            <ProgressBar
              key={row.difficulty}
              label={DIFFICULTY_LABELS[row.difficulty as SqlPracticeDifficulty]}
              passed={row.passed}
              total={row.total}
            />
          ))}
        </div>
      )}
    </div>
  )
}
