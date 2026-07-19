type RuntimeConfig = {
  VITE_JOBS_API_URL?: string
  VITE_API_URL?: string
  VITE_API_BASE_URL?: string
}

const runtimeConfig: RuntimeConfig =
  typeof window !== 'undefined' && (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
    ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__!
    : {}

const RAW_JOBS_BASE =
  runtimeConfig.VITE_JOBS_API_URL ||
  import.meta.env.VITE_JOBS_API_URL ||
  runtimeConfig.VITE_API_URL ||
  runtimeConfig.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''

const JOBS_API_BASE = (RAW_JOBS_BASE || '').trim().replace(/\/$/, '')

const ADMIN_KEY_STORAGE = 'cq_jobs_admin_key'

function jobsBaseUrl(): string {
  if (JOBS_API_BASE) return JOBS_API_BASE
  if (typeof window !== 'undefined') return window.location.origin
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
  id: number
  city: string
  state?: string
  country?: string
  display_name: string
  is_active?: boolean
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

export type JobSpyJobId = string

export interface JobSpyJob {
  id: JobSpyJobId
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
  job_url_direct?: string | null
  description?: string | null
  job_level?: string | null
  experience_band?: string | null
}

export interface JobSpyApplyResponse {
  redirect_url: string
  application_id?: string
}

export interface JobSpySaveJobResponse {
  saved: boolean
  saved_job_id?: string
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
  location?: string
  experience?: string
  site?: string
  bucket?: string
  profile?: string
  page?: number
  page_size?: number
}

export const JOBSPY_EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All levels' },
  { value: 'internship', label: 'Internship' },
  { value: 'fresher', label: 'Fresher / Entry Level' },
  { value: '1plus', label: '1+ years' },
  { value: '2plus', label: '2+ years' },
  { value: '3plus', label: '3+ years' },
  { value: '5plus', label: '5+ years' },
]

export const JOBSPY_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All sources' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'naukri', label: 'Naukri' },
  { value: 'foundit', label: 'Foundit' },
  { value: 'google', label: 'Google' },
]

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

export interface NormalizedJobApi {
  id: string
  source: string
  title: string
  company?: string | null
  location?: string | null
  jobType?: string | null
  datePosted?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  description?: string | null
  jobUrl: string
  applyUrl?: string | null
  createdAt?: string | null
}

export interface ScrapeRequestBody {
  searchTerm: string
  location: string
  resultsWanted: number
  hoursOld: number
  sources: string[]
}

export interface ScrapeSummaryResponse {
  searchTerm: string
  location: string
  totalFound: number
  savedCount: number
  skippedDuplicates: number
  sourceBreakdown: Record<string, number>
  errors: string[]
  jobs?: NormalizedJobApi[]
  scrapeRunId?: number
  status?: string
  durationMs?: number
  totalJobsBefore?: number
  totalJobsAfter?: number
}

export interface JobStatsSourceItem {
  source: string
  count: number
}

export interface JobStatsLocationItem {
  location: string
  count: number
}

export interface JobStatsScrapeRun {
  id: number
  searchTerm: string
  location: string
  sources: string[]
  totalFound: number
  savedCount: number
  skippedDuplicates: number
  errorCount: number
  status: string
  startedAt: string
  finishedAt: string | null
  durationMs: number | null
  runType?: string
  profile?: string | null
  sourceBreakdown?: Record<string, number>
  expiredCount?: number
  failedLinkCount?: number
  hoursOld?: number
}

export interface JobStatsLatestJob {
  id: string
  jobId?: string | null
  ingestProfile?: string | null
  actualRoleId?: string | null
  actualRoleName?: string | null
  source: string
  title: string
  company: string | null
  location: string | null
  datePosted: string | null
  createdAt: string
  jobUrl: string
  linkStatus?: string
}

export interface JobStatsProfileItem {
  profile: string
  label: string
  count: number
  autoEnabled: boolean
}

export interface JobStatsEnrichmentRoleItem {
  roleId: string
  roleName: string
  count: number
}

export interface JobBoardOverview {
  totalJobs: number
  activeJobs: number
  loadedToday: number
  loadedLast24Hours: number
  loadedLast7Days: number
  latestLoadedAt: string | null
  lastAutoRefreshAt: string | null
  profileBreakdown: JobStatsProfileItem[]
  sourceBreakdown: JobStatsSourceItem[]
  enrichmentRoleSummary: JobStatsEnrichmentRoleItem[]
}

