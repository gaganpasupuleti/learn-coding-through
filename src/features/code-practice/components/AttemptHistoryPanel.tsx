import { Clock, Code2 } from 'lucide-react'
import type { CodePracticeAttempt } from '../types/codePractice.types'
import { formatDuration } from '../utils/executionTimer'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface AttemptHistoryPanelProps {
  attempts: CodePracticeAttempt[]
}

export function AttemptHistoryPanel({ attempts }: AttemptHistoryPanelProps) {
  if (attempts.length === 0) {
    return (
      <div className={`p-5 text-sm ${wb.textMuted}`}>
        <p className={cn('font-medium', wb.textSecondary)}>No saved attempts yet.</p>
        <p className="mt-2">Click <strong className={wb.textPrimary}>Save attempt</strong> in the toolbar after a run to keep a snapshot here.</p>
      </div>
    )
  }

  return (
    <div className={cn('divide-y max-h-56 overflow-y-auto', wb.border)}>
      {attempts.map((attempt) => (
        <div key={attempt.id} className="px-4 py-3.5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn('font-semibold truncate', wb.textPrimary)}>{attempt.questionId}</p>
              <div className={cn('mt-1.5 flex flex-wrap items-center gap-2 text-xs', wb.textMuted)}>
                <span className="inline-flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5" aria-hidden />
                  {attempt.language}
                </span>
                <span>·</span>
                <span>{formatDuration(attempt.durationMs)}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {new Date(attempt.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
                attempt.passed
                  ? 'bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-700/50'
                  : 'bg-[#111827] text-[#94A3B8] ring-1 ring-[#26324A]',
              )}
            >
              {attempt.passed ? 'Passed' : 'Saved'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
