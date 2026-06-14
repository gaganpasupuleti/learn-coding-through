import { Lightbulb, RotateCcw, CheckCircle2 } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface DaxEditorPanelProps {
  formula: string
  onChange: (formula: string) => void
  onCheckAnswer: () => void
  onHint: () => void
  onReset: () => void
  isChecking?: boolean
  hintsRemaining: number
}

export function DaxEditorPanel({
  formula,
  onChange,
  onCheckAnswer,
  onHint,
  onReset,
  isChecking = false,
  hintsRemaining,
}: DaxEditorPanelProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', wb.panel)}>
      <div className={cn('flex flex-wrap items-center gap-2 border-b px-4 py-3', wb.border, wb.panelHeader)}>
        <button type="button" onClick={onCheckAnswer} disabled={isChecking} className={cn(wb.toolbarBtn, 'text-emerald-200')}>
          <CheckCircle2 size={16} aria-hidden />
          Check Answer
        </button>
        <button
          type="button"
          onClick={onHint}
          disabled={hintsRemaining <= 0}
          className={cn(wb.toolbarBtn, hintsRemaining <= 0 && 'opacity-50')}
        >
          <Lightbulb size={16} aria-hidden />
          Hint ({hintsRemaining})
        </button>
        <button type="button" onClick={onReset} className={wb.toolbarBtn}>
          <RotateCcw size={16} aria-hidden />
          Reset
        </button>
      </div>

      <div className="min-h-0 flex-1 p-4">
        <label htmlFor="dax-formula-editor" className={cn('mb-2 block text-xs font-bold uppercase tracking-widest', wb.textMuted)}>
          DAX formula
        </label>
        <textarea
          id="dax-formula-editor"
          value={formula}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className={cn(
            'h-[min(320px,40vh)] w-full resize-y rounded-lg border p-4 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-sky-500/40',
            wb.border,
            wb.editor,
            wb.textPrimary,
          )}
          aria-label="DAX formula editor"
        />
        <p className={cn('mt-2 text-xs', wb.textMuted)}>
          Placeholder validation only in Phase 24B — no real DAX engine runs in the browser.
        </p>
      </div>
    </div>
  )
}
