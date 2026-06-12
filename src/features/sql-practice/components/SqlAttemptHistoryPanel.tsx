import { FileCode2 } from 'lucide-react'
import { getDatabaseById } from '../data/databaseCatalog'
import type { SqlAttemptRecord } from '../types/sqlPractice.types'
import { formatAttemptActionLabel } from '../utils/sqlPracticeStorage'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlAttemptHistoryPanelProps {
  attempts: SqlAttemptRecord[]
  onLoadSql: (sql: string, questionId?: string, databaseId?: SqlAttemptRecord['databaseId']) => void
}

export function SqlAttemptHistoryPanel({ attempts, onLoadSql }: SqlAttemptHistoryPanelProps) {
  if (attempts.length === 0) {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)}>
        No attempts recorded yet. Run a query or check your answer to populate history.
      </div>
    )
  }

  return (
    <ul className={cn('space-y-3 p-4 text-sm', wb.textMuted)}>
      {attempts.map((a) => {
        const db = getDatabaseById(a.databaseId)
        return (
          <li key={a.id} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-semibold',
                  a.action === 'run' && 'bg-sky-950/60 text-sky-200',
                  a.action === 'check' && 'bg-violet-950/60 text-violet-200',
                )}
              >
                {a.action === 'run' ? 'Run' : 'Check'}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-semibold',
                  a.status === 'passed' && 'bg-emerald-950/60 text-emerald-200',
                  a.status === 'failed' && 'bg-rose-950/60 text-rose-200',
                  a.status === 'blocked' && 'bg-amber-950/60 text-amber-200',
                  a.status === 'error' && 'bg-rose-950/60 text-rose-200',
                  a.status === 'success' && 'bg-sky-950/60 text-sky-200',
                )}
              >
                {formatAttemptActionLabel(a.action, a.status).split(' · ')[1] ?? a.status}
              </span>
              <span className="text-emerald-200/80">{db.displayName}</span>
              {a.questionTitle && <span className="font-medium text-violet-200">{a.questionTitle}</span>}
              <span>{new Date(a.ranAt).toLocaleString()}</span>
            </div>
            <p className="mb-1 font-mono text-xs text-slate-300">
              {a.sql.trim().slice(0, 200)}
              {a.sql.length > 200 ? '…' : ''}
            </p>
            <p className="mb-2 text-xs">
              {a.message}
              {a.rowCount > 0 && ` · ${a.rowCount} rows`}
              {a.executionTimeMs > 0 && ` · ${Math.round(a.executionTimeMs)} ms`}
            </p>
            {a.feedbackSummary && a.action === 'check' && (
              <p className="mb-2 text-xs text-amber-200">{a.feedbackSummary}</p>
            )}
            <button
              type="button"
              onClick={() => onLoadSql(a.sql, a.questionId, a.databaseId)}
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-900/50"
            >
              <FileCode2 className="h-3.5 w-3.5" />
              Load SQL
            </button>
          </li>
        )
      })}
    </ul>
  )
}
