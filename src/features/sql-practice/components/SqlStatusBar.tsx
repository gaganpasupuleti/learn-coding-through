import type { SqlDatabaseId, SqlDatabaseProgressSummary, SqlRunState } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlStatusBarProps {
  databaseId: SqlDatabaseId
  databaseName: string
  tableCount: number
  questionTitle: string
  runState: SqlRunState
  databaseSummary?: SqlDatabaseProgressSummary
  lineInfo?: string
}

const RUN_STATE_LABEL: Record<SqlRunState, string> = {
  ready: 'Ready',
  running: 'Running…',
  success: 'Success',
  error: 'Error',
  checking: 'Checking…',
  passed: 'Passed',
  failed: 'Failed',
}

export function SqlStatusBar({
  databaseId,
  databaseName,
  tableCount,
  questionTitle,
  runState,
  databaseSummary,
  lineInfo,
}: SqlStatusBarProps) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs',
        wb.border,
        'bg-[#007ACC]/10',
        wb.textMuted,
      )}
    >
      <span>
        Database: <span className={cn('font-medium', wb.textSecondary)}>{databaseName}</span>
      </span>
      <span>{tableCount} tables</span>
      {databaseSummary && databaseSummary.totalQuestions > 0 && (
        <span className="text-emerald-300">
          {databaseSummary.passedCount} / {databaseSummary.totalQuestions} passed · {databaseSummary.percentComplete}%
        </span>
      )}
      <span>
        Question: <span className={cn('font-medium', wb.textSecondary)}>{questionTitle}</span>
      </span>
      <span
        className={cn(
          'font-medium',
          (runState === 'success' || runState === 'passed') && 'text-emerald-300',
          (runState === 'error' || runState === 'failed') && 'text-rose-300',
          (runState === 'running' || runState === 'checking') && 'text-amber-200',
        )}
      >
        {RUN_STATE_LABEL[runState]}
      </span>
      {lineInfo && <span className="ml-auto font-mono">{lineInfo}</span>}
      <span className={lineInfo ? '' : 'ml-auto'}>sql.js · {databaseId}</span>
    </footer>
  )
}
