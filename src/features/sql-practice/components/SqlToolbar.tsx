import { Database, Play, RotateCcw } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlToolbarProps {
  dataset: string
  topic: string
  difficulty: string
  onDatasetChange: (value: string) => void
  onTopicChange: (value: string) => void
  onDifficultyChange: (value: string) => void
}

const SELECT_CLASS =
  'rounded-md border border-[#26324A] bg-[#111827] px-3 py-2 text-sm text-[#E5E7EB]'

export function SqlToolbar({
  dataset,
  topic,
  difficulty,
  onDatasetChange,
  onTopicChange,
  onDifficultyChange,
}: SqlToolbarProps) {
  return (
    <header className={cn('flex flex-wrap items-center gap-4 border-b px-4 py-3.5', wb.panelHeader, wb.border)}>
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-300">
        <Database className="h-4 w-4" />
        SQL Practice Ground
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className={cn('flex items-center gap-2', wb.textSecondary)}>
          Dataset
          <select value={dataset} onChange={(e) => onDatasetChange(e.target.value)} className={SELECT_CLASS}>
            <option value="sample-hr">Sample HR (placeholder)</option>
            <option value="sample-sales">Sample Sales (placeholder)</option>
          </select>
        </label>
        <label className={cn('flex items-center gap-2', wb.textSecondary)}>
          Topic
          <select value={topic} onChange={(e) => onTopicChange(e.target.value)} className={SELECT_CLASS}>
            <option value="select">SELECT basics</option>
            <option value="joins">JOINs</option>
            <option value="aggregates">Aggregates</option>
          </select>
        </label>
        <label className={cn('flex items-center gap-2', wb.textSecondary)}>
          Difficulty
          <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} className={SELECT_CLASS}>
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
          className="inline-flex items-center gap-2 rounded-md bg-emerald-800/40 px-4 py-2.5 text-sm font-medium text-[#94A3B8] cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          Run Query
        </button>
        <button
          type="button"
          disabled
          title="Reset coming soon"
          className={cn('inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm cursor-not-allowed', wb.border, wb.textMuted)}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </header>
  )
}
