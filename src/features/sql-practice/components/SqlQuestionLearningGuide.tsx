import { useMemo } from 'react'
import { GraduationCap, ListOrdered, AlertTriangle } from 'lucide-react'
import type { SqlPracticeQuestion } from '../types/sqlPractice.types'
import { buildQuestionLearningContext } from '../utils/sqlQuestionLearningGuide'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlQuestionLearningGuideProps {
  question: SqlPracticeQuestion
}

const SKILL_STYLES: Record<string, string> = {
  SELECT: 'border-slate-600/60 bg-slate-900/50 text-slate-200',
  WHERE: 'border-sky-700/50 bg-sky-950/40 text-sky-100',
  'GROUP BY': 'border-violet-700/50 bg-violet-950/40 text-violet-100',
  HAVING: 'border-fuchsia-700/50 bg-fuchsia-950/40 text-fuchsia-100',
  'ORDER BY': 'border-amber-700/50 bg-amber-950/40 text-amber-100',
  JOIN: 'border-emerald-700/50 bg-emerald-950/40 text-emerald-100',
  'LEFT JOIN': 'border-teal-700/50 bg-teal-950/40 text-teal-100',
  LIMIT: 'border-slate-600/60 bg-slate-900/50 text-slate-200',
  DISTINCT: 'border-slate-600/60 bg-slate-900/50 text-slate-200',
  COUNT: 'border-violet-700/50 bg-violet-950/40 text-violet-100',
  SUM: 'border-violet-700/50 bg-violet-950/40 text-violet-100',
  AVG: 'border-violet-700/50 bg-violet-950/40 text-violet-100',
  CASE: 'border-rose-700/50 bg-rose-950/40 text-rose-100',
}

export function SqlQuestionLearningGuide({ question }: SqlQuestionLearningGuideProps) {
  const guide = useMemo(() => buildQuestionLearningContext(question), [question])

  return (
    <div className={cn('space-y-3 rounded-lg border p-3.5', wb.border, 'bg-[#111827]')}>
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 shrink-0 text-violet-300" />
        <p className={cn('text-xs font-bold uppercase tracking-widest', wb.textMuted)}>How to approach this</p>
      </div>

      <div className="grid gap-2 text-sm">
        <div>
          <span className={cn('text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>Concept · </span>
          <span>{guide.concept}</span>
        </div>
        {guide.tables.length > 0 && (
          <div>
            <span className={cn('text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>Tables · </span>
            <span className="font-mono text-emerald-200">{guide.tables.join(', ')}</span>
          </div>
        )}
      </div>

      <div>
        <p className={cn('mb-1.5 text-[11px] font-semibold uppercase tracking-wide', wb.textMuted)}>SQL skills needed</p>
        <div className="flex flex-wrap gap-1.5">
          {guide.sqlSkills.map((skill) => (
            <span
              key={skill}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                SKILL_STYLES[skill] ?? SKILL_STYLES.SELECT,
              )}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {guide.conceptGuides.length > 0 && (
        <div className="space-y-2">
          {guide.conceptGuides.map((item) => (
            <div
              key={item.title}
              className="rounded-md border border-violet-800/35 bg-violet-950/20 px-2.5 py-2 text-[13px] leading-snug text-violet-50"
            >
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-200">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className={cn('mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide', wb.textMuted)}>
          <ListOrdered className="h-3.5 w-3.5" />
          Steps to solve
        </p>
        <ol className="list-decimal space-y-1 pl-4 text-[13px] leading-snug">
          {guide.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-2.5 py-2 text-[13px] leading-snug text-amber-50">
        <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-200">
          <AlertTriangle className="h-3.5 w-3.5" />
          Common mistake
        </p>
        <p>{guide.commonMistake}</p>
      </div>
    </div>
  )
}
