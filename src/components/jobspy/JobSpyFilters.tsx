import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  JOBSPY_EXPERIENCE_OPTIONS,
  JOBSPY_SOURCE_OPTIONS,
  type JobSpyJobFilters,
} from '@/lib/jobspy-api'

interface JobSpyFiltersProps {
  filters: JobSpyJobFilters
  loading: boolean
  onChange: (key: keyof JobSpyJobFilters | 'reset', value: string) => void
  onSearch: () => void
}

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25'

const labelClass = 'text-sm font-medium text-slate-700'

export function JobSpyFilters({ filters, loading, onChange, onSearch }: JobSpyFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.keyword || filters.company || filters.location || filters.experience || filters.site,
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Find your next role</h2>
        <p className="text-sm text-slate-500 mt-1">
          Browse India-based jobs loaded for Code Quest students.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cq-jobs-keyword" className={labelClass}>Keyword</Label>
          <Input
            id="cq-jobs-keyword"
            value={filters.keyword ?? ''}
            onChange={(e) => onChange('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="rounded-lg border-slate-300"
            placeholder="e.g. React, Python"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cq-jobs-company" className={labelClass}>Company</Label>
          <Input
            id="cq-jobs-company"
            value={filters.company ?? ''}
            onChange={(e) => onChange('company', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="rounded-lg border-slate-300"
            placeholder="Company name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cq-jobs-location" className={labelClass}>City / location</Label>
          <Input
            id="cq-jobs-location"
            value={filters.location ?? ''}
            onChange={(e) => onChange('location', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="rounded-lg border-slate-300"
            placeholder="e.g. Bengaluru, Pune, KA"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cq-jobs-experience" className={labelClass}>Experience</Label>
          <select
            id="cq-jobs-experience"
            className={selectClass}
            value={filters.experience ?? ''}
            onChange={(e) => onChange('experience', e.target.value)}
          >
            {JOBSPY_EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cq-jobs-source" className={labelClass}>Source</Label>
          <select
            id="cq-jobs-source"
            className={selectClass}
            value={filters.site ?? ''}
            onChange={(e) => onChange('site', e.target.value)}
          >
            {JOBSPY_SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            {loading ? 'Searching…' : 'Search jobs'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange('reset', '')}
            disabled={loading || !hasActiveFilters}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
