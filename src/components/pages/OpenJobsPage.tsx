import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Briefcase,
  Building2,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  WifiOff,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { applyToJob, fetchOpenJobs, type StudentJobOpen } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'

function metaStr(meta: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const v = meta?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function companyInitial(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  return t[0]!.toUpperCase()
}

type SortKey = 'newest' | 'company' | 'title'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; jobs: StudentJobOpen[] }

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-sm animate-pulse">
      <div className="flex gap-4">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 max-w-md rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-100" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-slate-100" />
            <div className="h-6 w-24 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <div className="h-9 w-28 rounded-lg bg-slate-100" />
        <div className="h-9 w-32 rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}

export function OpenJobsPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [applyBusyId, setApplyBusyId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [empFilter, setEmpFilter] = useState<string | null>(null)
  const [seniorityFilter, setSeniorityFilter] = useState<string | null>(null)

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

  const employmentOptions = useMemo(() => {
    const set = new Set<string>()
    for (const j of jobs) {
      if (j.employment_type?.trim()) set.add(j.employment_type.trim())
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [jobs])

  const seniorityOptions = useMemo(() => {
    const set = new Set<string>()
    for (const j of jobs) {
      const s = metaStr(j.listing_metadata, 'seniorityLevel')
      if (s) set.add(s)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [jobs])

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = jobs.filter((job) => {
      if (empFilter && job.employment_type.trim() !== empFilter) return false
      const sen = metaStr(job.listing_metadata, 'seniorityLevel')
      if (seniorityFilter && sen !== seniorityFilter) return false
      if (!q) return true
      const meta = job.listing_metadata ?? undefined
      const industries = metaStr(meta, 'industries') ?? ''
      const fn = metaStr(meta, 'jobFunction') ?? ''
      const hay = `${job.title} ${job.company_name} ${job.location} ${job.employment_type} ${industries} ${fn}`.toLowerCase()
      return hay.includes(q)
    })

    const postedTime = (job: StudentJobOpen) => {
      const raw = metaStr(job.listing_metadata, 'postedAt')
      const fromMeta = raw ? Date.parse(raw) : NaN
      if (!Number.isNaN(fromMeta)) return fromMeta
      return new Date(job.created_at).getTime()
    }

    list = [...list].sort((a, b) => {
      if (sortKey === 'company') return a.company_name.localeCompare(b.company_name)
      if (sortKey === 'title') return a.title.localeCompare(b.title)
      return postedTime(b) - postedTime(a)
    })
    return list
  }, [jobs, query, sortKey, empFilter, seniorityFilter])

  const activeFilters = (empFilter ? 1 : 0) + (seniorityFilter ? 1 : 0) + (query.trim() ? 1 : 0)

  const clearFilters = () => {
    setQuery('')
    setEmpFilter(null)
    setSeniorityFilter(null)
  }

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

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.35]" aria-hidden>
        <div
          className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-3xl"
        />
        <div
          className="absolute -right-20 top-40 h-[380px] w-[380px] rounded-full bg-violet-400/15 blur-3xl"
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        <header className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-blue-800 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                Career portal
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                  Find your next role
                </h1>
                <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-xl">
                  Open listings from your program. Review details, jump to the original post when linked, and log
                  interest so mentors can support your applications.
                </p>
              </div>
              {state.status === 'ready' && jobs.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                    <Briefcase className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                    {jobs.length} {jobs.length === 1 ? 'role' : 'roles'} open
                  </span>
                  {activeFilters > 0 ? (
                    <span className="text-slate-500">
                      Showing <strong className="text-slate-800">{filteredSorted.length}</strong> of {jobs.length}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 h-10 border-slate-200 bg-white/90 shadow-sm hover:bg-white"
              onClick={() => void load()}
              disabled={state.status === 'loading'}
            >
              <RefreshCw className={`h-4 w-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {state.status === 'loading' ? (
          <div className="space-y-4" aria-busy aria-label="Loading jobs">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-white px-5 py-6 md:px-8 md:py-8 shadow-md shadow-amber-900/5 ring-1 ring-amber-900/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <WifiOff className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Couldn&apos;t load jobs</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{state.message}</p>
                <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1 pt-1">
                  <li>Confirm the backend is running if you&apos;re on localhost.</li>
                  <li>Check that you&apos;re signed in (jobs require an account).</li>
                  <li>If this persists, ask an admin to verify the API URL in your environment.</li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-3">
                  <Button type="button" onClick={() => void load()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {state.status === 'ready' && jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white px-6 py-14 md:py-16 text-center shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/60">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Building2 className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">No openings yet</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your team hasn&apos;t published roles on the board. When admins add jobs (including from a LinkedIn export),
              they will show up here automatically.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-8 border-slate-200"
              onClick={() => void load()}
            >
              Check again
            </Button>
          </div>
        ) : null}

        {state.status === 'ready' && jobs.length > 0 ? (
          <>
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 md:p-5 shadow-md shadow-slate-200/30 backdrop-blur-sm ring-1 ring-slate-200/50 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, company, location, industry…"
                    className="h-11 pl-10 border-slate-200 bg-slate-50/80 focus-visible:bg-white"
                    aria-label="Search jobs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400 hidden sm:inline">
                    Sort
                  </span>
                  {(
                    [
                      ['newest', 'Newest'] as const,
                      ['company', 'Company'] as const,
                      ['title', 'Title'] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={sortKey === key ? 'default' : 'outline'}
                      size="sm"
                      className={
                        sortKey === key
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                          : 'border-slate-200 bg-white'
                      }
                      onClick={() => setSortKey(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {(employmentOptions.length > 1 || seniorityOptions.length > 1) ? (
                <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Filter className="h-3.5 w-3.5" aria-hidden />
                    Refine
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {employmentOptions.length > 1 ? (
                      <>
                        <span className="text-xs text-slate-500 self-center mr-1 w-full sm:w-auto">Type</span>
                        <Button
                          type="button"
                          variant={empFilter === null ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 rounded-full text-xs"
                          onClick={() => setEmpFilter(null)}
                        >
                          All types
                        </Button>
                        {employmentOptions.map((emp) => (
                          <Button
                            key={emp}
                            type="button"
                            variant={empFilter === emp ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={() => setEmpFilter(empFilter === emp ? null : emp)}
                          >
                            {emp}
                          </Button>
                        ))}
                      </>
                    ) : null}
                  </div>
                  {seniorityOptions.length > 1 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-slate-500 mr-1 w-full sm:w-auto">Level</span>
                      <Button
                        type="button"
                        variant={seniorityFilter === null ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 rounded-full text-xs"
                        onClick={() => setSeniorityFilter(null)}
                      >
                        All levels
                      </Button>
                      {seniorityOptions.map((s) => (
                        <Button
                          key={s}
                          type="button"
                          variant={seniorityFilter === s ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 rounded-full text-xs max-w-[200px] truncate"
                          onClick={() => setSeniorityFilter(seniorityFilter === s ? null : s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  {activeFilters > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-slate-600 gap-1"
                      onClick={clearFilters}
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear filters
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {filteredSorted.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" aria-hidden />
                <p className="mt-4 text-slate-700 font-medium">No roles match your filters</p>
                <p className="text-sm text-slate-500 mt-1">Try clearing search or filters.</p>
                <Button type="button" variant="outline" className="mt-6" onClick={clearFilters}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredSorted.map((job) => {
                  const meta = job.listing_metadata ?? undefined
                  const seniority = metaStr(meta, 'seniorityLevel')
                  const applicants = metaStr(meta, 'applicantCount')
                  const industries = metaStr(meta, 'industries')
                  const jobFn = metaStr(meta, 'jobFunction')
                  const postedScrape = metaStr(meta, 'postedAt')
                  const applyUrl = job.external_apply_url?.trim() || undefined
                  const postedLabel = postedScrape
                    ? postedScrape
                    : new Date(job.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })

                  return (
                    <li key={job.id}>
                      <article className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/25 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-300/90 ring-1 ring-black/[0.02]">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-violet-500 opacity-90" aria-hidden />
                        <div className="pl-1">
                          <div className="p-5 md:p-6 md:pl-7">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
                              <div className="flex gap-4 min-w-0 flex-1">
                                <div
                                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-bold text-white shadow-inner"
                                  aria-hidden
                                >
                                  {companyInitial(job.company_name)}
                                </div>
                                <div className="min-w-0 flex-1 space-y-3">
                                  <div>
                                    <h2 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                                      {job.title}
                                    </h2>
                                    <p className="mt-1.5 text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <span className="font-semibold text-slate-800">{job.company_name}</span>
                                      <span className="text-slate-300" aria-hidden>
                                        ·
                                      </span>
                                      <span className="inline-flex items-center gap-1 text-slate-600">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                                        {job.location}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className="rounded-md border-0 bg-slate-100 text-slate-800 font-medium hover:bg-slate-100">
                                      {job.employment_type}
                                    </Badge>
                                    {seniority ? (
                                      <Badge variant="outline" className="rounded-md font-normal text-slate-700 border-slate-200">
                                        {seniority}
                                      </Badge>
                                    ) : null}
                                    {applicants ? (
                                      <Badge variant="outline" className="rounded-md font-normal gap-1 text-slate-700 border-slate-200">
                                        <Users className="h-3 w-3" aria-hidden />
                                        {applicants}
                                      </Badge>
                                    ) : null}
                                    {jobFn ? (
                                      <Badge
                                        variant="outline"
                                        className="rounded-md font-normal text-slate-600 border-slate-200 max-w-[240px] truncate"
                                      >
                                        {jobFn}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  {industries ? (
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{industries}</p>
                                  ) : null}
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                                      Posted {postedLabel}
                                    </span>
                                    {job.eligible_batch_name ? (
                                      <span>
                                        Cohort:{' '}
                                        <span className="font-medium text-slate-700">{job.eligible_batch_name}</span>
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 lg:w-[200px] lg:shrink-0 lg:justify-center">
                                {applyUrl ? (
                                  <Button variant="outline" size="sm" className="w-full gap-1.5 font-semibold" asChild>
                                    <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                                      View listing
                                      <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
                                    </a>
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  size="sm"
                                  className="w-full font-semibold shadow-sm bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleApply(job.id)}
                                  disabled={applyBusyId === job.id}
                                >
                                  {applyBusyId === job.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : applyUrl ? (
                                    'Log interest'
                                  ) : (
                                    'Apply'
                                  )}
                                </Button>
                              </div>
                            </div>

                            {job.description ? (
                              <Collapsible className="mt-5 -mx-2 rounded-xl border border-slate-100 bg-slate-50/80 overflow-hidden">
                                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/80 [&[data-state=open]>svg]:rotate-180 transition-colors">
                                  Listing summary
                                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 pt-0 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap border-t border-slate-100/80">
                                    {job.description}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
