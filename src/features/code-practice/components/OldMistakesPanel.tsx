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

interface OldMistakesPanelProps {
  refreshKey: number
  onRetry: (mistake: CodePracticeMistake) => void
}

const STATUS_STYLE: Record<CodePracticeMistake['status'], string> = {
  failed: 'bg-red-950/50 text-red-300 ring-red-900/50',
  blocked: 'bg-amber-950/40 text-amber-200 ring-amber-900/50',
  warning: 'bg-sky-950/40 text-sky-200 ring-sky-900/50',
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
      <div className="p-4 text-xs text-slate-500">
        <p>No mistakes logged yet.</p>
        <p className="mt-1 text-slate-600">
          Failed runs, blocked code, and wrong test outputs from this workbench are saved here (SQL excluded — Issue #30).
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col" key={refreshKey}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <p className="text-[10px] text-slate-500">
          {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <Trash2 className="h-3 w-3" />
          Clear all
        </button>
      </div>

      {topRepeated && (
        <div className="flex items-start gap-2 border-b border-slate-800 bg-violet-950/20 px-3 py-2 text-[11px] text-violet-200">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span>
            Most repeated: <strong className="font-medium">{topRepeated.label}</strong> ({topRepeated.count}×)
          </span>
        </div>
      )}

      <ul className="divide-y divide-slate-800">
        {mistakes.map((m) => (
          <li key={m.id} className="px-3 py-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                    {m.language}
                  </span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] ring-1 ring-inset',
                      STATUS_STYLE[m.status],
                    )}
                  >
                    {TYPE_LABEL[m.mistakeType]}
                  </span>
                  <span className="text-[10px] text-slate-600">{m.attemptType}</span>
                </div>

                <p className="font-medium text-slate-300">{m.questionTitle}</p>
                <p className="line-clamp-2 text-slate-400">{mistakeSummary(m)}</p>

                {m.feedbackSuggestion && (
                  <p className="text-[10px] text-sky-400/90">Tip: {m.feedbackSuggestion}</p>
                )}

                {(m.expectedOutput || m.actualOutput) && (
                  <p className="text-[10px] text-slate-500">
                    Expected: <span className="text-slate-400">{m.expectedOutput || '—'}</span>
                    {' · '}
                    Got: <span className="text-slate-400">{m.actualOutput || '—'}</span>
                  </p>
                )}

                <time className="text-[10px] text-slate-600" dateTime={m.createdAt}>
                  {new Date(m.createdAt).toLocaleString()}
                </time>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onRetry(m)}
                  className="inline-flex items-center gap-1 rounded bg-violet-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-violet-500"
                >
                  Retry
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(m.id)}
                  className="inline-flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                  aria-label="Remove mistake"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
