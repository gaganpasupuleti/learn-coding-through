import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobSpyApiStatusBadge } from '@/components/jobspy/JobSpyApiStatus'
import { JobSpyFilters } from '@/components/jobspy/JobSpyFilters'
import { JobSpyJobCard } from '@/components/jobspy/JobSpyJobCard'
import { JobSpyJobDetail } from '@/components/jobspy/JobSpyJobDetail'
import { useJobSpyJobs } from '@/components/jobspy/useJobSpyJobs'
import { cn } from '@/lib/utils'

export function JobSpyPage() {
  const {
    apiStatus,
    meta,
    filters,
    tab,
    setTab,
    jobs,
    total,
    loading,
    error,
    setError,
    selectedJob,
    setSelectedJob,
    handleFilterChange,
    handleSearch,
    openJob,
    fetchJobs,
    totalPages,
    setFilters,
  } = useJobSpyJobs()

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Board</h1>
            <p className="text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Live roles scraped from LinkedIn, Indeed, and more — powered by JobSpy.
            </p>
          </div>
          <JobSpyApiStatusBadge status={apiStatus} />
        </header>

        {apiStatus === 'error' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            JobSpy backend not reachable. Start the JobSpy API on port <strong>8001</strong>, then refresh.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex justify-between gap-3">
            <span>{error}</span>
            <button type="button" className="text-red-600 hover:underline shrink-0" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="flex gap-2 border-b border-slate-200">
          {(['browse', 'others'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              {t === 'browse' ? 'Browse' : 'Others'}
            </button>
          ))}
        </div>

        {tab === 'others' && (
          <p className="text-sm text-slate-600 rounded-lg bg-slate-100 px-4 py-3">
            Jobs needing review: missing tags, uncertain role, or flagged mismatch. Fully tagged India jobs are under Browse.
          </p>
        )}

        {(tab === 'browse' || tab === 'others') && (
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

            {loading && jobs.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading jobs…
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center px-6">
                <p className="font-medium text-slate-800">
                  {tab === 'others' ? 'No jobs in Others' : 'No jobs found'}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {tab === 'others'
                    ? 'All scraped jobs are fully tagged, or run a scrape from JobSpy Ops.'
                    : 'Try different filters or ask an admin to run a scrape.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobSpyJobCard key={job.id} job={job} onSelect={openJob} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
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
          </>
        )}

        {selectedJob && (
          <JobSpyJobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}

        <p className="text-center text-xs text-slate-400 pt-4">
          CodeQuest Job Board · Powered by JobSpy · Apply via original job posting
        </p>
      </div>
    </div>
  )
}
