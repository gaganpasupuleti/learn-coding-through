import { useMemo, type ReactNode } from 'react'
import { BookOpen, Lightbulb } from 'lucide-react'
import type {
  SqlAnswerFeedback,
  SqlDatabaseProgressSummary,
  SqlPracticeDifficulty,
  SqlPracticeQuestion,
  SqlPracticeTopic,
  SqlQuestionFilterStatus,
  SqlQuestionProgressRecord,
} from '../types/sqlPractice.types'
import { getDatabaseById } from '../data/databaseCatalog'
import { isCheckableQuestion } from '../data/sqlQuestions'
import {
  getQuestionProgressStatus,
  loadSqlProgress,
  PROGRESS_STATUS_ICON,
  PROGRESS_STATUS_LABEL,
} from '../utils/sqlPracticeProgress'
import { SqlAnswerFeedbackPanel } from './SqlAnswerFeedbackPanel'
import { SqlSolutionPanel } from './SqlSolutionPanel'
import { SqlProgressBadge } from './SqlProgressBadge'
import { SqlProgressSummary } from './SqlProgressSummary'
import { SqlQuestionFilters } from './SqlQuestionFilters'
import { SqlQueryTemplates, type SqlQueryTemplateId } from './SqlQueryTemplates'
import { SqlQuestionLearningGuide } from './SqlQuestionLearningGuide'
import { SqlReviewPanel } from './review/SqlReviewPanel'
import { SqlProgressAnalytics } from './review/SqlProgressAnalytics'
import { SqlWeakTopicCard } from './review/SqlWeakTopicCard'
import type { SqlReviewMode, SuggestedQuestionResult } from '../utils/sqlPracticeAnalytics'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlQuestionPanelProps {
  question: SqlPracticeQuestion
  questions: SqlPracticeQuestion[]
  questionProgress?: SqlQuestionProgressRecord
  databaseSummary: SqlDatabaseProgressSummary
  progressVersion: number
  revealedHintCount: number
  solutionRevealed: boolean
  answerFeedback: SqlAnswerFeedback | null
  statusFilter: SqlQuestionFilterStatus
  difficultyFilter: SqlPracticeDifficulty | 'all'
  topicFilter: SqlPracticeTopic | 'all'
  mistakesCount: number
  mistakeQuestionIds: Set<string>
  suggestion: SuggestedQuestionResult
  reviewQueue: SqlPracticeQuestion[]
  activeReviewMode: SqlReviewMode | null
  analyticsSummary: {
    passed: number
    failed: number
    unattempted: number
    total: number
    hintsUsedTotal: number
    solutionsRevealedCount: number
  }
  topicAnalytics: Array<{ topic: SqlPracticeTopic; passed: number; total: number; failed: number; unattempted: number; attempted: number; passRate: number; isWeak: boolean }>
  difficultyAnalytics: Array<{ difficulty: SqlPracticeDifficulty; passed: number; total: number; failed: number; unattempted: number; attempted: number; passRate: number; isWeak: boolean }>
  weakestTopic: { topic: SqlPracticeTopic; passed: number; failed: number; passRate: number } | null
  weakestDifficulty: { difficulty: SqlPracticeDifficulty; passed: number; total: number } | null
  failedCount: number
  unattemptedCount: number
  weakTopicsCount: number
  hasNextQuestion: boolean
  hasSameTopicQuestion: boolean
  hasSimilarQuestion: boolean
  onSelectQuestion: (questionId: string) => void
  onStatusFilterChange: (value: SqlQuestionFilterStatus) => void
  onDifficultyFilterChange: (value: SqlPracticeDifficulty | 'all') => void
  onTopicFilterChange: (value: SqlPracticeTopic | 'all') => void
  onRevealHint: () => void
  onRevealSolution: () => void
  onUseSolution: () => void
  onNextQuestion: () => void
  onPracticeSameTopic: () => void
  onReviewMistakes: () => void
  onTryAgain: () => void
  onViewExpectedOutput: () => void
  onReviewSimilarQuestion: () => void
  onPracticeSuggested: () => void
  onStartReview: (mode: SqlReviewMode) => void
  onInsertTemplate?: (sql: string, templateId: SqlQueryTemplateId) => void
  headerActions?: ReactNode
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-950/50 text-emerald-200 border-emerald-700/50',
  medium: 'bg-amber-950/50 text-amber-100 border-amber-700/50',
  hard: 'bg-red-950/50 text-red-100 border-red-700/50',
}

const flowBtn =
  'rounded-md border border-emerald-600/50 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-900/50'
const flowBtnSecondary =
  'rounded-md border border-violet-600/50 bg-violet-950/40 px-3 py-1.5 text-xs font-medium text-violet-100 hover:bg-violet-900/50'

