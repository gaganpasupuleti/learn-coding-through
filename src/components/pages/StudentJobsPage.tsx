import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { applyToJob, fetchOpenJobs, type StudentJobOpen } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type JobsLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; jobs: StudentJobOpen[] }

type JobsSortKey = 'newest' | 'company' | 'title'

function metaStr(meta: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const v = meta?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function useStudentJobsDashboard() {
  const [state, setState] = useState<JobsLoadState>({ status: 'idle' })
  const [applyBusyId, setApplyBusyId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<JobsSortKey>('newest')

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const list = await fetchOpenJobs()
      setState({ status: 'ready', jobs: list })
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'We could not reach the jobs service. Check your connection or try again in a moment.'
      setState({ status: 'error', message })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const jobs = state.status === 'ready' ? state.jobs : []

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()

    const postedTime = (job: StudentJobOpen) => {
      const raw = metaStr(job.listing_metadata, 'postedAt')
      const fromMeta = raw ? Date.parse(raw) : NaN
      if (!Number.isNaN(fromMeta)) return fromMeta
      return new Date(job.created_at).getTime()
    }

    let list = jobs.filter((job) => {
      if (!q) return true
      const meta = job.listing_metadata ?? undefined
      const industries = metaStr(meta, 'industries') ?? ''
      const fn = metaStr(meta, 'jobFunction') ?? ''
      const hay = `${job.title} ${job.company_name} ${job.location} ${job.employment_type} ${industries} ${fn}`.toLowerCase()
      return hay.includes(q)
    })

    list = [...list].sort((a, b) => {
      if (sortKey === 'company') return a.company_name.localeCompare(b.company_name)
      if (sortKey === 'title') return a.title.localeCompare(b.title)
      return postedTime(b) - postedTime(a)
    })

    return list
  }, [jobs, query, sortKey])

  const handleApply = async (jobId: number) => {
    setApplyBusyId(jobId)
    try {
      const result = await applyToJob(jobId)
      toast.success(result.message || 'Applied')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Apply failed')
    } finally {
      setApplyBusyId(null)
    }
  }

  return {
    state,
    jobs,
    filteredSorted,
    query,
    setQuery,
    sortKey,
    setSortKey,
    applyBusyId,
    handleApply,
    reload: load,
  }
}

interface JobsPaneProps {
  state: JobsLoadState
  filteredJobs: StudentJobOpen[]
  allJobsCount: number
  query: string
  setQuery: (value: string) => void
  sortKey: JobsSortKey
  setSortKey: (value: JobsSortKey) => void
  applyBusyId: number | null
  onApply: (jobId: number) => void
  onReload: () => void
}

function JobsPane({
  state,
  filteredJobs,
  allJobsCount,
  query,
  setQuery,
  sortKey,
  setSortKey,
  applyBusyId,
  onApply,
  onReload,
}: JobsPaneProps) {
  const loading = state.status === 'idle' || state.status === 'loading'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <Card className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              <Sparkles className="h-3 w-3 text-blue-600" aria-hidden />
              Job pipeline
            </div>
            <p className="text-[13px] text-slate-600">
              Open listings from your program, with quick filters and apply actions.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-full border-slate-200 bg-white px-3 text-xs text-slate-700"
            onClick={() => onReload()}
            disabled={loading}
          >
            <Loader2 className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            Refresh
          </Button>
        </div>
      </Card>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {state.status === 'error' ? (
          <Card className="shrink-0 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[13px] text-amber-900 shadow-sm">
            <p className="font-semibold">Couldn&apos;t load jobs</p>
            <p className="mt-1 text-[12px] leading-snug">{state.message}</p>
          </Card>
        ) : null}

        <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
          <Card className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 space-y-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, company, location…"
                  className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[13px] outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Search jobs"
                />
                {state.status === 'ready' && (
                  <p className="text-[11px] text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{filteredJobs.length}</span> of{' '}
                    {allJobsCount} roles
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                {(['newest', 'company', 'title'] as JobsSortKey[]).map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant={sortKey === key ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 text-[11px] ${
                      sortKey === key ? 'bg-slate-900 text-white' : 'border-slate-200 bg-white'
                    }`}
                    onClick={() => setSortKey(key)}
                  >
                    {key === 'newest' ? 'Newest' : key === 'company' ? 'Company' : 'Title'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-500 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading jobs…
              </div>
            ) : null}

            {state.status === 'ready' && filteredJobs.length === 0 && allJobsCount === 0 ? (
              <Card className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-[13px] text-slate-600 shadow-sm">
                <p>No openings yet. When admins publish roles, they&apos;ll appear here automatically.</p>
              </Card>
            ) : null}

            {state.status === 'ready' &&
              filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{job.title}</h3>
                      <p className="truncate text-[12px] text-slate-600">
                        {job.company_name} · {job.location} · {job.employment_type}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-6 rounded-full border-slate-200 px-2 text-[11px]">
                      {metaStr(job.listing_metadata ?? undefined, 'seniorityLevel') ?? 'Any level'}
                    </Badge>
                  </div>
                  {job.description && (
                    <p className="line-clamp-3 text-[12px] leading-snug text-slate-600">{job.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {job.eligible_batch_name && (
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-[11px]">
                        Eligible batch: {job.eligible_batch_name}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    {job.external_apply_url ? (
                      <a
                        href={job.external_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        View listing
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1 rounded-lg bg-blue-600 px-3 text-[12px] font-semibold text-white hover:bg-blue-700"
                      onClick={() => onApply(job.id)}
                      disabled={applyBusyId === job.id}
                    >
                      {applyBusyId === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                      {job.external_apply_url ? 'Log interest' : 'Apply'}
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentJobsPage() {
  const {
    state: jobsState,
    jobs,
    filteredSorted,
    query,
    setQuery,
    sortKey,
    setSortKey,
    applyBusyId,
    handleApply,
    reload: reloadJobs,
  } = useStudentJobsDashboard()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/80">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 px-4 pb-4 pt-3 md:px-6 md:pb-5">
        <header className="shrink-0 space-y-1 rounded-3xl bg-gradient-to-r from-slate-50 via-indigo-50/80 to-slate-50 px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Jobs</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Open roles</h1>
          <p className="text-[13px] text-slate-600">Browse and apply to listings from your program.</p>
        </header>

        <JobsPane
          state={jobsState}
          filteredJobs={filteredSorted}
          allJobsCount={jobs.length}
          query={query}
          setQuery={setQuery}
          sortKey={sortKey}
          setSortKey={setSortKey}
          applyBusyId={applyBusyId}
          onApply={handleApply}
          onReload={reloadJobs}
        />
      </div>
    </div>
  )
}
