import { Lightbulb } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'

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

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <Lightbulb className="h-4 w-4" />
          Hints ({revealedCount}/{hints.length})
        </span>
        {canRevealMore && (
          <button
            type="button"
            onClick={onRevealNext}
            className="text-sm text-sky-300 hover:text-sky-200"
          >
            Reveal next
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {hints.slice(0, revealedCount).map((hint, i) => (
          <li key={i} className={`rounded-lg border px-3.5 py-3 text-sm leading-relaxed ${wb.border} bg-[#111827] ${wb.textSecondary}`}>
            {hint}
          </li>
        ))}
        {revealedCount === 0 && (
          <li className={`text-sm ${wb.textMuted}`}>Click &quot;Reveal next&quot; when you need a nudge.</li>
        )}
      </ul>
    </div>
  )
}
