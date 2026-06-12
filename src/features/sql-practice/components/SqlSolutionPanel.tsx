import { useState } from 'react'
import { AlertTriangle, Copy, Eye, EyeOff } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlSolutionPanelProps {
  solutionSql: string
  isRevealed: boolean
  onConfirmReveal: () => void
  onUseSolution?: () => void
}

export function SqlSolutionPanel({
  solutionSql,
  isRevealed,
  onConfirmReveal,
  onUseSolution,
}: SqlSolutionPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (!solutionSql) {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm', wb.border, wb.textMuted)}>
        <EyeOff className="h-4 w-4 shrink-0" />
        No solution available for this question yet.
      </div>
    )
  }

  if (!isRevealed) {
    return (
      <div className="space-y-2">
        <div className={cn('flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm', wb.border, wb.textMuted)}>
          <EyeOff className="h-4 w-4 shrink-0" />
          Solution hidden. Try solving it yourself first.
        </div>
        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-600/50 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-900/50"
          >
            <Eye className="h-3.5 w-3.5" />
            Show solution
          </button>
        ) : (
          <div className={cn('space-y-2 rounded-lg border border-amber-700/50 bg-amber-950/25 p-3', wb.border)}>
            <p className="flex items-start gap-2 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              This will reveal the solution. Try solving it yourself first.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false)
                  onConfirmReveal()
                }}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
              >
                Reveal solution
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className={cn('rounded-md border px-3 py-1.5 text-xs font-medium', wb.border, wb.textMuted)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className={cn('text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Solution SQL</p>
      <pre className={cn('overflow-x-auto rounded-lg border p-3 font-mono text-sm text-emerald-200', wb.border, 'bg-[#111827]')}>
        {solutionSql}
      </pre>
      {onUseSolution && (
        <button
          type="button"
          onClick={onUseSolution}
          className="inline-flex items-center gap-1.5 rounded-md border border-violet-600/50 bg-violet-950/40 px-3 py-1.5 text-xs font-medium text-violet-100 hover:bg-violet-900/50"
        >
          <Copy className="h-3.5 w-3.5" />
          Use solution
        </button>
      )}
    </div>
  )
}
