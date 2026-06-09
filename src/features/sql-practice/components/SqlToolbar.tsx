import { Database, Play, RotateCcw } from 'lucide-react'

interface SqlToolbarProps {
  dataset: string
  topic: string
  difficulty: string
  onDatasetChange: (value: string) => void
  onTopicChange: (value: string) => void
  onDifficultyChange: (value: string) => void
}

export function SqlToolbar({
  dataset,
  topic,
  difficulty,
  onDatasetChange,
  onTopicChange,
  onDifficultyChange,
}: SqlToolbarProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
        <Database className="h-4 w-4" />
        SQL Practice Ground
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="flex items-center gap-1.5 text-slate-500">
          Dataset
          <select
            value={dataset}
            onChange={(e) => onDatasetChange(e.target.value)}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
          >
            <option value="sample-hr">Sample HR (placeholder)</option>
            <option value="sample-sales">Sample Sales (placeholder)</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-slate-500">
          Topic
          <select
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
          >
            <option value="select">SELECT basics</option>
            <option value="joins">JOINs</option>
            <option value="aggregates">Aggregates</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-slate-500">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          disabled
          title="Query execution coming in Issue #30"
          className="inline-flex items-center gap-1.5 rounded bg-emerald-700/40 px-3 py-1.5 text-xs font-medium text-slate-500 cursor-not-allowed"
        >
          <Play className="h-3.5 w-3.5" />
          Run Query
        </button>
        <button
          type="button"
          disabled
          title="Reset coming soon"
          className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-500 cursor-not-allowed"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </header>
  )
}
