import { AlertTriangle, Lightbulb, Terminal } from 'lucide-react'
import { formatDuration } from '../utils/executionTimer'
import type { CodePracticeFeedback } from '../types/codePractice.types'
import { cn } from '@/lib/utils'

interface OutputPanelProps {
  output: string
  error: string | null
  consoleLines: string[]
  lastRunMs: number | null
  sampleInput?: string
  executionNote?: string | null
  runtimeLabel?: string | null
  feedbackItems?: CodePracticeFeedback[]
}

const SECTION_LABEL = 'mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500'

export function OutputPanel({
  output,
  error,
  consoleLines,
  lastRunMs,
  sampleInput,
  executionNote,
  runtimeLabel,
  feedbackItems = [],
}: OutputPanelProps) {
  return (
    <aside className="flex h-full flex-col border-l border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Terminal className="h-4 w-4 text-sky-400" />
          Output
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {runtimeLabel && (
            <span className="text-xs text-emerald-500/90">Runtime: {runtimeLabel}</span>
          )}
          <span className="text-xs text-slate-500">{formatDuration(lastRunMs)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-mono leading-relaxed">
        {sampleInput && (
          <div>
            <p className={SECTION_LABEL}>Stdin for this run</p>
            <pre className="whitespace-pre-wrap rounded border border-slate-800 bg-slate-900/60 p-3 text-slate-300">
              {sampleInput}
            </pre>
          </div>
        )}

        {executionNote && (
          <p className="text-sm text-amber-500/90 font-sans">{executionNote}</p>
        )}

        {feedbackItems.length > 0 && (
          <div className="space-y-2.5">
            <p className={SECTION_LABEL}>Feedback</p>
            {feedbackItems.map((item, index) => (
              <div
                key={`${item.ruleId}-${item.lineNumber ?? index}`}
                className={cn(
                  'rounded-md border p-3 font-sans',
                  item.severity === 'error' && 'border-red-900/60 bg-red-950/30 text-red-200',
                  item.severity === 'warning' && 'border-amber-900/50 bg-amber-950/20 text-amber-100',
                  item.severity === 'info' && 'border-sky-900/50 bg-sky-950/20 text-sky-100',
                )}
              >
                <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 shrink-0 opacity-80" />
                  {item.title}
                  {item.lineNumber ? (
                    <span className="text-xs font-normal opacity-70">· line {item.lineNumber}</span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed opacity-90">{item.message}</p>
                {item.suggestion && (
                  <p className="mt-2 text-sm text-sky-300/90">Suggestion: {item.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-900/60 bg-red-950/40 p-3 text-red-300">
            <div className="mb-1.5 flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{error}</pre>
          </div>
        )}

        <div>
          <p className={SECTION_LABEL}>Stdout</p>
          <pre className="whitespace-pre-wrap text-slate-200">
            {output || <span className="text-slate-500">Run code to see output…</span>}
          </pre>
        </div>

        {consoleLines.length > 0 && (
          <div>
            <p className={SECTION_LABEL}>Console</p>
            <pre className="whitespace-pre-wrap text-slate-300">
              {consoleLines.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </aside>
  )
}
