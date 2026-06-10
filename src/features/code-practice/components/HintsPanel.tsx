import { ChevronRight, Lightbulb } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface HintsPanelProps {
  hints: string[]
  revealedCount: number
  onRevealNext: () => void
}

export function HintsPanel({ hints, revealedCount, onRevealNext }: HintsPanelProps) {
  if (hints.length === 0) {
    return <div className={`p-4 text-sm ${wb.textMuted}`}>No hints for this question.</div>
  }

  const canRevealMore = revealedCount < hints.length
  const nextHintNumber = revealedCount + 1

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Lightbulb className="h-4 w-4" />
            Hints
          </span>
          <p className={cn('mt-1 text-xs', wb.textMuted)}>
            {revealedCount === 0
              ? `Hint 1 of ${hints.length} — reveal when you need a nudge`
              : `Showing ${revealedCount} of ${hints.length}`}
          </p>
        </div>
        {canRevealMore && (
          <button
            type="button"
            onClick={onRevealNext}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
          >
            Reveal next hint
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">(Hint {nextHintNumber} of {hints.length})</span>
          </button>
        )}
      </div>
      <ul className="space-y-2.5">
        {hints.slice(0, revealedCount).map((hint, i) => (
          <li
            key={i}
            className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${wb.border} bg-[#111827] ${wb.textSecondary}`}
          >
            <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>
              Hint {i + 1} of {hints.length}
            </span>
            {hint}
          </li>
        ))}
        {revealedCount === 0 && (
          <li className={`rounded-lg border border-dashed px-4 py-3 text-sm ${wb.border} ${wb.textMuted}`}>
            Hints stay hidden until you click &quot;Reveal next hint&quot;. The full solution is never shown automatically.
          </li>
        )}
      </ul>
    </div>
  )
}
