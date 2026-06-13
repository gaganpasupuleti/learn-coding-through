import type { SqlPracticeQuestion } from '../../types/sqlPractice.types'
import type { SqlReviewMode, SuggestedQuestionResult } from '../../utils/sqlPracticeAnalytics'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import { BookOpenCheck, ListChecks, RotateCcw, Sparkles, Target } from 'lucide-react'
import { SqlReviewQueue } from './SqlReviewQueue'

interface SqlReviewPanelProps {
  suggestion: SuggestedQuestionResult
  reviewQueue: SqlPracticeQuestion[]
  activeReviewMode: SqlReviewMode | null
  failedCount: number
  mistakesCount: number
  unattemptedCount: number
  weakTopicsCount: number
  onPracticeSuggested: () => void
  onStartReview: (mode: SqlReviewMode) => void
  onSelectQuestion: (questionId: string) => void
}

const reviewBtn =
  'inline-flex items-center gap-1 rounded-md border border-violet-600/50 bg-violet-950/40 px-2 py-1 text-[11px] font-medium text-violet-100 hover:bg-violet-900/50 disabled:opacity-40'

export function SqlReviewPanel({
  suggestion,
  reviewQueue,
  activeReviewMode,
  failedCount,
  mistakesCount,
  unattemptedCount,
  weakTopicsCount,
  onPracticeSuggested,
  onStartReview,
  onSelectQuestion,
}: SqlReviewPanelProps) {
  const allCaughtUp = suggestion.reason === 'all_caught_up'

  return (
    <div className={cn('space-y-3 rounded-lg border border-violet-700/40 bg-violet-950/15 p-3')}>
      <p className={cn('flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>
        <BookOpenCheck className="h-3.5 w-3.5 text-violet-300" aria-hidden />
        Review mode
      </p>
      <p className={cn('text-[11px] leading-relaxed', wb.textMuted)}>
        Focus practice on failed questions, mistakes, unfinished topics, or weak areas. Progress is stored locally
        in this browser.
      </p>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={failedCount === 0}
          onClick={() => onStartReview('failed')}
          className={reviewBtn}
          title={failedCount === 0 ? 'No failed questions need review' : 'Practice questions marked as failed'}
        >
          <RotateCcw className="h-3 w-3" />
          Retry failed ({failedCount})
        </button>
        <button
          type="button"
          disabled={mistakesCount === 0}
          onClick={() => onStartReview('mistakes')}
          className={reviewBtn}
          title={mistakesCount === 0 ? 'No mistakes recorded yet' : 'Open mistakes from failed checks'}
        >
          <ListChecks className="h-3 w-3" />
          Review mistakes ({mistakesCount})
        </button>
        <button
          type="button"
          disabled={unattemptedCount === 0}
          onClick={() => onStartReview('unattempted')}
          className={reviewBtn}
          title={unattemptedCount === 0 ? 'Every question has been attempted' : 'Continue with unattempted questions'}
        >
          <Target className="h-3 w-3" />
          Continue unfinished ({unattemptedCount})
        </button>
        <button
          type="button"
          disabled={weakTopicsCount === 0}
          onClick={() => onStartReview('weak_topics')}
          className={reviewBtn}
          title={weakTopicsCount === 0 ? 'No weak topics detected yet' : 'Practice topics with low pass rate'}
        >
          Practice weak topics ({weakTopicsCount})
        </button>
      </div>

      <SqlReviewQueue mode={activeReviewMode} queue={reviewQueue} onSelectQuestion={onSelectQuestion} />

      <div className={cn('rounded-md border p-2.5', wb.border, 'bg-[#111827]')}>
        <p className={cn('mb-1.5 text-[10px] font-bold uppercase tracking-widest', wb.textMuted)}>
          Suggested next
        </p>
        {allCaughtUp ? (
          <p className="mb-2 text-xs font-medium text-emerald-200/90" role="status">
            All caught up — every question is passed!
          </p>
        ) : (
          <p className="mb-2 text-xs text-slate-300">{suggestion.message}</p>
        )}
        {suggestion.question && !allCaughtUp && (
          <p className="mb-2 text-xs font-medium text-violet-200">{suggestion.question.title}</p>
        )}
        <button
          type="button"
          disabled={allCaughtUp}
          onClick={onPracticeSuggested}
          title={allCaughtUp ? 'All questions passed' : 'Load the suggested next question'}
          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600/50 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-900/50 disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Practice suggested question
        </button>
      </div>
    </div>
  )
}
