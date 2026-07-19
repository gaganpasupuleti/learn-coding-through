import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addSavedJobId,
  getJobSpySessionId,
  getSavedJobIds,
  removeSavedJobId,
} from '@/components/jobspy/jobSpySession'
import {
  jobspyApi,
  jobSpyApplyUrl,
  type JobBoardOverview,
  type JobSpyJob,
  type JobSpyJobFilters,
  type JobSpyJobId,
} from '@/lib/jobspy-api'

export const DEFAULT_JOBSPY_FILTERS: JobSpyJobFilters = {
  keyword: '',
  company: '',
  location: '',
  experience: '',
  site: '',
  page: 1,
  page_size: 12,
}

export type JobSpyApiStatus = 'loading' | 'ok' | 'error'
export type JobSpyTab = 'browse' | 'others' | 'saved'

export function useJobSpyJobs() {
  const sessionId = useMemo(() => getJobSpySessionId(), [])
  const [apiStatus, setApiStatus] = useState<JobSpyApiStatus>('loading')
  const [filters, setFilters] = useState<JobSpyJobFilters>(DEFAULT_JOBSPY_FILTERS)
  const [tab, setTab] = useState<JobSpyTab>('browse')
  const [jobs, setJobs] = useState<JobSpyJob[]>([])
  const [savedJobs, setSavedJobs] = useState<JobSpyJob[]>([])
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedJobIds())
  const [total, setTotal] = useState(0)
  const [overview, setOverview] = useState<JobBoardOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savedLoading, setSavedLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyNotice, setApplyNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobSpyJob | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await jobspyApi.health()
        if (cancelled) return
        setApiStatus('ok')
      } catch {
        if (!cancelled) setApiStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      setOverview(await jobspyApi.getJobBoardOverview())
    } catch {
      setOverview(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const fetchJobs = useCallback(async (nextFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await jobspyApi.getJobs(nextFilters)
      setJobs(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs')
      setJobs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadSavedJobs = useCallback(async () => {
    const ids = getSavedJobIds()
    setSavedIds(ids)
    if (ids.length === 0) {
      setSavedJobs([])
      return
    }
    setSavedLoading(true)
    setError(null)
    try {
      const results = await Promise.allSettled(ids.map((id) => jobspyApi.getJob(id)))
      const loaded = results
        .filter((r): r is PromiseFulfilledResult<JobSpyJob> => r.status === 'fulfilled')
        .map((r) => r.value)
      setSavedJobs(loaded)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load saved jobs')
      setSavedJobs([])
    } finally {
      setSavedLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiStatus !== 'ok') return
    void fetchOverview()
  }, [apiStatus, fetchOverview])

  useEffect(() => {
    if (apiStatus !== 'ok') return
    if (tab === 'saved') {
      void loadSavedJobs()
      return
    }
    if (tab === 'others') {
      // Others is not implemented for India ingestion yet — keep it safe/empty.
      setJobs([])
      setTotal(0)
      return
    }
    void fetchJobs(filters)
  }, [apiStatus, tab, filters.page, filters.page_size, filters.profile, filters.site, fetchJobs, loadSavedJobs])

  const handleFilterChange = (key: keyof JobSpyJobFilters | 'reset', value: string) => {
    if (key === 'reset') {
      setFilters(DEFAULT_JOBSPY_FILTERS)
      void fetchJobs(DEFAULT_JOBSPY_FILTERS)
      return
    }
    const next = { ...filters, [key]: value, page: 1 }
    setFilters(next)
    if (key === 'site' || key === 'experience') {
      void fetchJobs(next)
    }
  }

  const handleSourceSelect = (source: string) => {
    const next = { ...filters, site: source || undefined, page: 1 }
    setFilters(next)
    void fetchJobs(next)
  }

  const handleSearch = () => {
    const next = { ...filters, page: 1 }
    setFilters(next)
    void fetchJobs(next)
  }

  const openJob = async (id: JobSpyJobId) => {
    try {
      const job = await jobspyApi.getJob(id)
      setSelectedJob(job)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load job')
    }
  }

  const handleSave = async (jobId: JobSpyJobId) => {
    if (apiStatus !== 'ok') {
      setError('Job service is offline — saved job details cannot load right now. Try again later.')
      return
    }
    if (!sessionId) {
      setError('Could not start a browser session for saved jobs.')
      return
    }
    try {
      await jobspyApi.saveJob(jobId, sessionId)
      addSavedJobId(jobId)
      setSavedIds(getSavedJobIds())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save job')
    }
  }

  const handleUnsave = (jobId: JobSpyJobId) => {
    removeSavedJobId(jobId)
    const nextIds = getSavedJobIds()
    setSavedIds(nextIds)
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId))
  }

  const handleApply = async (job: JobSpyJob) => {
    const fallbackUrl = jobSpyApplyUrl(job)
    if (!fallbackUrl) {
      setApplyNotice('No apply link is available for this listing.')
      return
    }

    setApplying(true)
    setApplyNotice(null)
    try {
      if (apiStatus === 'ok' && sessionId) {
        const { redirect_url } = await jobspyApi.applyToJob(job.id, sessionId)
        window.open(redirect_url || fallbackUrl, '_blank', 'noopener,noreferrer')
        return
      }
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
      setApplyNotice('Apply tracking unavailable — opened the original posting directly.')
    } catch {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
      setApplyNotice('Could not record apply click — opened the original posting directly.')
    } finally {
      setApplying(false)
    }
  }

  const totalPages = Math.ceil(total / (filters.page_size ?? 12)) || 1
  const displayJobs = tab === 'saved' ? savedJobs : jobs
  const listLoading = tab === 'saved' ? savedLoading : loading

  return {
    apiStatus,
    filters,
    tab,
    setTab,
    jobs,
    savedJobs,
    savedIds,
    displayJobs,
    total,
    overview,
    overviewLoading,
    loading: listLoading,
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
  }
}
