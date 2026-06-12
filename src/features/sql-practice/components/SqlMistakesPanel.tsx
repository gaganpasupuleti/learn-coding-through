import { RotateCcw } from 'lucide-react'
import { getDatabaseById } from '../data/databaseCatalog'
import { getQuestionById } from '../data/sqlQuestions'
import type { SqlMistakeRecord } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlMistakesPanelProps {
  mistakes: SqlMistakeRecord[]
  onRetryQuestion: (questionId: string, databaseId: SqlMistakeRecord['databaseId'], sql: string) => void
}

export function SqlMistakesPanel({ mistakes, onRetryQuestion }: SqlMistakesPanelProps) {
  if (mistakes.length === 0) {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)}>
        No SQL mistakes tracked yet. Failed answer checks appear here.
      </div>
    )
  }

  return (
    <ul className={cn('space-y-3 p-4 text-sm', wb.textMuted)}>
      {mistakes.map((m) => {
        const db = getDatabaseById(m.databaseId)
        const question = getQuestionById(m.questionId)
        const title = m.questionTitle ?? question?.title ?? m.questionId

        return (
          <li key={m.id} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-rose-950/60 px-2 py-0.5 font-semibold text-rose-200">
                {m.errorType.replace(/_/g, ' ')}
              </span>
              <span className="font-medium text-violet-200">{title}</span>
              <span className="text-emerald-200/80">{db.displayName}</span>
              <span>{new Date(m.recordedAt).toLocaleString()}</span>
            </div>
            <p className="mb-1 text-xs text-amber-200">{m.feedback}</p>
            <p className="mb-2 font-mono text-xs text-slate-300">
              {m.sql.trim().slice(0, 200)}
              {m.sql.length > 200 ? '…' : ''}
            </p>
            <button
              type="button"
              onClick={() => onRetryQuestion(m.questionId, m.databaseId, m.sql)}
              className="inline-flex items-center gap-1.5 rounded-md border border-violet-600/50 bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry question
            </button>
          </li>
        )
      })}
    </ul>
  )
}
