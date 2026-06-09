import { Database, Play, RotateCcw } from 'lucide-react'

interface SqlToolbarProps {
  dataset: string
  topic: string
  difficulty: string
  onDatasetChange: (value: string) => void
  onTopicChange: (value: string) => void
  onDifficultyChange: (value: string) => void
}

const SELECT_CLASS = 'rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-200'

export function SqlToolbar({
  dataset,
  topic,
  difficulty,
  onDatasetChange,
  onTopicChange,
  onDifficultyChange,
}: SqlToolbarProps) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
        <Database className="h-4 w-4" />
        SQL Practice Ground
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-400">
          Dataset
          <select
            value={dataset}
            onChange={(e) => onDatasetChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="sample-hr">Sample HR (placeholder)</option>
            <option value="sample-sales">Sample Sales (placeholder)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-slate-400">
          Topic
          <select
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="select">SELECT basics</option>
            <option value="joins">JOINs</option>
            <option value="aggregates">Aggregates</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-slate-400">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className={SELECT_CLASS}
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
          className="inline-flex items-center gap-2 rounded bg-emerald-700/40 px-3.5 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          Run Query
        </button>
        <button
          type="button"
          disabled
          title="Reset coming soon"
          className="inline-flex items-center gap-2 rounded border border-slate-700 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </header>
  )
}
