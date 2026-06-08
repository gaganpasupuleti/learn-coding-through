type RuntimeConfig = {
  VITE_JOBS_API_URL?: string
}

const runtimeConfig: RuntimeConfig =
  typeof window !== 'undefined' && (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
    ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__!
    : {}

const RAW_JOBS_BASE =
  runtimeConfig.VITE_JOBS_API_URL ||
  import.meta.env.VITE_JOBS_API_URL ||
  ''

const JOBS_API_BASE = (RAW_JOBS_BASE || '').trim().replace(/\/$/, '')

const ADMIN_KEY_STORAGE = 'jobspy_admin_key'

function jobsBaseUrl(): string {
  if (JOBS_API_BASE) return JOBS_API_BASE
  if (typeof window !== 'undefined') return `${window.location.origin}/jobs-api`
  return ''
}

function formatApiError(detail: unknown, status: number): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : JSON.stringify(d))).join('; ')
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail)
  return `Request failed: ${status}`
}

async function jobspyRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = jobsBaseUrl()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(formatApiError((err as { detail?: unknown }).detail, res.status))
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function readStoredAdminKey(): string {
  const fromLocal = localStorage.getItem(ADMIN_KEY_STORAGE)
  if (fromLocal) return fromLocal
  const fromSession = sessionStorage.getItem(ADMIN_KEY_STORAGE)
  if (fromSession) {
    localStorage.setItem(ADMIN_KEY_STORAGE, fromSession)
    sessionStorage.removeItem(ADMIN_KEY_STORAGE)
    return fromSession
  }
  return ''
}

export function getJobSpyAdminKey(): string {
  return import.meta.env.VITE_JOBS_ADMIN_API_KEY || readStoredAdminKey()
}

export function setJobSpyAdminKey(key: string): void {
  if (key.trim()) localStorage.setItem(ADMIN_KEY_STORAGE, key.trim())
  else {
    localStorage.removeItem(ADMIN_KEY_STORAGE)
    sessionStorage.removeItem(ADMIN_KEY_STORAGE)
  }
}

export interface JobSpyRole {
  slug: string
  name: string
}

export interface JobSpyLocation {
  slug: string
  display_name: string
}

export interface JobSpyExperienceBand {
  slug: string
  label: string
}

export interface JobSpySite {
  slug: string
  label: string
  active_count: number
}

export interface JobSpyJob {
  id: number
  title: string
  company_name: string | null
  location_display?: string | null
  city?: string | null
  state?: string | null
  site?: string | null
  is_remote?: boolean
  tag_status?: string | null
  needs_review?: boolean
  key_skills?: string | string[] | null
  min_amount?: number | null
  max_amount?: number | null
  currency?: string | null
  job_type?: string | null
  date_posted?: string | null
  job_url?: string | null
  description?: string | null
  job_level?: string | null
  experience_band?: string | null
}

export interface JobSpyJobsResponse {
  items: JobSpyJob[]
  total: number
  page: number
  page_size: number
}

export interface JobSpyJobFilters {
  keyword?: string
  company?: string
  role?: string
  location?: string
  experience?: string
  site?: string
  is_remote?: string
  bucket?: string
  page?: number
  page_size?: number
}

export interface JobSpyDashboardStats {
  jobs: { live: number; inactive: number; total: number }
  jobs_by_tag?: { complete?: number; partial?: number; untagged?: number; flagged?: number }
  last_job_scraped_at?: string | null
  last_successful_scrape_at?: string | null
  scrape_in_progress?: boolean
  search_profiles?: { total_active?: number; never_scraped?: number; scraped_last_24h?: number }
  recent_scrape_runs?: Array<{
    id: number
    search_profile_id: number
    status: string
    jobs_found: number
    jobs_upserted: number
    started_at: string
    finished_at?: string | null
  }>
}

export interface JobSpyRefreshResult {
  message: string
}

export const jobspyApi = {
  health: () => jobspyRequest<{ status: string }>('/health'),

  getRoles: () => jobspyRequest<JobSpyRole[]>('/api/v1/meta/roles'),
  getLocations: () => jobspyRequest<JobSpyLocation[]>('/api/v1/meta/locations'),
  getExperienceBands: () => jobspyRequest<JobSpyExperienceBand[]>('/api/v1/meta/experience-bands'),
  getSites: () => jobspyRequest<JobSpySite[]>('/api/v1/meta/sites'),

  getJobs: (params: JobSpyJobFilters) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) qs.set(k, String(v))
    })
    if (!qs.has('bucket')) qs.set('bucket', 'tagged')
    return jobspyRequest<JobSpyJobsResponse>(`/api/v1/jobs?${qs}`)
  },

  getJob: (id: number) => jobspyRequest<JobSpyJob>(`/api/v1/jobs/${id}`),

  getDashboardStats: () => jobspyRequest<JobSpyDashboardStats>('/api/v1/dashboard/stats'),
  getDashboardRefreshStatus: () => jobspyRequest<{ in_progress: boolean }>('/api/v1/dashboard/refresh/status'),

  triggerDashboardRefresh: ({
    limit = 5,
    adminKey,
    full = false,
  }: {
    limit?: number
    adminKey: string
    full?: boolean
  }) => {
    const qs = new URLSearchParams({ limit: String(limit), full: String(full) })
    return jobspyRequest<JobSpyRefreshResult>(`/api/v1/dashboard/refresh?${qs}`, {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
    })
  },

  triggerScrapeRun: ({ limit = 5, adminKey }: { limit?: number; adminKey: string }) => {
    const qs = new URLSearchParams({ limit: String(limit) })
    return jobspyRequest<JobSpyRefreshResult>(`/api/v1/admin/scrape/run?${qs}`, {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
    })
  },

  getScrapeRuns: (adminKey: string) =>
    jobspyRequest<unknown[]>('/api/v1/admin/scrape/runs', {
      headers: { 'X-Admin-Key': adminKey },
    }),
}

export function parseJobSpySkills(raw: JobSpyJob['key_skills']): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

export function jobSpySiteLabel(site?: string | null): string {
  if (!site) return 'Job board'
  const map: Record<string, string> = {
    linkedin: 'LinkedIn',
    indeed: 'Indeed',
    zip_recruiter: 'ZipRecruiter',
    glassdoor: 'Glassdoor',
    google: 'Google',
    naukri: 'Naukri',
  }
  return map[site] ?? site
}

export function formatJobSpySalary(job: JobSpyJob): string | null {
  if (!job.min_amount && !job.max_amount) return null
  const cur = job.currency ? `${job.currency} ` : ''
  if (job.min_amount && job.max_amount) return `${cur}${job.min_amount}–${job.max_amount}`
  return `${cur}${job.min_amount ?? job.max_amount}`
}
