import { Badge } from '@/components/ui/badge'
import type { CodePracticeQuestion } from '../types/codePractice.types'
import { resolveQuestionTestCases } from '../utils/executionAdapter'

interface ProblemPanelProps {
  question: CodePracticeQuestion | null
  languageLabel: string
}

const SECTION_LABEL = 'mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'

export function ProblemPanel({ question, languageLabel }: ProblemPanelProps) {
  if (!question) {
    return (
      <aside className="flex h-full flex-col border-r border-slate-800 bg-slate-950 p-5">
        <p className="text-base font-semibold text-slate-200">{languageLabel}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Questions for this language are coming in a later phase. Select Python, JavaScript, or React.
        </p>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs uppercase">
            {question.difficulty}
          </Badge>
          <Badge variant="outline" className="border-sky-800 text-sky-300 text-xs">
            {question.topic}
          </Badge>
        </div>
        <h2 className="mt-2.5 text-base font-semibold leading-snug text-slate-100">{question.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm leading-relaxed text-slate-300">
        <section>
          <h3 className={SECTION_LABEL}>Problem</h3>
          <p>{question.description}</p>
        </section>

        <section>
          <h3 className={SECTION_LABEL}>Examples</h3>
          <div className="space-y-2.5">
            {question.examples.map((ex, i) => (
              <div key={i} className="rounded-md border border-slate-800 bg-slate-900/80 p-3 font-mono text-sm">
                <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                <div><span className="text-slate-500">Output:</span> {ex.output}</div>
                {ex.explanation && <p className="mt-1.5 text-slate-500 font-sans text-sm">{ex.explanation}</p>}
              </div>
            ))}
          </div>
        </section>

        {(question.defaultInput || (question.testCases?.length ?? 0) > 0) && (
          <section>
            <h3 className={SECTION_LABEL}>Sample input</h3>
            {question.defaultInput && (
              <pre className="rounded-md border border-slate-800 bg-slate-900/80 p-3 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                {question.defaultInput}
              </pre>
            )}
            <div className="mt-2.5 space-y-2">
              {resolveQuestionTestCases(question).map((tc) => (
                <div key={tc.id} className="rounded border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  <span className="text-slate-500">{tc.label}:</span>{' '}
                  {tc.input ? `input → ${tc.input.replace(/\n/g, '\\n')}` : 'no stdin'} → {tc.expectedOutput.replace(/\n/g, '\\n')}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className={SECTION_LABEL}>Constraints</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-slate-400">
            {question.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className={SECTION_LABEL}>Questions</h3>
          <p className="text-slate-500">Use the question picker in the toolbar area or switch language to load another drill.</p>
        </section>
      </div>
    </aside>
  )
}