export interface JobStatsResponse {
  totalJobs: number
  activeJobs: number
  loadedToday: number
  loadedLast24Hours: number
  loadedLast7Days: number
  latestLoadedAt: string | null
  expiredJobs: number
  linkFailedJobs: number
  unknownLinkJobs: number
  lastAutoRefreshAt: string | null
  lastCleanupAt: string | null
  sourceBreakdown: JobStatsSourceItem[]
  sourceFailureCounts: Record<string, number>
  locationBreakdown: JobStatsLocationItem[]
  recentScrapeRuns: JobStatsScrapeRun[]
  latestJobs: JobStatsLatestJob[]
  expiredJobSamples: JobStatsLatestJob[]
  profileBreakdown: JobStatsProfileItem[]
  enrichmentRoleSummary: JobStatsEnrichmentRoleItem[]
}

export interface RefreshRequestBody {
  profile: string
  sources: string[]
  runMode: 'manual' | 'auto'
  dateRangeDays?: number
  hoursOld?: number
}

export interface RefreshResponse {
  profile: string
  profileLabel: string
  location: string
  runType: string
  hoursOld: number
  dateRangeDays?: number | null
  rangeLabel?: string | null
  totalFound: number
  savedCount: number
  skippedDuplicates: number
  sourceBreakdown: Record<string, number>
  errors: string[]
  scrapeRunId?: number
  status?: string
  durationMs?: number
  totalJobsBefore?: number
  totalJobsAfter?: number
}

export interface CleanupLinksResponse {
  checkedCount: number
  markedActive: number
  markedExpired: number
  markedLinkFailed: number
  markedUnknown: number
  totalActive: number
  totalExpired: number
  totalLinkFailed: number
  totalUnknown: number
  deletedJobs?: number
  deletedEnrichments?: number
  scrapeRunId?: number
}

export interface DigestSummary {
  totalActiveJobs: number
  selectedJobsCount: number
  recentJobsCount: number
  internships24h: number
  freshers24h: number
  topRoles: string[]
  topCompanies: string[]
  topLocations: string[]
  sourceSplit: Record<string, number>
}

export interface EmailDigestBody {
  jobIds: string[]
  searchTerm: string
  location: string
  subjectOverride?: string | null
  introMessage?: string | null
  maxJobs?: number
  ctaLabel?: string | null
  ctaUrl?: string | null
}

export interface EmailPreviewResponse {
  subject: string
  html: string
  text: string
  jobCount: number
  summary: DigestSummary
}

export interface SendDigestResponse {
  sentCount: number
  failedCount: number
  failedEmails: string[]
  mode: string
  message: string
  recipientCount?: number | null
  jobCount?: number | null
}

export interface EnrichmentRoleSummaryItem {
  role_id: string
  role_name: string
  count: number
}

export interface EnrichmentLevelSummaryItem {
  role_level_id: string
  experience_level: string
  count: number
}

export interface JobEnrichmentSummaryResponse {
  total_enrichments: number
  pending_count: number
  needs_review_count: number
  approved_count: number
  rejected_count: number
  live_count: number
  expired_count: number
  unknown_live_status_count: number
  role_summary: EnrichmentRoleSummaryItem[]
  level_summary: EnrichmentLevelSummaryItem[]
  quiz_pack_linked_count: number
  quiz_pack_missing_count: number
}

export interface JobEnrichmentRowPreview {
  row_number: number
  job_id: string
  errors: string[]
  warnings: string[]
}

export interface JobEnrichmentImportPreviewResponse {
  total_rows: number
  valid_rows: number
  invalid_rows: number
  warning_rows: number
  row_errors: JobEnrichmentRowPreview[]
  role_summary: Array<{ role_id: string; count: number }>
  status_summary: Record<string, Record<string, number>>
  quiz_pack_summary: Array<{ quiz_pack_id: string; count: number; exists: boolean }>
}

export interface JobEnrichmentImportCommitResponse {
  total_rows: number
  inserted_count: number
  updated_count: number
  skipped_count: number
  invalid_rows: number
  warning_rows: number
  row_errors: JobEnrichmentRowPreview[]
  saved_job_ids: string[]
  skipped_job_ids: string[]
}

function mapApiJob(job: NormalizedJobApi): JobSpyJob {
  return {
    id: job.id,
    title: job.title,
    company_name: job.company ?? null,
    location_display: job.location ?? null,
    site: job.source ?? null,
    min_amount: job.salaryMin ?? null,
    max_amount: job.salaryMax ?? null,
    currency: job.currency ?? null,
    job_type: job.jobType ?? null,
    date_posted: job.datePosted ?? null,
    job_url: job.jobUrl ?? null,
    job_url_direct: job.applyUrl ?? job.jobUrl ?? null,
    description: job.description ?? null,
    tag_status: 'complete',
  }
}

function adminHeaders(adminKey: string): Record<string, string> {
  return adminKey ? { 'X-Admin-Key': adminKey } : {}
}

