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
  type JobSpyExperienceBand,
  type JobSpyJob,
  type JobSpyJobFilters,
  type JobSpyJobId,
  type JobSpyLocation,
  type JobSpyRole,
  type JobSpySite,
} from '@/lib/jobspy-api'

export const DEFAULT_JOBSPY_FILTERS: JobSpyJobFilters = {
  keyword: '',
  company: '',
  role: '',
  location: '',
  experience: '',
  site: '',
  is_remote: '',
  page: 1,
  page_size: 12,
}

export type JobSpyApiStatus = 'loading' | 'ok' | 'error'
export type JobSpyTab = 'browse' | 'others' | 'saved'

export function useJobSpyJobs() {
  const sessionId = useMemo(() => getJobSpySessionId(), [])
  const [apiStatus, setApiStatus] = useState<JobSpyApiStatus>('loading')
  const [meta, setMeta] = useState<{
    roles: JobSpyRole[]
    locations: JobSpyLocation[]
    bands: JobSpyExperienceBand[]
    sites: JobSpySite[]
  }>({ roles: [], locations: [], bands: [], sites: [] })
  const [filters, setFilters] = useState<JobSpyJobFilters>(DEFAULT_JOBSPY_FILTERS)
  const [tab, setTab] = useState<JobSpyTab>('browse')
  const [jobs, setJobs] = useState<JobSpyJob[]>([])
  const [savedJobs, setSavedJobs] = useState<JobSpyJob[]>([])
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedJobIds())
  const [total, setTotal] = useState(0)
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
        const [roles, locations, bands, sites] = await Promise.all([
          jobspyApi.getRoles(),
          jobspyApi.getLocations(),
          jobspyApi.getExperienceBands(),
          jobspyApi.getSites().catch(() => []),
        ])
        if (cancelled) return
        setMeta({ roles, locations, bands, sites })
        setApiStatus('ok')
      } catch {
        if (!cancelled) setApiStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const bucketForTab = (t: JobSpyTab) => (t === 'others' ? 'others' : 'tagged')

  const fetchJobs = useCallback(async (nextFilters = filters, bucket = bucketForTab(tab)) => {
    setLoading(true)
    setError(null)
    try {
      const data = await jobspyApi.getJobs({ ...nextFilters, bucket })
      setJobs(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs')
      setJobs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters, tab])

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
    if (tab === 'saved') {
      void loadSavedJobs()
      return
    }
    void fetchJobs(filters, bucketForTab(tab))
  }, [apiStatus, tab, filters.page, filters.page_size, fetchJobs, loadSavedJobs])

  const handleFilterChange = (key: keyof JobSpyJobFilters | 'reset', value: string) => {
    if (key === 'reset') {
      setFilters(DEFAULT_JOBSPY_FILTERS)
      void fetchJobs(DEFAULT_JOBSPY_FILTERS, bucketForTab(tab))
      return
    }
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSearch = () => {
    const next = { ...filters, page: 1 }
    setFilters(next)
    void fetchJobs(next, bucketForTab(tab))
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
      setError('Job service is offline — saved jobs need the JobSpy API. Try again later.')
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
    meta,
    filters,
    tab,
    setTab,
    jobs,
    savedJobs,
    savedIds,
    displayJobs,
    total,
    loading: listLoading,
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
  }
}
