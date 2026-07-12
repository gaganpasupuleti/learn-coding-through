import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobSpyOverviewPanel } from '@/components/jobspy/JobSpyOverviewPanel'
import { JobSpyApiStatusBadge } from '@/components/jobspy/JobSpyApiStatus'
import { JobSpyFilters } from '@/components/jobspy/JobSpyFilters'
import { JobSpyJobCard } from '@/components/jobspy/JobSpyJobCard'
import { JobSpyJobDetail } from '@/components/jobspy/JobSpyJobDetail'
import { useJobSpyJobs, type JobSpyTab } from '@/components/jobspy/useJobSpyJobs'
import { cn } from '@/lib/utils'
import { jobSpySiteLabel } from '@/lib/jobspy-api'

const TABS: { id: JobSpyTab; label: string }[] = [
  { id: 'browse', label: 'Browse' },
  { id: 'others', label: 'Others' },
  { id: 'saved', label: 'Saved' },
]

export function JobSpyPage() {
  const {
    apiStatus,
    filters,
    tab,
    setTab,
    savedIds,
    displayJobs,
    total,
    overview,
    overviewLoading,
    loading,
    applying,
    applyNotice,
    setApplyNotice,
    error,
    setError,
    selectedJob,
    setSelectedJob,
    handleFilterChange,
    handleSourceSelect,
    handleSearch,
    openJob,
    handleSave,
    handleUnsave,
    handleApply,
    fetchJobs,
    totalPages,
    setFilters,
  } = useJobSpyJobs()

  const showFilters = tab === 'browse'

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Code Quest Job Alerts</h1>
            <p className="text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Browse India-based jobs loaded for Code Quest students — internships, fresher, and entry-level roles.
            </p>
          </div>
          <JobSpyApiStatusBadge status={apiStatus} />
        </header>

        {apiStatus === 'error' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 space-y-2">
            <p className="font-medium">Job service is currently offline.</p>
            <p>
              The job listing service is temporarily unavailable. Please check back shortly or contact support.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex justify-between gap-3">
            <span>{error}</span>
            <button type="button" className="text-red-600 hover:underline shrink-0" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {applyNotice && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex justify-between gap-3">
            <span>{applyNotice}</span>
            <button type="button" className="text-blue-700 hover:underline shrink-0" onClick={() => setApplyNotice(null)}>Dismiss</button>
          </div>
        )}

        <div className="flex gap-2 border-b border-slate-200">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              {label}
              {id === 'saved' && savedIds.length > 0 && (
                <span className="ml-1.5 text-xs text-slate-500">({savedIds.length})</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'others' && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center px-6">
            <p className="font-medium text-slate-800">Coming soon</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Curated and specialty job lists will appear here. All current India jobs are available under{' '}
              <span className="font-medium">Browse</span>.
            </p>
          </div>
        )}

        {tab === 'saved' && (
          <p className="text-sm text-slate-600 rounded-lg bg-slate-100 px-4 py-3">
            {apiStatus === 'error'
              ? 'Saved job IDs are stored on this device, but details cannot load while the job service is offline.'
              : `Jobs you bookmarked on this device (${savedIds.length}).`}
          </p>
        )}

        {showFilters && apiStatus === 'ok' && (
          <>
            <JobSpyOverviewPanel
              overview={overview}
              loading={overviewLoading}
              selectedSource={filters.site ?? ''}
              onSelectSource={handleSourceSelect}
            />

            <JobSpyFilters
              filters={filters}
              loading={loading}
              onChange={handleFilterChange}
              onSearch={handleSearch}
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                {loading ? (
                  'Loading…'
                ) : (
                  <>
                    <span>
                      <span className="font-semibold text-slate-900">{total.toLocaleString('en-IN')}</span> jobs
                      {filters.site ? ` from ${jobSpySiteLabel(filters.site)}` : ' matching filters'}
                    </span>
                    {filters.site && (
                      <button
                        type="button"
                        className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 hover:bg-blue-100"
                        onClick={() => handleSourceSelect('')}
                      >
                        {jobSpySiteLabel(filters.site)} ×
                      </button>
                    )}
                  </>
                )}
              </div>
              <span className="text-xs text-slate-500">India only</span>
            </div>
          </>
        )}

        {apiStatus === 'error' && tab !== 'saved' ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center px-6">
            <p className="font-medium text-slate-800">No listings available right now</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Job listings are temporarily unavailable. Please try again later or adjust your filters.
            </p>
          </div>
        ) : loading && displayJobs.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading jobs…
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center px-6">
            <p className="font-medium text-slate-800">
              {tab === 'saved'
                ? 'No saved jobs yet'
                : tab === 'others'
                  ? 'No jobs in Others'
                  : 'No jobs found'}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {tab === 'saved'
                ? 'Tap the star on any job card to bookmark it here.'
                : tab === 'others'
                  ? 'Nothing here yet.'
                  : 'No jobs match these filters. Try clearing filters or a different keyword.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayJobs.map((job) => (
              <JobSpyJobCard
                key={job.id}
                job={job}
                saved={savedIds.includes(job.id)}
                onSelect={openJob}
                onSave={handleSave}
                onUnsave={handleUnsave}
              />
            ))}
          </div>
        )}

        {showFilters && totalPages > 1 && apiStatus === 'ok' && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={filters.page === 1 || loading}
              onClick={() => {
                const next = { ...filters, page: (filters.page ?? 1) - 1 }
                setFilters(next)
                void fetchJobs(next)
              }}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={(filters.page ?? 1) >= totalPages || loading}
              onClick={() => {
                const next = { ...filters, page: (filters.page ?? 1) + 1 }
                setFilters(next)
                void fetchJobs(next)
              }}
            >
              Next
            </Button>
          </div>
        )}

        {selectedJob && (
          <JobSpyJobDetail
            job={selectedJob}
            saved={savedIds.includes(selectedJob.id)}
            applying={applying}
            onClose={() => setSelectedJob(null)}
            onApply={() => void handleApply(selectedJob)}
            onSave={handleSave}
            onUnsave={handleUnsave}
          />
        )}

        <p className="text-center text-xs text-slate-400 pt-4">
          CodeQuest Job Board · Jobs updated daily · Apply via original posting
        </p>
      </div>
    </div>
  )
}
