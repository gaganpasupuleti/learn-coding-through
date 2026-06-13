import type { SqlPracticeDifficulty, SqlPracticeTopic, SqlQuestionFilterStatus } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlQuestionFiltersProps {
  statusFilter: SqlQuestionFilterStatus
  difficultyFilter: SqlPracticeDifficulty | 'all'
  topicFilter: SqlPracticeTopic | 'all'
  onStatusFilterChange: (value: SqlQuestionFilterStatus) => void
  onDifficultyFilterChange: (value: SqlPracticeDifficulty | 'all') => void
  onTopicFilterChange: (value: SqlPracticeTopic | 'all') => void
}

const STATUS_OPTIONS: Array<{ value: SqlQuestionFilterStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not Attempted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'passed', label: 'Passed' },
  { value: 'needs_review', label: 'Failed' },
  { value: 'mistakes_only', label: 'Mistakes Only' },
]

const DIFFICULTY_OPTIONS: Array<{ value: SqlPracticeDifficulty | 'all'; label: string }> = [
  { value: 'all', label: 'All levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const TOPIC_OPTIONS: Array<{ value: SqlPracticeTopic | 'all'; label: string }> = [
  { value: 'all', label: 'All topics' },
  { value: 'select', label: 'SELECT' },
  { value: 'filtering', label: 'WHERE' },
  { value: 'joins', label: 'JOIN' },
  { value: 'aggregates', label: 'Aggregates' },
  { value: 'subqueries', label: 'Subqueries' },
]

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="min-w-0 flex-1">
      <label className={cn('mb-0.5 block text-[10px] font-bold uppercase tracking-widest', wb.textMuted)}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn('w-full rounded-md border bg-[#111827] px-2 py-1.5 text-xs', wb.border, wb.textPrimary)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SqlQuestionFilters({
  statusFilter,
  difficultyFilter,
  topicFilter,
  onStatusFilterChange,
  onDifficultyFilterChange,
  onTopicFilterChange,
}: SqlQuestionFiltersProps) {
  return (
    <div className="space-y-2">
      <p className={cn('text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Filters</p>
      <div className="flex flex-wrap gap-2">
        <FilterSelect label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={onStatusFilterChange} />
        <FilterSelect
          label="Difficulty"
          value={difficultyFilter}
          options={DIFFICULTY_OPTIONS}
          onChange={onDifficultyFilterChange}
        />
        <FilterSelect label="Topic" value={topicFilter} options={TOPIC_OPTIONS} onChange={onTopicFilterChange} />
      </div>
    </div>
  )
}
