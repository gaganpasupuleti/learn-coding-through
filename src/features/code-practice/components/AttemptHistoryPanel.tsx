import type { CodePracticeAttempt } from '../types/codePractice.types'
import { formatDuration } from '../utils/executionTimer'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface AttemptHistoryPanelProps {
  attempts: CodePracticeAttempt[]
}

export function AttemptHistoryPanel({ attempts }: AttemptHistoryPanelProps) {
  if (attempts.length === 0) {
    return <div className={`p-4 text-sm ${wb.textMuted}`}>Saved attempts appear here after you click Save attempt.</div>
  }

  return (
    <div className={cn('divide-y max-h-56 overflow-y-auto', wb.border)}>
      {attempts.map((attempt) => (
        <div key={attempt.id} className="px-4 py-3.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium ${wb.textPrimary}`}>{attempt.questionId}</span>
            <span className={attempt.passed ? 'text-emerald-400' : wb.textMuted}>
              {attempt.passed ? 'passed' : 'saved'}
            </span>
          </div>
          <div className={cn('mt-1', wb.textMuted)}>
            {attempt.language} · {formatDuration(attempt.durationMs)} · {new Date(attempt.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