async function jobspyAdminRequest<T>(path: string, adminKey: string, options: RequestInit = {}): Promise<T> {
  const base = jobsBaseUrl()
  const headers: Record<string, string> = {
    ...adminHeaders(adminKey),
    ...(options.headers as Record<string, string> | undefined),
  }
  const res = await fetch(`${base}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(formatApiError((err as { detail?: unknown }).detail, res.status))
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const jobspyApi = {
  health: () => jobspyRequest<{ status: string }>('/health'),

  getJobBoardOverview: async (): Promise<JobBoardOverview> => {
    const data = await jobspyRequest<JobBoardOverview>('/api/jobs/overview')
    return {
      ...data,
      profileBreakdown: data.profileBreakdown ?? [],
      sourceBreakdown: data.sourceBreakdown ?? [],
      enrichmentRoleSummary: data.enrichmentRoleSummary ?? [],
    }
  },

  getRoles: async (): Promise<JobSpyRole[]> => [],
  getLocations: async (): Promise<JobSpyLocation[]> => [],
  getExperienceBands: async (): Promise<JobSpyExperienceBand[]> => [],
  getSites: async (): Promise<JobSpySite[]> => {
    try {
      const data = await jobspyRequest<{ jobs: NormalizedJobApi[]; total: number }>('/api/jobs?limit=1')
      return [
        { slug: 'indeed', label: 'Indeed', active_count: data.total },
        { slug: 'google', label: 'Google', active_count: data.total },
      ]
    } catch {
      return []
    }
  },

  getJobs: async (params: JobSpyJobFilters): Promise<JobSpyJobsResponse> => {
    const qs = new URLSearchParams()
    if (params.keyword) qs.set('search', params.keyword)
    if (params.company) qs.set('company', params.company)
    if (params.location) qs.set('location', params.location)
    if (params.site) qs.set('source', params.site)
    if (params.experience) qs.set('experience', params.experience)
    if (params.profile) qs.set('profile', params.profile)
    qs.set('page', String(params.page ?? 1))
    qs.set('limit', String(params.page_size ?? 20))
    const data = await jobspyRequest<{ jobs: NormalizedJobApi[]; total: number; page: number; limit: number }>(
      `/api/jobs?${qs}`,
    )
    return {
      items: data.jobs.map(mapApiJob),
      total: data.total,
      page: data.page,
      page_size: data.limit,
    }
  },

  getJob: async (id: JobSpyJobId): Promise<JobSpyJob> => {
    const job = await jobspyRequest<NormalizedJobApi>(`/api/jobs/${id}`)
    return mapApiJob(job)
  },

  applyToJob: async (id: JobSpyJobId, _sessionId: string): Promise<JobSpyApplyResponse> => {
    const job = await jobspyApi.getJob(id)
    const url = jobSpyApplyUrl(job)
    if (!url) throw new Error('No apply link available')
    return { redirect_url: url }
  },

  saveJob: async (_id: JobSpyJobId, _sessionId: string): Promise<JobSpySaveJobResponse> => ({
    saved: true,
  }),

  getDashboardStats: async (): Promise<JobSpyDashboardStats> => {
    const data = await jobspyRequest<{ jobs: NormalizedJobApi[]; total: number }>('/api/jobs?limit=1')
    return {
      jobs: { live: data.total, inactive: 0, total: data.total },
      jobs_by_tag: { complete: data.total, partial: 0, untagged: 0, flagged: 0 },
      scrape_in_progress: false,
    }
  },

  getDashboardRefreshStatus: async () => ({ in_progress: false }),

  triggerDashboardRefresh: async ({
    limit = 5,
    adminKey,
    full: _full = false,
  }: {
    limit?: number
    adminKey: string
    full?: boolean
  }) => {
    const res = await jobspyApi.runScrape(
      {
        searchTerm: 'python developer',
        location: 'India',
        resultsWanted: Math.min(limit * 5, 25),
        hoursOld: 48,
        sources: ['indeed', 'google', 'linkedin'],
      },
      adminKey,
    )
    return { message: `Scrape complete: ${res.totalFound} found, ${res.savedCount} saved` }
  },

  triggerScrapeRun: async ({ limit = 5, adminKey }: { limit?: number; adminKey: string }) => {
    const res = await jobspyApi.runScrape(
      {
        searchTerm: 'python developer',
        location: 'India',
        resultsWanted: Math.min(limit * 5, 25),
        hoursOld: 48,
        sources: ['indeed', 'google', 'linkedin'],
      },
      adminKey,
    )
    return { message: `Scrape complete: ${res.totalFound} found, ${res.savedCount} saved` }
  },

  getScrapeRuns: async (_adminKey: string) => [],

  runScrape: (body: ScrapeRequestBody, adminKey: string) =>
    jobspyRequest<ScrapeSummaryResponse>('/api/admin/jobs/scrape', {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(body),
    }),

  getJobStats: async (adminKey: string, params?: { days?: number; limit?: number; profile?: string; roleId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.days) qs.set('days', String(params.days))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.profile) qs.set('profile', params.profile)
    if (params?.roleId) qs.set('roleId', params.roleId)
    const query = qs.toString()
    const data = await jobspyRequest<JobStatsResponse>(
      `/api/admin/jobs/stats${query ? `?${query}` : ''}`,
      { headers: adminHeaders(adminKey) },
    )
    // ponytail: old backend builds omit new stats fields; default empty arrays here once.
    return {
      ...data,
      profileBreakdown: data.profileBreakdown ?? [],
      enrichmentRoleSummary: data.enrichmentRoleSummary ?? [],
      latestJobs: data.latestJobs ?? [],
      expiredJobSamples: data.expiredJobSamples ?? [],
      recentScrapeRuns: data.recentScrapeRuns ?? [],
      sourceBreakdown: data.sourceBreakdown ?? [],
      locationBreakdown: data.locationBreakdown ?? [],
    }
  },

  refreshJobs: (body: RefreshRequestBody, adminKey: string) =>
    jobspyRequest<RefreshResponse>('/api/admin/jobs/refresh', {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(body),
    }),

  cleanupLinks: (adminKey: string, limit = 50) =>
    jobspyRequest<CleanupLinksResponse>(`/api/admin/jobs/cleanup-links?limit=${limit}`, {
      method: 'POST',
      headers: adminHeaders(adminKey),
    }),

  emailPreview: (body: EmailDigestBody, adminKey: string) =>
    jobspyRequest<EmailPreviewResponse>('/api/admin/jobs/email-preview', {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(body),
    }),

  sendDigest: (
    body: EmailDigestBody & {
      mode: 'test' | 'dry_run' | 'live'
      testEmail?: string
      recipientEmails?: string[]
    },
    adminKey: string,
  ) =>
    jobspyRequest<SendDigestResponse>('/api/admin/jobs/send-digest', {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(body),
    }),

  getEnrichmentSummary: (adminKey: string) =>
    jobspyAdminRequest<JobEnrichmentSummaryResponse>('/api/admin/jobs/enrichment/summary', adminKey),

  enrichmentImportPreview: (adminKey: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return jobspyAdminRequest<JobEnrichmentImportPreviewResponse>(
      '/api/admin/jobs/enrichment/import-preview',
      adminKey,
      { method: 'POST', body: form },
    )
  },

  enrichmentImportCommit: (adminKey: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return jobspyAdminRequest<JobEnrichmentImportCommitResponse>(
      '/api/admin/jobs/enrichment/import-commit',
      adminKey,
      { method: 'POST', body: form },
    )
  },
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
    foundit: 'Foundit',
  }
  return map[site] ?? site
}

export function profileKeyLabel(profile: string | null | undefined, breakdown?: JobStatsProfileItem[]): string {
  if (!profile) return '—'
  const hit = breakdown?.find((p) => p.profile === profile)
  return hit?.label ?? profile.replace(/_india$/, '').replace(/_/g, ' ')
}

export function formatJobSpySalary(job: JobSpyJob): string | null {
  if (!job.min_amount && !job.max_amount) return null
  const cur = job.currency ? `${job.currency} ` : ''
  if (job.min_amount && job.max_amount) return `${cur}${job.min_amount}–${job.max_amount}`
  return `${cur}${job.min_amount ?? job.max_amount}`
}

/** Best external URL for apply / view-original (direct link preferred). */
export function jobSpyApplyUrl(job: JobSpyJob): string | null {
  const direct = job.job_url_direct?.trim()
  const url = job.job_url?.trim()
  return direct || url || null
}

/**
 * Fetch /api/admin/jobs/export as a Blob using the correct API base and X-Admin-Key header.
 * Returns { blob, filename } on success, throws on failure.
 */
export async function exportJobsCsv(adminKey: string, limit = 5000): Promise<{ blob: Blob; filename: string }> {
  const base = jobsBaseUrl()
  const url = `${base}/api/admin/jobs/export?limit=${limit}`
  const res = await fetch(url, {
    headers: { 'X-Admin-Key': adminKey },
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = (await res.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch { /* ignore */ }
    console.error('[exportJobsCsv] failed', { url, status: res.status, detail })
    throw new Error(`Export failed (${res.status}): ${detail}`)
  }
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="?([^";\n]+)"?/)
  const filename = match?.[1] ?? 'jobs_export.csv'
  const blob = await res.blob()
  return { blob, filename }
}
