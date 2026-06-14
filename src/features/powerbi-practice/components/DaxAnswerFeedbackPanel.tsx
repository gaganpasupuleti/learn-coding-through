import { CheckCircle2, XCircle } from 'lucide-react'
import type { DaxAnswerFeedback } from '../types/powerbiPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface DaxAnswerFeedbackPanelProps {
  feedback: DaxAnswerFeedback | null
}

export function DaxAnswerFeedbackPanel({ feedback }: DaxAnswerFeedbackPanelProps) {
  if (!feedback) {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)}>
        Click <strong className="font-semibold text-emerald-300">Check Answer</strong> to validate your formula with
        placeholder rules.
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
            Needs work
          </span>
        )}
      </div>

      <ul className={cn('space-y-1.5 text-sm', wb.textSecondary)}>
        {feedback.feedback.map((line, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-emerald-400">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {feedback.explanation && (
        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Explanation</p>
          <p className={cn('text-sm leading-relaxed', wb.textSecondary)}>{feedback.explanation}</p>
        </div>
      )}
    </div>
  )
}
