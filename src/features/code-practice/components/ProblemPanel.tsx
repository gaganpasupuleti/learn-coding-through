import { Badge } from '@/components/ui/badge'
import type { CodePracticeQuestion } from '../types/codePractice.types'

interface ProblemPanelProps {
  question: CodePracticeQuestion | null
  languageLabel: string
}

export function ProblemPanel({ question, languageLabel }: ProblemPanelProps) {
  if (!question) {
    return (
      <aside className="flex h-full flex-col border-r border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-semibold text-slate-200">{languageLabel}</p>
        <p className="mt-2 text-xs text-slate-500">
          Questions for this language are coming in a later phase. Select Python, JavaScript, or React.
        </p>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px] uppercase">
            {question.difficulty}
          </Badge>
          <Badge variant="outline" className="border-sky-800 text-sky-300 text-[10px]">
            {question.topic}
          </Badge>
        </div>
        <h2 className="mt-2 text-sm font-semibold text-slate-100">{question.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs text-slate-300">
        <section>
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Problem</h3>
          <p className="leading-relaxed">{question.description}</p>
        </section>

        <section>
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Examples</h3>
          <div className="space-y-2">
            {question.examples.map((ex, i) => (
              <div key={i} className="rounded-md border border-slate-800 bg-slate-900/80 p-2.5 font-mono">
                <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                <div><span className="text-slate-500">Output:</span> {ex.output}</div>
                {ex.explanation && <p className="mt-1 text-slate-500 font-sans">{ex.explanation}</p>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Constraints</h3>
          <ul className="list-disc space-y-1 pl-4 text-slate-400">
            {question.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Questions</h3>
          <p className="text-slate-500">Use the question picker in the toolbar area or switch language to load another drill.</p>
        </section>
      </div>
    </aside>
  )
}
