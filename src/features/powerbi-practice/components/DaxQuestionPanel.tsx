import { Badge } from '@/components/ui/badge'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import type { DaxPracticeQuestion } from '../types/powerbiPractice.types'

interface DaxQuestionPanelProps {
  question: DaxPracticeQuestion
  hintText: string | null
  hintsUsedCount: number
  totalHints: number
}

export function DaxQuestionPanel({ question, hintText, hintsUsedCount, totalHints }: DaxQuestionPanelProps) {
  return (
    <div className={cn('flex h-full flex-col gap-4 overflow-y-auto p-4', wb.panel)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-sky-500/40 bg-sky-950/40 text-sky-200">
          {question.difficulty}
        </Badge>
        <Badge variant="outline" className="border-violet-500/40 bg-violet-950/40 text-violet-200">
          {question.topic}
        </Badge>
      </div>

      <div>
        <h2 className={cn('text-lg font-semibold', wb.textPrimary)}>{question.title}</h2>
        <p className={cn('mt-2 text-sm leading-relaxed', wb.textSecondary)}>{question.problemStatement}</p>
      </div>

      <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
        <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Business context</p>
        <p className={cn('text-sm leading-relaxed', wb.textSecondary)}>{question.businessContext}</p>
      </div>

      <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
        <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Learning objective</p>
        <p className={cn('text-sm leading-relaxed', wb.textSecondary)}>{question.learningObjective}</p>
      </div>

      {hintText && (
        <div className={cn('rounded-lg border border-amber-500/30 bg-amber-950/20 p-3', wb.border)}>
          <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest text-amber-300')}>
            Hint {hintsUsedCount} of {totalHints}
          </p>
          <p className={cn('text-sm leading-relaxed text-amber-100')}>{hintText}</p>
        </div>
      )}
    </div>
  )
}
