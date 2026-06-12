import { AlignLeft, CheckCircle2, Eraser, LayoutGrid, Loader2, Play, RotateCcw } from 'lucide-react'
import type { SqlRunState } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlTopBarProps {
  databaseLabel: string
  runState: SqlRunState
  isRunning: boolean
  onRun: () => void
  onCheckAnswer: () => void
  onResetQuery: () => void
  onFormatSql: () => void
  onClearOutput: () => void
  onResetLayout?: () => void
}

const RUN_STATE_LABEL: Record<SqlRunState, string> = {
  ready: 'Ready',
  running: 'Running',
  success: 'Success',
  error: 'Error',
}

export function SqlTopBar({
  databaseLabel,
  runState,
  isRunning,
  onRun,
  onCheckAnswer,
  onResetQuery,
  onFormatSql,
  onClearOutput,
  onResetLayout,
}: SqlTopBarProps) {
  return (
    <header className={cn('flex flex-wrap items-center gap-3 border-b px-4 py-3', wb.panelHeader, wb.border)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-bold uppercase tracking-wider text-emerald-300">SQL Practice Ground</span>
        <span className={cn('text-xs', wb.textMuted)}>SQL Workbench · {databaseLabel}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md ring-2 ring-emerald-400/40 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run
        </button>
        <button type="button" onClick={onCheckAnswer} className={wb.toolbarBtn}>
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          Check Answer
        </button>
        <button type="button" onClick={onResetQuery} className={wb.toolbarBtn}>
          <RotateCcw className="h-4 w-4" />
          Reset Query
        </button>
        <button type="button" onClick={onFormatSql} className={wb.toolbarBtn} title="Format SQL (later phase)">
          <AlignLeft className="h-4 w-4" />
          Format SQL
        </button>
        <button type="button" onClick={onClearOutput} className={wb.toolbarBtn}>
          <Eraser className="h-4 w-4" />
          Clear Output
        </button>
        {onResetLayout && (
          <button type="button" onClick={onResetLayout} className={wb.toolbarBtn} title="Reset pane sizes and visibility">
            <LayoutGrid className="h-4 w-4" />
            Reset Layout
          </button>
        )}
      </div>

      <div className={cn('ml-auto flex flex-col items-end gap-1 text-xs', wb.textMuted)}>
        <span
          className={cn(
            'flex items-center gap-1.5 font-medium',
            runState === 'success' && 'text-emerald-300',
            runState === 'error' && 'text-rose-300',
            runState === 'running' && 'text-amber-200',
          )}
        >
          {RUN_STATE_LABEL[runState]}
        </span>
        <span>Ctrl+Enter / Cmd+Enter to run</span>
      </div>
    </header>
  )
}
