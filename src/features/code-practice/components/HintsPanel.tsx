import { Lightbulb } from 'lucide-react'

interface HintsPanelProps {
  hints: string[]
  revealedCount: number
  onRevealNext: () => void
}

export function HintsPanel({ hints, revealedCount, onRevealNext }: HintsPanelProps) {
  if (hints.length === 0) {
    return <div className="p-4 text-sm text-slate-500">No hints for this question.</div>
  }

  const canRevealMore = revealedCount < hints.length

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-amber-400/90">
          <Lightbulb className="h-4 w-4" />
          Hints ({revealedCount}/{hints.length})
        </span>
        {canRevealMore && (
          <button
            type="button"
            onClick={onRevealNext}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Reveal next
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {hints.slice(0, revealedCount).map((hint, i) => (
          <li key={i} className="rounded border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
            {hint}
          </li>
        ))}
        {revealedCount === 0 && (
          <li className="text-sm text-slate-500">Click &quot;Reveal next&quot; when you need a nudge.</li>
        )}
      </ul>
    </div>
  )
}
