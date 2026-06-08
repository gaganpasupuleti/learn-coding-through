import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  JobSpyExperienceBand,
  JobSpyJobFilters,
  JobSpyLocation,
  JobSpyRole,
  JobSpySite,
} from '@/lib/jobspy-api'

interface JobSpyFiltersProps {
  filters: JobSpyJobFilters
  meta: {
    roles: JobSpyRole[]
    locations: JobSpyLocation[]
    bands: JobSpyExperienceBand[]
    sites: JobSpySite[]
  }
  loading: boolean
  onChange: (key: keyof JobSpyJobFilters | 'reset', value: string) => void
  onSearch: () => void
}

const selectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25'

export function JobSpyFilters({ filters, meta, loading, onChange, onSearch }: JobSpyFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Find your next role</h2>
        <p className="text-sm text-slate-500 mt-1">Search jobs across India — filter by role, city, company, and experience.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="jobspy-keyword" className="text-sm font-medium text-gray-700">Keyword</Label>
          <Input
            id="jobspy-keyword"
            value={filters.keyword ?? ''}
            onChange={(e) => onChange('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="rounded-lg border-gray-300"
            placeholder="e.g. React, Python"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobspy-company" className="text-sm font-medium text-gray-700">Company</Label>
          <Input
            id="jobspy-company"
            value={filters.company ?? ''}
            onChange={(e) => onChange('company', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="rounded-lg border-gray-300"
            placeholder="Company name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobspy-role" className="text-sm font-medium text-gray-700">Role category</Label>
          <select id="jobspy-role" className={selectClass} value={filters.role ?? ''} onChange={(e) => onChange('role', e.target.value)}>
            <option value="">All roles</option>
            {meta.roles.map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobspy-location" className="text-sm font-medium text-gray-700">City</Label>
          <select id="jobspy-location" className={selectClass} value={filters.location ?? ''} onChange={(e) => onChange('location', e.target.value)}>
            <option value="">All cities</option>
            {meta.locations.map((l) => (
              <option key={l.slug} value={l.slug}>{l.display_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobspy-experience" className="text-sm font-medium text-gray-700">Experience</Label>
          <select id="jobspy-experience" className={selectClass} value={filters.experience ?? ''} onChange={(e) => onChange('experience', e.target.value)}>
            <option value="">All levels</option>
            {meta.bands.map((b) => (
              <option key={b.slug} value={b.slug}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobspy-site" className="text-sm font-medium text-gray-700">Source</Label>
          <select id="jobspy-site" className={selectClass} value={filters.site ?? ''} onChange={(e) => onChange('site', e.target.value)}>
            <option value="">All sources</option>
            {meta.sites.length > 0
              ? meta.sites.map((s) => (
                <option key={s.slug} value={s.slug}>{s.label} ({s.active_count.toLocaleString('en-IN')})</option>
              ))
              : (
                <>
                  <option value="indeed">Indeed</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="naukri">Naukri</option>
                </>
              )}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={filters.is_remote === 'true'}
          onChange={(e) => onChange('is_remote', e.target.checked ? 'true' : '')}
          className="rounded border-gray-300"
        />
        Remote only
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Searching…' : 'Search jobs'}
        </Button>
        <Button type="button" variant="outline" onClick={() => onChange('reset', '')}>
          Clear filters
        </Button>
      </div>
    </div>
  )
}
