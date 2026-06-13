import { useMemo, useState } from 'react'
import { Code2, RotateCcw, Trash2 } from 'lucide-react'
import { getDatabaseById } from '../data/databaseCatalog'
import { getQuestionById } from '../data/sqlQuestions'
import type { SqlMistakeRecord } from '../types/sqlPractice.types'
import { TOPIC_LABELS } from '../utils/sqlPracticeAnalytics'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlMistakesPanelProps {
  mistakes: SqlMistakeRecord[]
  onRetryQuestion: (questionId: string, databaseId: SqlMistakeRecord['databaseId'], sql: string) => void
  onLoadFailedSql: (questionId: string, databaseId: SqlMistakeRecord['databaseId'], sql: string) => void
  onClearResolved?: () => void
  resolvedMistakeCount?: number
}

type GroupedMistakes = Record<string, Record<string, SqlMistakeRecord[]>>

function groupMistakes(mistakes: SqlMistakeRecord[]): GroupedMistakes {
  const grouped: GroupedMistakes = {}
  for (const m of mistakes) {
    const db = getDatabaseById(m.databaseId).displayName
    const question = getQuestionById(m.questionId)
    const topic = question ? TOPIC_LABELS[question.topic] : 'Unknown'
    grouped[db] ??= {}
    grouped[db][topic] ??= []
    grouped[db][topic].push(m)
  }
  return grouped
}

export function SqlMistakesPanel({
  mistakes,
  onRetryQuestion,
  onLoadFailedSql,
  onClearResolved,
  resolvedMistakeCount = 0,
}: SqlMistakesPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false)
  const grouped = useMemo(() => groupMistakes(mistakes), [mistakes])

  if (mistakes.length === 0) {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)}>
        No SQL mistakes tracked yet. Failed answer checks appear here.
      </div>
    )
  }

  const handleClearResolved = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    onClearResolved?.()
    setConfirmClear(false)
  }

  return (
    <div className="space-y-3 p-4">
      {resolvedMistakeCount > 0 && onClearResolved && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClearResolved}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
              confirmClear
                ? 'border-rose-600/60 bg-rose-950/50 text-rose-100'
                : 'border-slate-600/50 bg-slate-900/50 text-slate-200 hover:bg-slate-800/60',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmClear
              ? `Confirm clear ${resolvedMistakeCount} resolved`
              : `Clear resolved mistakes (${resolvedMistakeCount})`}
          </button>
          {confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {Object.entries(grouped).map(([dbName, byTopic]) => (
        <div key={dbName} className="space-y-2">
          <p className={cn('text-xs font-bold uppercase tracking-widest text-emerald-200/90')}>{dbName}</p>
          {Object.entries(byTopic).map(([topic, items]) => (
            <div key={`${dbName}-${topic}`} className="space-y-2">
              <p className={cn('text-[10px] font-semibold uppercase tracking-wide', wb.textMuted)}>{topic}</p>
              <ul className={cn('space-y-3 text-sm', wb.textMuted)}>
                {items.map((m) => {
                  const question = getQuestionById(m.questionId)
                  const title = m.questionTitle ?? question?.title ?? m.questionId

                  return (
                    <li key={m.id} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-rose-950/60 px-2 py-0.5 font-semibold text-rose-200">
                          {m.errorType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-violet-200">{title}</span>
                        <span>{new Date(m.recordedAt).toLocaleString()}</span>
                      </div>
                      <p className="mb-1 text-xs text-amber-200">{m.feedback}</p>
                      <p className="mb-2 font-mono text-xs text-slate-300">
                        {m.sql.trim().slice(0, 200)}
                        {m.sql.length > 200 ? '…' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onRetryQuestion(m.questionId, m.databaseId, m.sql)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-violet-600/50 bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-100 hover:bg-violet-900/50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Retry this question
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadFailedSql(m.questionId, m.databaseId, m.sql)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/50 bg-slate-900/50 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/60"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Load failed SQL
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
