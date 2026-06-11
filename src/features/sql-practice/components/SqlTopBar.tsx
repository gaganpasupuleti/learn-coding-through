import { AlignLeft, CheckCircle2, Eraser, Play, RotateCcw, Sparkles } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlTopBarProps {
  databaseLabel: string
  statusText: string
  onRun: () => void
  onCheckAnswer: () => void
  onResetQuery: () => void
  onFormatSql: () => void
  onClearOutput: () => void
}

export function SqlTopBar({
  databaseLabel,
  statusText,
  onRun,
  onCheckAnswer,
  onResetQuery,
  onFormatSql,
  onClearOutput,
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
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md ring-2 ring-emerald-400/40 hover:bg-emerald-500"
        >
          <Play className="h-4 w-4" />
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
        <button type="button" onClick={onFormatSql} className={wb.toolbarBtn} title="Format SQL (Phase 2+)">
          <AlignLeft className="h-4 w-4" />
          Format SQL
        </button>
        <button type="button" onClick={onClearOutput} className={wb.toolbarBtn}>
          <Eraser className="h-4 w-4" />
          Clear Output
        </button>
      </div>

      <div className={cn('ml-auto flex flex-col items-end gap-1 text-xs', wb.textMuted)}>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          {statusText}
        </span>
        <span>Ctrl+Enter to run (Phase 2)</span>
      </div>
    </header>
  )
}
