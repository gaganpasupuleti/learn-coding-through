import type { SqlPracticeQuestion } from '../../types/sqlPractice.types'
import type { SqlReviewMode } from '../../utils/sqlPracticeAnalytics'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlReviewQueueProps {
  mode: SqlReviewMode | null
  queue: SqlPracticeQuestion[]
  onSelectQuestion: (questionId: string) => void
}

const MODE_LABELS: Record<SqlReviewMode, string> = {
  failed: 'Failed questions',
  mistakes: 'Mistake questions',
  unattempted: 'Unattempted',
  weak_topics: 'Weak topics',
  topic: 'By topic',
  difficulty: 'By difficulty',
}

export function SqlReviewQueue({ mode, queue, onSelectQuestion }: SqlReviewQueueProps) {
  if (!mode || queue.length === 0) return null

  return (
    <div className={cn('rounded-lg border border-violet-700/40 bg-violet-950/20 p-3')}>
      <p className={cn('mb-2 text-[10px] font-bold uppercase tracking-widest', wb.textMuted)}>
        {MODE_LABELS[mode]} ({queue.length})
      </p>
      <ul className="max-h-28 space-y-1 overflow-y-auto text-xs">
        {queue.slice(0, 8).map((q) => (
          <li key={q.id}>
            <button
              type="button"
              onClick={() => onSelectQuestion(q.id)}
              className="w-full truncate rounded px-1.5 py-0.5 text-left text-violet-100 hover:bg-violet-900/40"
            >
              {q.title}
            </button>
          </li>
        ))}
        {queue.length > 8 && (
          <li className={cn('px-1.5 text-[10px]', wb.textMuted)}>+{queue.length - 8} more</li>
        )}
      </ul>
    </div>
  )
}
