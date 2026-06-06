import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  clearPracticeMistakes,
  listPracticeMistakes,
  removePracticeMistake,
  type PracticeMistake,
} from '@/lib/practice-mistakes'
import { cn } from '@/lib/utils'

import type { CodePracticeLanguage, PracticeGroundSection } from './practice-ground-types'

const LANG_LABEL: Record<CodePracticeLanguage, string> = {
  python: 'Python',
  sql: 'SQL',
  java: 'Java',
}

const LANG_BADGE: Record<CodePracticeLanguage, string> = {
  python: 'bg-emerald-100 text-emerald-800 ring-emerald-200/60',
  sql: 'bg-sky-100 text-sky-800 ring-sky-200/60',
  java: 'bg-orange-100 text-orange-800 ring-orange-200/60',
}

interface MistakesReviewPanelProps {
  onRetry: (language: CodePracticeLanguage, code: string) => void
}

export function MistakesReviewPanel({ onRetry }: MistakesReviewPanelProps) {
  const [mistakes, setMistakes] = useState<PracticeMistake[]>([])

  const refresh = useCallback(() => {
    setMistakes(listPracticeMistakes())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleClearAll = () => {
    if (!confirm('Clear all saved practice mistakes?')) return
    clearPracticeMistakes()
    refresh()
    toast.success('Mistakes cleared.')
  }

  if (mistakes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <AlertCircle className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">No mistakes logged yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          When a Python, SQL, or Java run fails in the practice editors, the error is saved here so you
          can review and retry.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {mistakes.length} saved mistake{mistakes.length === 1 ? '' : 's'} from code practice runs.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleClearAll}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>

      <ul className="space-y-3">
        {mistakes.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                      LANG_BADGE[item.language],
                    )}
                  >
                    {LANG_LABEL[item.language]}
                  </span>
                  <time className="text-xs text-slate-400" dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                </div>
                <pre className="max-h-28 overflow-auto rounded-lg bg-red-50/80 p-3 font-mono text-xs text-red-900 whitespace-pre-wrap">
                  {item.message}
                </pre>
                {item.codePreview ? (
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900">
                      View code snippet
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap">
                      {item.codePreview}
                    </pre>
                  </details>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onRetry(item.language, item.codePreview)}
                >
                  Retry
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-slate-500"
                  onClick={() => {
                    removePracticeMistake(item.id)
                    refresh()
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
