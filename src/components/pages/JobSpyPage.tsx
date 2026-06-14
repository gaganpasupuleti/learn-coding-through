import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobSpyApiStatusBadge } from '@/components/jobspy/JobSpyApiStatus'
import { JobSpyFilters } from '@/components/jobspy/JobSpyFilters'
import { JobSpyJobCard } from '@/components/jobspy/JobSpyJobCard'
import { JobSpyJobDetail } from '@/components/jobspy/JobSpyJobDetail'
import { useJobSpyJobs, type JobSpyTab } from '@/components/jobspy/useJobSpyJobs'
import { cn } from '@/lib/utils'

const TABS: { id: JobSpyTab; label: string }[] = [
  { id: 'browse', label: 'Browse' },
  { id: 'others', label: 'Others' },
  { id: 'saved', label: 'Saved' },
]

export function JobSpyPage() {
  const {
    apiStatus,
    meta,
    filters,
    tab,
    setTab,
    savedIds,
    displayJobs,
    total,
    loading,
    applying,
    applyNotice,
    setApplyNotice,
    error,
    setError,
    selectedJob,
    setSelectedJob,
    handleFilterChange,
    handleSearch,
    openJob,
    handleSave,
    handleUnsave,
    handleApply,
    fetchJobs,
    totalPages,
    setFilters,
  } = useJobSpyJobs()

  const showFilters = tab === 'browse' || tab === 'others'

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Spicy Jobs Board</h1>
            <p className="text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Curated and scraped job listings for practice, internships, and entry-level roles.
            </p>
          </div>
          <JobSpyApiStatusBadge status={apiStatus} />
        </header>

        {apiStatus === 'error' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 space-y-2">
            <p className="font-medium">Job service is currently offline.</p>
            <p>
              Listings come from the JobSpy API. If you are developing locally, start the JobSpy API on port{' '}
              <strong>8001</strong> (see <code className="text-xs bg-amber-100/80 px-1 rounded">docs/LAUNCH.md</code>), then refresh this page.
            </p>
            <p className="text-amber-800">
              Saved jobs and apply tracking also need the service. Please try again later if you are not running a local stack.
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
          <p className="text-sm text-slate-600 rounded-lg bg-slate-100 px-4 py-3">
            Jobs needing review: missing tags, uncertain role, or flagged mismatch. Fully tagged India jobs are under Browse.
          </p>
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
            <JobSpyFilters
              filters={filters}
              meta={meta}
              loading={loading}
              onChange={handleFilterChange}
              onSearch={handleSearch}
            />

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                {loading ? 'Loading…' : (
                  <>
                    <span className="font-semibold text-slate-900">{total.toLocaleString('en-IN')}</span> jobs found
                    {filters.role && meta.roles.find((r) => r.slug === filters.role) && (
                      <> in <span className="font-medium">{meta.roles.find((r) => r.slug === filters.role)!.name}</span></>
                    )}
                  </>
                )}
              </p>
              {tab === 'browse' && (
                <span className="text-xs text-slate-500">Fully tagged: India + role + experience level</span>
              )}
            </div>
          </>
        )}

        {apiStatus === 'error' && tab !== 'saved' ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center px-6">
            <p className="font-medium text-slate-800">No listings available right now</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              The Spicy Jobs board needs the JobSpy API. Start it on port 8001 for local development, or check back later.
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
                  ? 'All scraped jobs are fully tagged, or run a scrape from JobSpy Ops.'
                  : 'Try different filters or ask an admin to run a scrape.'}
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
                void fetchJobs(next, tab === 'others' ? 'others' : 'tagged')
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
                void fetchJobs(next, tab === 'others' ? 'others' : 'tagged')
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
          CodeQuest Job Board · Spicy Jobs · Apply via original job posting
        </p>
      </div>
    </div>
  )
}
