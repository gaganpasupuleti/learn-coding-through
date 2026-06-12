import { CheckCircle2, XCircle } from 'lucide-react'
import type { SqlAnswerFeedback } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlAnswerFeedbackPanelProps {
  feedback: SqlAnswerFeedback | null
}

export function SqlAnswerFeedbackPanel({ feedback }: SqlAnswerFeedbackPanelProps) {
  if (!feedback) {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)}>
        Click <strong className="font-semibold text-emerald-300">Check Answer</strong> to validate your query against
        the expected result.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        {feedback.passed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/50 bg-emerald-950/50 px-3 py-1 text-sm font-semibold text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Passed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-600/50 bg-rose-950/50 px-3 py-1 text-sm font-semibold text-rose-200">
            <XCircle className="h-4 w-4" />
            Failed
          </span>
        )}
      </div>

      <ul className={cn('space-y-1.5 text-sm', wb.textSecondary)}>
        {feedback.feedback.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-emerald-400">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Expected columns</p>
          <p className="font-mono text-sm text-emerald-300">
            {feedback.expectedColumns.length > 0 ? feedback.expectedColumns.join(', ') : '—'}
          </p>
        </div>
        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Your columns</p>
          <p className="font-mono text-sm text-sky-300">
            {feedback.studentColumns.length > 0 ? feedback.studentColumns.join(', ') : '—'}
          </p>
        </div>
        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Expected rows</p>
          <p className="font-mono text-sm">{feedback.expectedRowCount}</p>
        </div>
        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Your rows</p>
          <p className="font-mono text-sm">{feedback.studentRowCount}</p>
        </div>
      </div>
    </div>
  )

}
