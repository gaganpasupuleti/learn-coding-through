import type { ReactNode } from 'react'
import { BookOpen, Lightbulb } from 'lucide-react'
import type { SqlAnswerFeedback, SqlPracticeQuestion } from '../types/sqlPractice.types'
import { getDatabaseById } from '../data/databaseCatalog'
import { isCheckableQuestion } from '../data/sqlQuestions'
import { SqlAnswerFeedbackPanel } from './SqlAnswerFeedbackPanel'
import { SqlSolutionPanel } from './SqlSolutionPanel'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlQuestionPanelProps {
  question: SqlPracticeQuestion
  questions: SqlPracticeQuestion[]
  revealedHintCount: number
  solutionRevealed: boolean
  answerFeedback: SqlAnswerFeedback | null
  onSelectQuestion: (questionId: string) => void
  onRevealHint: () => void
  onRevealSolution: () => void
  onUseSolution: () => void
  headerActions?: ReactNode
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-950/50 text-emerald-200 border-emerald-700/50',
  medium: 'bg-amber-950/50 text-amber-100 border-amber-700/50',
  hard: 'bg-red-950/50 text-red-100 border-red-700/50',
}

export function SqlQuestionPanel({
  question,
  questions,
  revealedHintCount,
  solutionRevealed,
  answerFeedback,
  onSelectQuestion,
  onRevealHint,
  onRevealSolution,
  onUseSolution,
  headerActions,
}: SqlQuestionPanelProps) {
  const db = getDatabaseById(question.databaseId)
  const hintsLeft = question.hints.length - revealedHintCount
  const checkable = isCheckableQuestion(question)

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
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        )}

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
        <p>{question.problemStatement}</p>

        <div className={cn('rounded-lg border p-3.5', wb.border, 'bg-[#111827]')}>
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
              <button
                type="button"
                onClick={onRevealHint}
                className="inline-flex items-center gap-1 rounded-md border border-violet-600/50 bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-100 hover:bg-violet-900/50"
              >
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

        {checkable && (
          <SqlSolutionPanel
            solutionSql={question.solutionSql}
            isRevealed={solutionRevealed}
            onConfirmReveal={onRevealSolution}
            onUseSolution={onUseSolution}
          />
        )}

        {!checkable && (
          <div className={cn('rounded-lg border border-dashed p-3 text-sm', wb.border, wb.textMuted)}>
            Answer checking for this database will be enabled in a later phase.
          </div>
        )}
      </div>
    </aside>
  )
}
