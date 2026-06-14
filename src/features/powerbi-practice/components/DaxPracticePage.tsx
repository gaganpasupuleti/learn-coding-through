import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import { getDatasetById } from '../data/datasetCatalog'
import {
  DAX_PRACTICE_QUESTIONS,
  getDaxQuestionById,
  getDefaultDaxQuestion,
} from '../data/daxQuestions'
import { DAX_PRACTICE_ROUTE, type DaxAnswerFeedback } from '../types/powerbiPractice.types'
import { checkDaxFormulaPlaceholder } from '../utils/daxPlaceholderValidator'
import { DaxAnswerFeedbackPanel } from './DaxAnswerFeedbackPanel'
import { DaxEditorPanel } from './DaxEditorPanel'
import { DaxQuestionPanel } from './DaxQuestionPanel'
import { DaxSchemaPanel } from './DaxSchemaPanel'

interface DaxPracticePageProps {
  onBackToLanding: () => void
}

export function DaxPracticePage({ onBackToLanding }: DaxPracticePageProps) {
  const [questionId, setQuestionId] = useState(getDefaultDaxQuestion().id)
  const [formula, setFormula] = useState(getDefaultDaxQuestion().starterFormula)
  const [feedback, setFeedback] = useState<DaxAnswerFeedback | null>(null)
  const [hintsUsedCount, setHintsUsedCount] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  const question = useMemo(
    () => getDaxQuestionById(questionId) ?? getDefaultDaxQuestion(),
    [questionId],
  )
  const dataset = useMemo(() => getDatasetById(question.datasetId), [question.datasetId])

  const activeHintText =
    hintsUsedCount > 0 ? (question.hints[hintsUsedCount - 1] ?? null) : null
  const hintsRemaining = Math.max(question.hints.length - hintsUsedCount, 0)

  const loadQuestion = useCallback((nextQuestionId: string) => {
    const nextQuestion = getDaxQuestionById(nextQuestionId) ?? getDefaultDaxQuestion()
    setQuestionId(nextQuestion.id)
    setFormula(nextQuestion.starterFormula)
    setFeedback(null)
    setHintsUsedCount(0)
  }, [])

  const handleCheckAnswer = useCallback(() => {
    setIsChecking(true)
    const result = checkDaxFormulaPlaceholder(formula, question)
    setFeedback(result)
    setIsChecking(false)
  }, [formula, question])

  const handleHint = useCallback(() => {
    if (hintsUsedCount >= question.hints.length) return
    setHintsUsedCount((count) => count + 1)
  }, [hintsUsedCount, question.hints.length])

  const handleReset = useCallback(() => {
    setFormula(question.starterFormula)
    setFeedback(null)
    setHintsUsedCount(0)
  }, [question.starterFormula])

  return (
    <div className={cn('flex min-h-full flex-col', wb.root)}>
      <header className={cn('border-b px-4 py-3 md:px-6', wb.border, wb.panelHeader)}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onBackToLanding} className={wb.toolbarBtn}>
              <ArrowLeft size={16} aria-hidden />
              Back to Power BI Practice Ground
            </button>
            <div>
              <p className={cn('text-xs font-bold uppercase tracking-widest', wb.textMuted)}>DAX Practice</p>
              <h1 className={cn('text-lg font-semibold', wb.textPrimary)}>DAX Practice IDE</h1>
            </div>
          </div>

          <label className={cn('flex items-center gap-2 text-sm', wb.textSecondary)}>
            <span className={cn('text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Question</span>
            <div className="relative">
              <select
                value={question.id}
                onChange={(event) => loadQuestion(event.target.value)}
                className={cn(
                  'appearance-none rounded-md border py-2 pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-sky-500/40',
                  wb.border,
                  'bg-[#111827]',
                  wb.textPrimary,
                )}
                aria-label="Select DAX practice question"
              >
                {DAX_PRACTICE_QUESTIONS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className={cn('pointer-events-none absolute right-2 top-1/2 -translate-y-1/2', wb.textMuted)} />
            </div>
          </label>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className={cn('flex min-h-[420px] flex-col border-b lg:border-b-0 lg:border-r', wb.border)}>
          <DaxQuestionPanel
            question={question}
            hintText={activeHintText}
            hintsUsedCount={hintsUsedCount}
            totalHints={question.hints.length}
          />
          <DaxSchemaPanel dataset={dataset} />
        </div>

        <div className="flex min-h-[420px] flex-col">
          <DaxEditorPanel
            formula={formula}
            onChange={setFormula}
            onCheckAnswer={handleCheckAnswer}
            onHint={handleHint}
            onReset={handleReset}
            isChecking={isChecking}
            hintsRemaining={hintsRemaining}
          />
          <div className={cn('min-h-[180px] border-t', wb.border, wb.panel)}>
            <p className={cn('border-b px-4 py-2 text-xs font-bold uppercase tracking-widest', wb.border, wb.textMuted)}>
              Result
            </p>
            <DaxAnswerFeedbackPanel feedback={feedback} />
          </div>
        </div>
      </div>

      <p className={cn('border-t px-4 py-2 text-center text-xs', wb.border, wb.textMuted)}>
        Route: {DAX_PRACTICE_ROUTE} · Fictional dataset only · Full validation in Phase 24C
      </p>
    </div>
  )
}
