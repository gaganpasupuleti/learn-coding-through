import { Badge } from '@/components/ui/badge'
import type { CodePracticeQuestion } from '../types/codePractice.types'
import { resolveQuestionTestCases } from '../utils/executionAdapter'
import { wb } from '@/lib/workbench-theme'

interface ProblemPanelProps {
  question: CodePracticeQuestion | null
  languageLabel: string
}

export function ProblemPanel({ question, languageLabel }: ProblemPanelProps) {
  if (!question) {
    return (
      <aside className={`flex h-full flex-col border-r p-5 ${wb.panel} ${wb.border}`}>
        <p className={`text-base font-semibold ${wb.textPrimary}`}>{languageLabel}</p>
        <p className={`mt-3 text-[15px] leading-relaxed ${wb.textSecondary}`}>
          Questions for this language are coming in a later phase. Select Python, JavaScript, Java, or React.
        </p>
      </aside>
    )
  }

  return (
    <aside className={`flex h-full flex-col overflow-hidden border-r ${wb.panel} ${wb.border}`}>
      <div className={`border-b px-5 py-4 ${wb.border}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`border-[#3d4f6f] text-xs uppercase ${wb.textSecondary}`}>
            {question.difficulty}
          </Badge>
          <Badge variant="outline" className="border-sky-600/60 text-sky-200 text-xs">
            {question.topic}
          </Badge>
        </div>
        <h2 className={`mt-3 text-base font-semibold leading-snug ${wb.textPrimary}`}>{question.title}</h2>
      </div>

      <div className={`flex-1 overflow-y-auto px-5 py-4 space-y-6 text-[15px] leading-relaxed ${wb.textSecondary}`}>
        <section>
          <h3 className={wb.sectionLabel}>Problem</h3>
          <p className={wb.textPrimary}>{question.description}</p>
        </section>

        <section>
          <h3 className={wb.sectionLabel}>Examples</h3>
          <div className="space-y-3">
            {question.examples.map((ex, i) => (
              <div key={i} className={wb.cardMono}>
                <div><span className={wb.textMuted}>Input:</span> {ex.input}</div>
                <div><span className={wb.textMuted}>Output:</span> {ex.output}</div>
                {ex.explanation && (
                  <p className={`mt-2 font-sans text-sm leading-relaxed ${wb.textMuted}`}>{ex.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {(question.defaultInput || (question.testCases?.length ?? 0) > 0) && (
          <section>
            <h3 className={wb.sectionLabel}>Sample input</h3>
            {question.defaultInput && (
              <pre className={`${wb.cardMono} whitespace-pre-wrap`}>
                {question.defaultInput}
              </pre>
            )}
            <div className="mt-3 space-y-2">
              {resolveQuestionTestCases(question).map((tc) => (
                <div key={tc.id} className={`rounded-lg border px-3 py-2.5 text-sm ${wb.border} bg-[#111827] ${wb.textMuted}`}>
                  <span className={wb.textSecondary}>{tc.label}:</span>{' '}
                  {tc.input ? `input → ${tc.input.replace(/\n/g, '\\n')}` : 'no stdin'} → {tc.expectedOutput.replace(/\n/g, '\\n')}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className={wb.sectionLabel}>Constraints</h3>
          <ul className={`list-disc space-y-2 pl-5 ${wb.textSecondary}`}>
            {question.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className={wb.sectionLabel}>Questions</h3>
          <p className={wb.textMuted}>Use the question picker in the toolbar area or switch language to load another drill.</p>
        </section>
      </div>
    </aside>
  )
}
