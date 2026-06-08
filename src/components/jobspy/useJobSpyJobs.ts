import { useCallback, useEffect, useState } from 'react'
import { jobspyApi, type JobSpyExperienceBand, type JobSpyJob, type JobSpyJobFilters, type JobSpyLocation, type JobSpyRole, type JobSpySite } from '@/lib/jobspy-api'

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

export function useJobSpyJobs() {
  const [apiStatus, setApiStatus] = useState<JobSpyApiStatus>('loading')
  const [meta, setMeta] = useState<{
    roles: JobSpyRole[]
    locations: JobSpyLocation[]
    bands: JobSpyExperienceBand[]
    sites: JobSpySite[]
  }>({ roles: [], locations: [], bands: [], sites: [] })
  const [filters, setFilters] = useState<JobSpyJobFilters>(DEFAULT_JOBSPY_FILTERS)
  const [tab, setTab] = useState<'browse' | 'others'>('browse')
  const [jobs, setJobs] = useState<JobSpyJob[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
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

  const fetchJobs = useCallback(async (nextFilters = filters, bucket = tab === 'others' ? 'others' : 'tagged') => {
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

  useEffect(() => {
    if (apiStatus !== 'ok') return
    void fetchJobs(filters, tab === 'others' ? 'others' : 'tagged')
  }, [apiStatus, tab, filters.page, filters.page_size, fetchJobs])

  const handleFilterChange = (key: keyof JobSpyJobFilters | 'reset', value: string) => {
    if (key === 'reset') {
      setFilters(DEFAULT_JOBSPY_FILTERS)
      void fetchJobs(DEFAULT_JOBSPY_FILTERS, tab === 'others' ? 'others' : 'tagged')
      return
    }
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSearch = () => {
    const next = { ...filters, page: 1 }
    setFilters(next)
    void fetchJobs(next, tab === 'others' ? 'others' : 'tagged')
  }

  const openJob = async (id: number) => {
    try {
      const job = await jobspyApi.getJob(id)
      setSelectedJob(job)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load job')
    }
  }

  const totalPages = Math.ceil(total / (filters.page_size ?? 12)) || 1

  return {
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
  }
}
