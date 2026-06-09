import { AlertTriangle, Lightbulb, Terminal } from 'lucide-react'
import { formatDuration } from '../utils/executionTimer'
import type { CodePracticeFeedback } from '../types/codePractice.types'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

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
    <aside className={cn('flex h-full flex-col border-l', wb.panel, wb.border)}>
      <div className={cn('flex items-center justify-between border-b px-4 py-3', wb.border)}>
        <div className={cn('flex items-center gap-2 text-sm font-semibold', wb.textPrimary)}>
          <Terminal className="h-4 w-4 text-sky-300" />
          Output
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {runtimeLabel && (
            <span className="text-xs text-emerald-400">Runtime: {runtimeLabel}</span>
          )}
          <span className={cn('text-xs', wb.textMuted)}>{formatDuration(lastRunMs)}</span>
        </div>
      </div>

      <div className={cn('flex-1 overflow-y-auto p-4 space-y-4 text-sm font-mono leading-relaxed', wb.textSecondary)}>
        {sampleInput && (
          <div>
            <p className={wb.sectionLabel}>Stdin for this run</p>
            <pre className={cn('whitespace-pre-wrap', wb.cardMono)}>
              {sampleInput}
            </pre>
          </div>
        )}

        {executionNote && (
          <p className="text-sm text-amber-300 font-sans">{executionNote}</p>
        )}

        {feedbackItems.length > 0 && (
          <div className="space-y-3">
            <p className={wb.sectionLabel}>Feedback</p>
            {feedbackItems.map((item, index) => (
              <div
                key={`${item.ruleId}-${item.lineNumber ?? index}`}
                className={cn(
                  'rounded-lg border p-3.5 font-sans text-sm',
                  item.severity === 'error' && 'border-red-800/70 bg-red-950/40 text-red-100',
                  item.severity === 'warning' && 'border-amber-800/60 bg-amber-950/30 text-amber-50',
                  item.severity === 'info' && 'border-sky-800/60 bg-sky-950/30 text-sky-50',
                )}
              >
                <div className="mb-1.5 flex items-center gap-1.5 font-medium">
                  <Lightbulb className="h-4 w-4 shrink-0 opacity-90" />
                  {item.title}
                  {item.lineNumber ? (
                    <span className={cn('text-xs font-normal', wb.textMuted)}>· line {item.lineNumber}</span>
                  ) : null}
                </div>
                <p className="leading-relaxed">{item.message}</p>
                {item.suggestion && (
                  <p className="mt-2 text-sm text-sky-200">Suggestion: {item.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800/70 bg-red-950/50 p-3.5 text-red-100">
            <div className="mb-1.5 flex items-center gap-1.5 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">Error</span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{error}</pre>
          </div>
        )}

        <div>
          <p className={wb.sectionLabel}>Stdout</p>
          <pre className={cn('whitespace-pre-wrap', wb.textPrimary)}>
            {output || <span className={wb.textMuted}>Run code to see output…</span>}
          </pre>
        </div>

        {consoleLines.length > 0 && (
          <div>
            <p className={wb.sectionLabel}>Console</p>
            <pre className={cn('whitespace-pre-wrap', wb.textSecondary)}>
              {consoleLines.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </aside>
  )
}
