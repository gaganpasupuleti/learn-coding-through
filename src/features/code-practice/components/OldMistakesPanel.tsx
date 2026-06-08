import { listPracticeMistakes, type PracticeMistake } from '@/lib/practice-mistakes'
import { isIssue29MistakeLanguage } from '../utils/mistakeClassifier'

interface OldMistakesPanelProps {
  refreshKey: number
}

export function OldMistakesPanel({ refreshKey }: OldMistakesPanelProps) {
  const mistakes: PracticeMistake[] = listPracticeMistakes()
    .filter((m) => isIssue29MistakeLanguage(m.language))
    .slice(0, 8)

  if (mistakes.length === 0) {
    return (
      <div className="p-3 text-xs text-slate-500">
        No code mistakes logged yet. Failed runs from the legacy practice hub appear here (SQL excluded — Issue #30).
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-800" key={refreshKey}>
      {mistakes.map((m) => (
        <div key={m.id} className="px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">{m.language}</span>
            <span className="text-slate-600">{new Date(m.createdAt).toLocaleString()}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-slate-400">{m.message}</p>
        </div>
      ))}
    </div>
  )
}
