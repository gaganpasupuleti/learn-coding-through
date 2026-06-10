import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Lightbulb, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  clearCodePracticeMistakes,
  getTopRepeatedMistake,
  listCodePracticeMistakes,
  removeCodePracticeMistake,
  type CodePracticeMistake,
} from '../utils/codePracticeMistakes'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

interface OldMistakesPanelProps {
  refreshKey: number
  onRetry: (mistake: CodePracticeMistake) => void
}

const STATUS_STYLE: Record<CodePracticeMistake['status'], string> = {
  failed: 'bg-red-950/50 text-red-200 ring-red-800/60',
  blocked: 'bg-amber-950/40 text-amber-100 ring-amber-800/50',
  warning: 'bg-sky-950/40 text-sky-100 ring-sky-800/50',
}

const TYPE_LABEL: Record<CodePracticeMistake['mistakeType'], string> = {
  syntax: 'Syntax',
  runtime: 'Runtime',
  'safety-block': 'Safety block',
  'prerun-block': 'Pre-run block',
  'wrong-output': 'Wrong output',
  'failed-test-case': 'Failed test',
  unknown: 'Unknown',
}

function mistakeSummary(m: CodePracticeMistake): string {
  if (m.feedbackMessage) return m.feedbackMessage
  if (m.errorMessage) return m.errorMessage
  return 'Practice mistake recorded.'
}

export function OldMistakesPanel({ refreshKey, onRetry }: OldMistakesPanelProps) {
  const [mistakes, setMistakes] = useState<CodePracticeMistake[]>([])

  const refresh = useCallback(() => {
    setMistakes(listCodePracticeMistakes())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh, refreshKey])

  const topRepeated = useMemo(() => getTopRepeatedMistake(mistakes), [mistakes])

  const handleClearAll = () => {
    if (!confirm('Clear all saved Code Practice mistakes?')) return
    clearCodePracticeMistakes()
    refresh()
    toast.success('Mistakes cleared.')
  }

  const handleRemove = (id: string) => {
    removeCodePracticeMistake(id)
    refresh()
    toast.message('Mistake removed.')
  }

  if (mistakes.length === 0) {
    return (
      <div className={`p-5 text-sm ${wb.textMuted}`}>
        <p className={cn('font-medium', wb.textSecondary)}>No mistakes yet.</p>
        <p className="mt-2 leading-relaxed">
          Run or submit code to start tracking. Failed runs, safety blocks, and wrong outputs appear here (saved locally — SQL excluded).
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col" key={refreshKey}>
      <div className={cn('flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3', wb.border)}>
        <p className={cn('text-sm', wb.textMuted)}>
          {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          className={cn('inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs hover:bg-[#1a2332]', wb.textSecondary)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>

      {topRepeated && (
        <div className="flex items-start gap-2 border-b border-violet-800/40 bg-violet-950/30 px-4 py-3 text-sm text-violet-100">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
          <span>
            Most repeated: <strong className="font-medium">{topRepeated.label}</strong> ({topRepeated.count}×)
          </span>
        </div>
      )}

      <ul className={cn('divide-y', wb.border)}>
        {mistakes.map((m) => (
          <li key={m.id} className="px-4 py-3.5 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn('rounded bg-[#111827] px-2 py-0.5 text-xs uppercase', wb.textSecondary)}>
                    {m.language}
                  </span>
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-xs ring-1 ring-inset',
                      STATUS_STYLE[m.status],
                    )}
                  >
                    {TYPE_LABEL[m.mistakeType]}
                  </span>
                  <span className={cn('text-xs', wb.textMuted)}>{m.attemptType}</span>
                </div>

                <p className={cn('font-medium', wb.textPrimary)}>{m.questionTitle}</p>
                <p className={cn('line-clamp-2', wb.textSecondary)}>{mistakeSummary(m)}</p>

                {m.feedbackSuggestion && (
                  <p className="text-xs text-sky-300">Tip: {m.feedbackSuggestion}</p>
                )}

                {(m.expectedOutput || m.actualOutput) && (
                  <p className={cn('text-xs', wb.textMuted)}>
                    Expected: <span className={wb.textSecondary}>{m.expectedOutput || '—'}</span>
                    {' · '}
                    Got: <span className={wb.textSecondary}>{m.actualOutput || '—'}</span>
                  </p>
                )}

                <time className={cn('text-xs', wb.textMuted)} dateTime={m.createdAt}>
                  {new Date(m.createdAt).toLocaleString()}
                </time>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onRetry(m)}
                  className="inline-flex items-center gap-1 rounded-md bg-violet-500 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-violet-400/50 hover:bg-violet-400"
                >
                  Retry
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(m.id)}
                  className={cn('inline-flex items-center justify-center gap-1 rounded px-2.5 py-1.5 text-xs hover:bg-[#1a2332]', wb.textMuted)}
                  aria-label="Remove mistake"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
