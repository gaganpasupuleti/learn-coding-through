import type { CodePracticeAttempt } from '../types/codePractice.types'
import { formatDuration } from '../utils/executionTimer'

interface AttemptHistoryPanelProps {
  attempts: CodePracticeAttempt[]
}

export function AttemptHistoryPanel({ attempts }: AttemptHistoryPanelProps) {
  if (attempts.length === 0) {
    return <div className="p-3 text-xs text-slate-500">Saved attempts appear here after you click Save attempt.</div>
  }

  return (
    <div className="divide-y divide-slate-800 max-h-40 overflow-y-auto">
      {attempts.map((attempt) => (
        <div key={attempt.id} className="px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-300">{attempt.questionId}</span>
            <span className={attempt.passed ? 'text-emerald-400' : 'text-slate-500'}>
              {attempt.passed ? 'passed' : 'saved'}
            </span>
          </div>
          <div className="mt-0.5 text-slate-600">
            {attempt.language} · {formatDuration(attempt.durationMs)} · {new Date(attempt.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