export function SqlQuestionPanel({
  question,
  questions,
  questionProgress,
  databaseSummary,
  progressVersion,
  revealedHintCount,
  solutionRevealed,
  answerFeedback,
  statusFilter,
  difficultyFilter,
  topicFilter,
  mistakesCount,
  mistakeQuestionIds,
  suggestion,
  reviewQueue,
  activeReviewMode,
  analyticsSummary,
  topicAnalytics,
  difficultyAnalytics,
  weakestTopic,
  weakestDifficulty,
  failedCount,
  unattemptedCount,
  weakTopicsCount,
  hasNextQuestion,
  hasSameTopicQuestion,
  hasSimilarQuestion,
  onSelectQuestion,
  onStatusFilterChange,
  onDifficultyFilterChange,
  onTopicFilterChange,
  onRevealHint,
  onRevealSolution,
  onUseSolution,
  onNextQuestion,
  onPracticeSameTopic,
  onReviewMistakes,
  onTryAgain,
  onViewExpectedOutput,
  onReviewSimilarQuestion,
  onPracticeSuggested,
  onStartReview,
  onInsertTemplate,
  headerActions,
}: SqlQuestionPanelProps) {
  const db = getDatabaseById(question.databaseId)
  const hintsLeft = question.hints.length - revealedHintCount
  const checkable = isCheckableQuestion(question)
  const progressStatus = getQuestionProgressStatus(questionProgress)

  const displayQuestions = useMemo(() => {
    void progressVersion
    const store = loadSqlProgress()
    return questions.filter((q) => {
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false
      if (statusFilter === 'all') return true
      if (statusFilter === 'mistakes_only') return mistakeQuestionIds.has(q.id)
      return getQuestionProgressStatus(store[q.id]) === statusFilter
    })
  }, [questions, difficultyFilter, topicFilter, statusFilter, progressVersion, mistakeQuestionIds])

  const selectQuestions = displayQuestions.length > 0 ? displayQuestions : questions

  const passed = answerFeedback?.passed === true
  const failed = answerFeedback?.passed === false

  return (
    <aside className={cn('flex h-full flex-col', wb.panel, wb.border)}>
      <div className={cn('flex items-center justify-between gap-2 border-b px-4 py-3', wb.border)}>
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-violet-300" />
          <span className={cn('text-sm font-semibold', wb.textPrimary)}>Practice Question</span>
        </div>
        {headerActions}
      </div>
      <div className={cn('flex-1 space-y-4 overflow-y-auto p-4 text-[15px] leading-relaxed', wb.textSecondary)}>
        <SqlProgressSummary summary={databaseSummary} />

        <p
          className={cn('rounded-md border border-slate-700/50 bg-slate-900/40 px-2.5 py-2 text-[11px] leading-relaxed', wb.textMuted)}
          title="Progress is stored in this browser only"
        >
          Progress, attempts, and mistakes are saved locally in this browser (localStorage). They are not sent to a
          server.
        </p>

        <SqlProgressAnalytics
          summary={analyticsSummary}
          topicRows={topicAnalytics}
          difficultyRows={difficultyAnalytics}
          compact
        />

        <SqlWeakTopicCard weakestTopic={weakestTopic} weakestDifficulty={weakestDifficulty} />

        <SqlReviewPanel
          suggestion={suggestion}
          reviewQueue={reviewQueue}
          activeReviewMode={activeReviewMode}
          failedCount={failedCount}
          mistakesCount={mistakesCount}
          unattemptedCount={unattemptedCount}
          weakTopicsCount={weakTopicsCount}
          onPracticeSuggested={onPracticeSuggested}
          onStartReview={onStartReview}
          onSelectQuestion={onSelectQuestion}
        />

        {onInsertTemplate && (
          <SqlQueryTemplates database={db} question={question} onInsertTemplate={onInsertTemplate} />
        )}

        <SqlQuestionFilters
          statusFilter={statusFilter}
          difficultyFilter={difficultyFilter}
          topicFilter={topicFilter}
          onStatusFilterChange={onStatusFilterChange}
          onDifficultyFilterChange={onDifficultyFilterChange}
          onTopicFilterChange={onTopicFilterChange}
        />

        {questions.length > 1 && (
          <div>
            <label htmlFor="sql-question-select" className={cn('mb-1 block text-xs font-bold uppercase tracking-widest', wb.textMuted)}>
              Question
            </label>
            <select
              id="sql-question-select"
              value={question.id}
              onChange={(e) => onSelectQuestion(e.target.value)}
              className={cn('w-full rounded-md border bg-[#111827] px-3 py-2 text-sm', wb.border, wb.textPrimary)}
            >
              {selectQuestions.map((q) => {
                const store = loadSqlProgress()
                const status = getQuestionProgressStatus(store[q.id])
                return (
                  <option key={q.id} value={q.id}>
                    {PROGRESS_STATUS_ICON[status]} {q.title}
                  </option>
                )
              })}
            </select>
            {displayQuestions.length === 0 && statusFilter !== 'all' && (
              <p className={cn('mt-1 text-xs', wb.textMuted)}>No questions match the current filters.</p>
            )}
          </div>
        )}

        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-2 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Your progress</p>
          <div className="flex flex-wrap items-center gap-2">
            <SqlProgressBadge status={progressStatus} />
            {questionProgress && questionProgress.attemptsCount > 0 && (
              <span className="text-xs">{questionProgress.attemptsCount} attempts</span>
            )}
            {questionProgress && questionProgress.hintsUsedCount > 0 && (
              <span className="text-xs text-violet-200">{questionProgress.hintsUsedCount} hints used</span>
            )}
            {questionProgress?.solutionRevealed && (
              <span className="text-xs text-amber-200">Solution revealed</span>
            )}
          </div>
          {questionProgress?.lastAttemptedAt && (
            <p className={cn('mt-1 text-xs', wb.textMuted)}>
              Last: {PROGRESS_STATUS_LABEL[progressStatus]} · {new Date(questionProgress.lastAttemptedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-semibold uppercase',
              DIFFICULTY_STYLES[question.difficulty],
            )}
          >
            {question.difficulty}
          </span>
          <span className="rounded-full border border-violet-700/50 bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-100">
            {question.topic}
          </span>
          <span className="rounded-full border border-emerald-700/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-100">
            {db.displayName}
          </span>
        </div>

        <h2 className={cn('text-lg font-semibold', wb.textPrimary)}>{question.title}</h2>
        <p className="text-[15px]">{question.problemStatement}</p>

        <SqlQuestionLearningGuide question={question} />

        <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Learning objective</p>
          <p className="text-sm">{question.learningObjective}</p>
        </div>

        <div className={cn('rounded-lg border p-3.5', wb.border, 'bg-[#111827]')}>
          <p className={cn('mb-2 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Expected columns</p>
          <div className="flex flex-wrap gap-2">
            {question.expectedColumns.map((col) => (
              <code key={col} className="rounded bg-[#1E1E1E] px-2 py-1 font-mono text-sm text-emerald-300">
                {col}
              </code>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>
              <Lightbulb className="h-3.5 w-3.5" />
              Hints
            </p>
            {hintsLeft > 0 && (
              <button type="button" onClick={onRevealHint} className={flowBtnSecondary}>
                Reveal hint ({hintsLeft} left)
              </button>
            )}
          </div>
          {revealedHintCount === 0 ? (
            <p className={cn('text-sm', wb.textMuted)}>No hints revealed yet.</p>
          ) : (
            <ul className="space-y-2">
              {question.hints.slice(0, revealedHintCount).map((hint, i) => (
                <li
                  key={i}
                  className={cn('rounded-lg border border-violet-800/40 bg-violet-950/25 p-3 text-sm text-violet-50')}
                >
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>

        {checkable && (
          <div className={cn('rounded-lg border p-3.5', wb.border, 'bg-[#111827]')}>
            <p className={cn('mb-2 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Answer feedback</p>
            <SqlAnswerFeedbackPanel feedback={answerFeedback} />
          </div>
        )}

        {passed && (
          <div className={cn('space-y-2 rounded-lg border border-emerald-700/40 bg-emerald-950/20 p-3', wb.border)}>
            <p className="text-sm font-medium text-emerald-200">Great work! What next?</p>
            <div className="flex flex-wrap gap-2">
              {hasNextQuestion && (
                <button type="button" onClick={onNextQuestion} className={flowBtn}>
                  Next Question
                </button>
              )}
              {hasSameTopicQuestion && (
                <button type="button" onClick={onPracticeSameTopic} className={flowBtn}>
                  Practice another from same topic
                </button>
              )}
              {mistakesCount > 0 && (
                <button type="button" onClick={onReviewMistakes} className={flowBtnSecondary}>
                  Review mistakes
                </button>
              )}
            </div>
          </div>
        )}

        {failed && (
          <div className={cn('space-y-2 rounded-lg border border-rose-700/40 bg-rose-950/20 p-3', wb.border)}>
            <p className="text-sm font-medium text-rose-200">Not quite — keep trying!</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onTryAgain} className={flowBtn}>
                Try again
              </button>
              {hintsLeft > 0 && (
                <button type="button" onClick={onRevealHint} className={flowBtnSecondary}>
                  Reveal next hint
                </button>
              )}
              <button type="button" onClick={onViewExpectedOutput} className={flowBtnSecondary}>
                View expected output
              </button>
              {hasSimilarQuestion && (
                <button type="button" onClick={onReviewSimilarQuestion} className={flowBtnSecondary}>
                  Review similar question
                </button>
              )}
            </div>
          </div>
        )}

        {checkable && (
          <SqlSolutionPanel
            solutionSql={question.solutionSql}
            isRevealed={solutionRevealed}
            onConfirmReveal={onRevealSolution}
            onUseSolution={onUseSolution}
          />
        )}
      </div>
    </aside>
  )
}
