/**
 * API client for backend code execution
 */

type RuntimeConfig = {
  VITE_API_URL?: string
  VITE_API_BASE_URL?: string
}

const runtimeConfig: RuntimeConfig =
  typeof window !== 'undefined' && (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
    ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__!
    : {}

// Never use VITE_API_PROXY_TARGET here: it is dev-server-only (see vite.config.ts proxy target).
// If the browser used it as API_BASE_URL, requests would bypass same-origin /api and hit CORS or
// wrong fallbacks; local .env often sets PROXY_TARGET while leaving VITE_API_URL empty on purpose.
const RAW_API_BASE_URL =
  runtimeConfig.VITE_API_URL ||
  runtimeConfig.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''

function normalizeConfiguredApiBase(raw: string): string {
  const normalized = (raw || '').trim().replace(/\/$/, '')
  if (!normalized) return ''

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith('/')) {
    return normalized
  }

  // Railway private network domains are not reachable from the browser.
  if (normalized.endsWith('.railway.internal')) {
    return ''
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return `http://${normalized}`
  }

  // Accept bare hostnames by promoting them to https.
  if (/^[a-z0-9.-]+(?::\d+)?$/i.test(normalized)) {
    return `https://${normalized}`
  }

  return ''
}

function resolveApiBaseUrl(raw: string): string {
  const normalized = (raw || '').replace(/\/$/, '')
  if (!normalized || typeof window === 'undefined') return normalized

  try {
    const configured = new URL(normalized)

    // Browser clients cannot reach Railway private network domains.
    if (configured.hostname.endsWith('.railway.internal') && window.location.hostname.includes('railway.app')) {
      return ''
    }
  } catch {
    // Keep existing value if URL parsing fails.
  }

  return normalized
}

const API_BASE_URL = resolveApiBaseUrl(normalizeConfiguredApiBase(RAW_API_BASE_URL))

function isNetworkFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('failed to fetch') || message.includes('networkerror')
}

function getApiFallbackCandidates(path: string): string[] {
  const candidateUrls: string[] = []
  const seenResolved = new Set<string>()

  const addCandidate = (url: string) => {
    if (!url) return
    if (typeof window !== 'undefined') {
      try {
        const resolved = new URL(url, window.location.href).href
        if (seenResolved.has(resolved)) return
        seenResolved.add(resolved)
      } catch {
        if (candidateUrls.includes(url)) return
      }
    } else if (candidateUrls.includes(url)) {
      return
    }
    candidateUrls.push(url)
  }

  if (API_BASE_URL) {
    addCandidate(`${API_BASE_URL}${path}`)
  }

  // Same-origin `/api` (Vite proxy, nginx, or platform routing). Always try in the browser
  // so a wrong absolute API_BASE_URL (e.g. frontend host that returns 405 on POST) can fall back.
  if (typeof window !== 'undefined') {
    addCandidate(path)
  }

  return candidateUrls
}

function isJsonApiPath(path: string): boolean {
  return path.startsWith('/api/') || path.startsWith('/health')
}

/** SPA shells often return 200 + text/html for /api/* when nginx is not proxying to FastAPI. */
function responseLooksLikeHtml(response: Response): boolean {
  const ct = (response.headers.get('content-type') || '').toLowerCase()
  return ct.includes('text/html')
}

async function fetchWithApiFallback(path: string, init?: RequestInit): Promise<Response> {
  const candidateUrls = getApiFallbackCandidates(path)
  let lastError: unknown = null

  for (let index = 0; index < candidateUrls.length; index += 1) {
    const candidate = candidateUrls[index]
    const hasMoreCandidates = index < candidateUrls.length - 1

    try {
      const response = await fetch(candidate, init)

      if (response.ok) {
        if (isJsonApiPath(path) && responseLooksLikeHtml(response)) {
          if (hasMoreCandidates) {
            continue
          }
          throw new Error(
            'This URL returned a web page (HTML) instead of API JSON. Set VITE_API_URL on the frontend service to your backend HTTPS URL so nginx can proxy /api and /health (see frontend-entrypoint.sh), or fix your reverse proxy.',
          )
        }
        return response
      }

      if (hasMoreCandidates && [404, 405, 500, 502, 503].includes(response.status)) {
        continue
      }

      return response
    } catch (error) {
      lastError = error

      if (!hasMoreCandidates || !isNetworkFetchError(error)) {
        throw error
      }
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error('Failed to execute API request')
}

/** Multipart uploads must use a fresh FormData per attempt (body may not be reusable after a failed fetch). */
async function fetchWithApiFallbackMultipart(
  path: string,
  token: string,
  buildFormData: () => FormData,
): Promise<Response> {
  const candidateUrls = getApiFallbackCandidates(path)
  let lastError: unknown = null

  for (let index = 0; index < candidateUrls.length; index += 1) {
    const candidate = candidateUrls[index]
    const hasMoreCandidates = index < candidateUrls.length - 1

    try {
      const response = await fetch(candidate, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: buildFormData(),
      })

      if (response.ok) {
        if (isJsonApiPath(path) && responseLooksLikeHtml(response)) {
          if (hasMoreCandidates) {
            continue
          }
          throw new Error(
            'This URL returned HTML instead of an API response. Check /api proxy and VITE_API_URL on the frontend container.',
          )
        }
        return response
      }

      if (hasMoreCandidates && [404, 405, 500, 502, 503].includes(response.status)) {
        continue
      }

      return response
    } catch (error) {
      lastError = error

      if (!hasMoreCandidates || !isNetworkFetchError(error)) {
        throw error
      }
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error('Failed to execute API request')
}

import { DemoLimits } from './demo-limits';

export interface ExecuteRequest {
  code: string
  language: string
}

export interface ExecuteResponse {
  success: boolean
  output: string
  error?: string
  execution_time: number
}

export interface SqlSchemaTable {
  name: string
  primary_key: string
  columns: string[]
  description?: string
  /** Sample rows matching the in-memory practice DB (for spreadsheet-style preview). */
  sample_rows?: Record<string, string | number | null>[]
}

export interface SqlPracticeSchemaResponse {
  tables: SqlSchemaTable[]
}

export interface AdminStudent {
  id: number
  email: string
  full_name: string
  role: string
  xp_points: number
  streak_days: number
  credit_balance: number
  selected_role_id: number | null
  cohort_name: string | null
  batch_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminStudentCreatePayload {
  email: string
  full_name: string
  password: string
  role: string
  xp_points: number
  streak_days: number
  credit_balance: number
  selected_role_id: number | null
  cohort_name: string | null
  batch_name: string | null
  is_active: boolean
}

export interface AdminStudentUpdatePayload {
  full_name?: string
  role?: string
  xp_points?: number
  streak_days?: number
  credit_balance?: number
  selected_role_id?: number | null
  cohort_name?: string | null
  batch_name?: string | null
  is_active?: boolean
}

export interface AdminMetrics {
  total_students: number
  total_admins: number
  active_students: number
  inactive_students: number
  average_credits: number
  average_xp_points: number
}

export interface AdminMonthlyKpis {
  month_label: string
  total_enrolled_students: number
  enquiries_this_month: number
  classes_starting_this_month: number
  classes_completing_this_month: number
  active_classes_running: number
  open_jobs: number
  hires_this_month: number
}

export interface AdminActivityLog {
  id: number
  admin_user_id: number
  target_user_id: number | null
  action: string
  details: string | null
  created_at: string
}

export interface AdminPieSlice {
  label: string
  value: number
}

export interface AdminBatch {
  id: number
  name: string
  track: string
  days: string
  time_ist: string
  mode: string
  mentor_name: string | null
  start_date: string
  seats_total: number
  seats_filled: number
}

export interface AdminClassStudent {
  user_id: number
  full_name: string
  enrollment_role: string
  college_info: string | null
  year_or_grad: string | null
  attendance_pct: number
  project_title: string | null
  project_status: string
}

export interface AdminClassInsights {
  batch: AdminBatch
  attendance_pie: AdminPieSlice[]
  project_status_pie: AdminPieSlice[]
  students: AdminClassStudent[]
}

export type AdminJobListFilter = 'all' | 'fixture' | 'live'

export interface AdminJobPost {
  id: number
  title: string
  company_name: string
  location: string
  employment_type: string
  description: string | null
  external_apply_url?: string | null
  listing_metadata?: Record<string, unknown> | null
  status: string
  is_fixture: boolean
  sort_order: number
  eligible_batch_id: number | null
  eligible_batch_name: string | null
  applications_count: number
  created_at: string
}

export interface AdminJobCreatePayload {
  title: string
  company_name: string
  location: string
  employment_type: string
  description?: string | null
  eligible_batch_id?: number | null
}

export interface AdminRoleInsightItem {
  label: string
  value: number
}

export interface AdminRoleSplitInsights {
  student_insights: AdminRoleInsightItem[]
  faculty_insights: AdminRoleInsightItem[]
}

export interface AdminRegistrationWaitlistEntry {
  id: number
  email: string
  full_name: string | null
  source: string
  status: 'pending' | 'approved' | 'rejected'
  attempt_count: number
  first_attempted_at: string
  last_attempted_at: string
}

export interface AdminUserActivity {
  id: number
  user_id: number | null
  event_type: string
  route: string
  method: string | null
  status_code: number | null
  duration_ms: number | null
  metadata_json: string | null
  occurred_at: string
}

export interface DatabaseHealth {
  status: 'ok' | 'error'
  database: string
  detail?: string
}

export type TypingMode = 'sentence' | 'code'
export type TypingTestType = 'timed' | 'length'

export interface TypingAttempt {
  id: number
  mode: TypingMode
  test_type: TypingTestType
  test_option: string
  language: string | null
  wpm: number
  raw_wpm: number
  accuracy: number
  error_count: number
  elapsed_seconds: number
  created_at: string
}

export interface CreateTypingAttemptPayload {
  mode: TypingMode
  test_type: TypingTestType
  test_option: string
  language?: string
  prompt_text: string
  typed_text: string
  wpm: number
  raw_wpm: number
  accuracy: number
  error_count: number
  elapsed_seconds: number
}

/**
 * Execute code on the backend
 */
export async function executeCode(
  code: string,
  language: string,
  signal?: AbortSignal,
): Promise<ExecuteResponse> {
  if (!DemoLimits.canExecuteCode()) {
    DemoLimits.triggerLimitReachedError();
    return {
      success: false,
      output: '',
      error: 'Execution limit reached',
      execution_time: 0,
    };
  }

  try {
    const token = localStorage.getItem('career-portal-token')
    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {}
    const response = await fetchWithApiFallback('/api/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        code,
        language,
      }),
      signal,
    })

    if (!response.ok) {
      if (response.status === 405 && !API_BASE_URL) {
        throw new Error(
          'Sandbox backend is not configured for production. Set VITE_API_URL to your backend Railway URL and redeploy frontend.'
        )
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Increment the execution counter on successful API calls
    DemoLimits.incrementExecutionCount()

    // Optional: Trigger a warning toast if executions are running low
    const remaining = DemoLimits.getRemainingExecutions()
    if (remaining <= 3) {
      import('sonner').then(({ toast }) => {
        toast.warning(`Only ${remaining} executions left!`)
      });
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message || 'Failed to execute code',
      execution_time: 0,
    }
  }
}

export async function fetchSqlPracticeSchema(): Promise<SqlPracticeSchemaResponse> {
  const response = await fetchWithApiFallback('/api/v1/sql/schema')
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }
  return response.json() as Promise<SqlPracticeSchemaResponse>
}

export async function fetchDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const response = await fetchWithApiFallback('/health/db')
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      return {
        status: 'error',
        database: payload.database ?? 'unreachable',
        detail: payload.detail ?? `HTTP error ${response.status}`,
      }
    }
    return response.json() as Promise<DatabaseHealth>
  } catch {
    return {
      status: 'error',
      database: 'unreachable',
      detail: 'Network error — check that the API is running and reachable.',
    }
  }
}

export async function createTypingAttempt(
  payload: CreateTypingAttemptPayload,
): Promise<TypingAttempt> {
  const response = await fetchWithApiFallback('/api/v1/typing/attempts', {
    method: 'POST',
    headers: getOptionalAuthHeaders(),
    body: JSON.stringify(payload),
  })

  return parseOrThrow(response) as Promise<TypingAttempt>
}

export async function fetchTypingAttempts(limit = 20): Promise<TypingAttempt[]> {
  const response = await fetchWithApiFallback(`/api/v1/typing/attempts?limit=${limit}`, {
    headers: getOptionalAuthHeaders(),
  })

  return parseOrThrow(response) as Promise<TypingAttempt[]>
}

function buildAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/** Bearer-authenticated requests with same-origin `/api` fallback (matches student execute/progress). */
async function fetchWithAuthApiFallback(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const merged = new Headers(buildAuthHeaders(token))
  if (init.headers !== undefined) {
    new Headers(init.headers as HeadersInit).forEach((value, key) => {
      merged.set(key, value)
    })
  }
  return fetchWithApiFallback(path, { ...init, headers: merged })
}

function getOptionalAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('career-portal-token')
  if (!token) {
    return {
      'Content-Type': 'application/json',
    }
  }

  return buildAuthHeaders(token)
}

async function parseOrThrow(response: Response) {
  const raw = await response.text()
  const trimmed = raw.trim()

  if (trimmed.startsWith('<')) {
    throw new Error(
      !response.ok
        ? `HTTP ${response.status}: received HTML instead of a JSON error. Likely /api is not proxied to FastAPI.`
        : 'Received HTML instead of JSON (the SPA shell is answering /api). Set VITE_API_URL on the Railway frontend service to your backend HTTPS URL so nginx proxies /api and /health — see frontend-entrypoint.sh.',
    )
  }

  if (!response.ok) {
    if (!trimmed) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    let errorData: { detail?: unknown }
    try {
      errorData = JSON.parse(trimmed) as { detail?: unknown }
    } catch {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const d = errorData.detail
    throw new Error(typeof d === 'string' && d ? d : `HTTP error! status: ${response.status}`)
  }

  if (!trimmed) {
    return null
  }

  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    throw new Error('Invalid JSON from server')
  }
}

export async function fetchAdminStudents(token: string, search?: string, limit = 500): Promise<AdminStudent[]> {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (search?.trim()) params.set('search', search.trim())
  const query = `?${params.toString()}`
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/students${query}`, token)
  return parseOrThrow(response) as Promise<AdminStudent[]>
}

export async function fetchAdminMetrics(token: string): Promise<AdminMetrics> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/metrics', token)
  return parseOrThrow(response) as Promise<AdminMetrics>
}

export async function fetchAdminMonthlyKpis(token: string): Promise<AdminMonthlyKpis> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/kpis/monthly', token)
  return parseOrThrow(response) as Promise<AdminMonthlyKpis>
}

export async function fetchAdminActivity(token: string, limit = 20): Promise<AdminActivityLog[]> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/activity?limit=${limit}`, token)
  return parseOrThrow(response) as Promise<AdminActivityLog[]>
}

export async function fetchAdminBatches(token: string): Promise<AdminBatch[]> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/batches', token)
  return parseOrThrow(response) as Promise<AdminBatch[]>
}

export async function fetchAdminClassInsights(token: string, batchId: number): Promise<AdminClassInsights> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/batches/${batchId}/insights`, token)
  return parseOrThrow(response) as Promise<AdminClassInsights>
}

export async function fetchAdminJobs(
  token: string,
  filter: AdminJobListFilter = 'all',
): Promise<AdminJobPost[]> {
  const response = await fetchWithAuthApiFallback(
    `/api/v1/admin/jobs?filter=${encodeURIComponent(filter)}`,
    token,
  )
  return parseOrThrow(response) as Promise<AdminJobPost[]>
}

export async function reorderAdminJobs(
  token: string,
  orderedJobIds: number[],
): Promise<AdminJobPost[]> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/jobs/reorder', token, {
    method: 'PUT',
    body: JSON.stringify({ ordered_job_ids: orderedJobIds }),
  })
  return parseOrThrow(response) as Promise<AdminJobPost[]>
}

export async function seedAdminFixtureJobs(token: string): Promise<{ upserted: number; message: string }> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/jobs/seed-fixture', token, {
    method: 'POST',
  })
  return parseOrThrow(response) as Promise<{ upserted: number; message: string }>
}

export async function createAdminJob(token: string, payload: AdminJobCreatePayload): Promise<AdminJobPost> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/jobs', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminJobPost>
}

export async function fetchAdminRoleSplitInsights(token: string): Promise<AdminRoleSplitInsights> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/role-split-insights', token)
  return parseOrThrow(response) as Promise<AdminRoleSplitInsights>
}

export async function createAdminStudent(token: string, payload: AdminStudentCreatePayload): Promise<AdminStudent> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/students', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminStudent>
}

export async function updateAdminStudent(
  token: string,
  studentId: number,
  payload: AdminStudentUpdatePayload
): Promise<AdminStudent> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/students/${studentId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminStudent>
}

export async function fetchAdminRegistrationWaitlist(
  token: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<AdminRegistrationWaitlistEntry[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/registration-waitlist${query}`, token)
  return parseOrThrow(response) as Promise<AdminRegistrationWaitlistEntry[]>
}

export async function updateAdminRegistrationWaitlistStatus(
  token: string,
  entryId: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<AdminRegistrationWaitlistEntry> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/registration-waitlist/${entryId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return parseOrThrow(response) as Promise<AdminRegistrationWaitlistEntry>
}

export async function fetchAdminUserActivity(token: string, limit = 50): Promise<AdminUserActivity[]> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/user-activity?limit=${limit}`, token)
  return parseOrThrow(response) as Promise<AdminUserActivity[]>
}

// ── Platform overview ──────────────────────────────────────────────────────────

export interface AdminPlatformOverview {
  total_users: number
  active_users: number
  total_admins: number
  total_batches: number
  active_batches: number
  total_jobs_open: number
  total_jobs_closed: number
  total_job_applications: number
  total_hires: number
  catalog_quizzes: number
  catalog_projects: number
  waitlist_pending: number
  waitlist_approved: number
  waitlist_rejected: number
}

export async function fetchAdminPlatformOverview(token: string): Promise<AdminPlatformOverview> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/overview', token)
  return parseOrThrow(response) as Promise<AdminPlatformOverview>
}

// ── Batch CRUD ─────────────────────────────────────────────────────────────────

export interface AdminBatchCreatePayload {
  name: string
  track: string
  days: string
  time_ist: string
  mode: string
  start_date: string
  seats_total: number
}

export interface AdminBatchUpdatePayload {
  name?: string
  track?: string
  days?: string
  time_ist?: string
  mode?: string
  start_date?: string
  seats_total?: number
}

export async function createAdminBatch(token: string, payload: AdminBatchCreatePayload): Promise<AdminBatch> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/batches', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminBatch>
}

export async function updateAdminBatch(token: string, batchId: number, payload: AdminBatchUpdatePayload): Promise<AdminBatch> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/batches/${batchId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminBatch>
}

export async function deleteAdminBatch(token: string, batchId: number): Promise<void> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/batches/${batchId}`, token, {
    method: 'DELETE',
  })
  await parseOrThrow(response)
}

// ── Job update / delete ────────────────────────────────────────────────────────

export interface AdminJobUpdatePayload {
  title?: string
  company_name?: string
  location?: string
  employment_type?: string
  description?: string
  status?: 'open' | 'closed'
  is_fixture?: boolean
  sort_order?: number
  eligible_batch_id?: number | null
}

export async function updateAdminJob(token: string, jobId: number, payload: AdminJobUpdatePayload): Promise<AdminJobPost> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/jobs/${jobId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminJobPost>
}

export async function deleteAdminJob(token: string, jobId: number): Promise<void> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/jobs/${jobId}`, token, {
    method: 'DELETE',
  })
  await parseOrThrow(response)
}

export interface JobImportRowError {
  row: number
  detail: string
}

export interface JobImportResult {
  created: number
  skipped: number
  closed_previous?: number
  errors: JobImportRowError[]
}

export async function downloadAdminJobImportTemplate(token: string): Promise<Blob> {
  const response = await fetchWithAuthApiFallback('/api/v1/admin/jobs/import-template', token)
  if (!response.ok) {
    const text = await response.text()
    let message = `Failed to download job import template (HTTP ${response.status})`
    try {
      const data = JSON.parse(text) as { detail?: unknown }
      if (data.detail !== undefined) {
        const d = data.detail
        message = typeof d === 'string' ? d : JSON.stringify(d).slice(0, 500)
      }
    } catch {
      if (text.trim()) {
        message = text.slice(0, 500)
      }
    }
    throw new Error(message)
  }
  return response.blob()
}

function parseJobImportJsonBody(text: string, response: Response): JobImportResult {
  try {
    return JSON.parse(text) as JobImportResult
  } catch {
    throw new Error(
      `Import failed (HTTP ${response.status}). The server response was not JSON. Check that the backend is running and the admin API URL matches your dev proxy.`,
    )
  }
}

function throwIfJobImportHttpFailed(response: Response, data: unknown): void {
  if (response.ok) return
  const p = data as { errors?: { row: number; detail: string }[]; detail?: unknown }
  if (p.errors?.length) {
    throw new Error(p.errors.map((e) => `Row ${e.row}: ${e.detail}`).join('; '))
  }
  if (p.detail !== undefined) {
    const d = p.detail
    throw new Error(typeof d === 'string' ? d : JSON.stringify(d).slice(0, 500))
  }
  throw new Error(`Import failed (HTTP ${response.status})`)
}

export async function importAdminJobsFromExcel(token: string, file: File): Promise<JobImportResult> {
  const response = await fetchWithApiFallbackMultipart('/api/v1/admin/jobs/import', token, () => {
    const formData = new FormData()
    formData.append('file', file, file.name || 'jobs.xlsx')
    return formData
  })
  const text = await response.text()
  const data = parseJobImportJsonBody(text, response)
  throwIfJobImportHttpFailed(response, data)
  return data
}

export async function importAdminJobsFromLinkedInJson(
  token: string,
  file: File,
  replaceOpenJobs: boolean,
): Promise<JobImportResult> {
  const response = await fetchWithApiFallbackMultipart(
    '/api/v1/admin/jobs/import-linkedin-json',
    token,
    () => {
      const formData = new FormData()
      formData.append('file', file, file.name || 'linkedin-jobs.json')
      formData.append('replace_open_jobs', replaceOpenJobs ? 'true' : 'false')
      return formData
    },
  )
  const text = await response.text()
  const data = parseJobImportJsonBody(text, response)
  throwIfJobImportHttpFailed(response, data)
  return data
}

// ── Student delete ─────────────────────────────────────────────────────────────

export async function deleteAdminStudent(token: string, studentId: number): Promise<void> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/students/${studentId}`, token, {
    method: 'DELETE',
  })
  await parseOrThrow(response)
}

// ── Catalog types ──────────────────────────────────────────────────────────────

export type CatalogQuizQuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'code-completion'
  | 'code-output'

interface CatalogBaseQuestion {
  id: number
  type: CatalogQuizQuestionType
  title: string
  prompt: string
  explanation: string
  code?: string | null
  language?: string | null
}

export interface CatalogChoiceQuestion extends CatalogBaseQuestion {
  type: 'multiple-choice' | 'true-false'
  options: string[]
  correctIndex: number
}

export interface CatalogCodeCompletionQuestion extends CatalogBaseQuestion {
  type: 'code-completion'
  answer: string
  acceptableAnswers?: string[] | null
}

export interface CatalogCodeOutputQuestion extends CatalogBaseQuestion {
  type: 'code-output'
  expectedOutput: string
}

export type CatalogQuizQuestion =
  | CatalogChoiceQuestion
  | CatalogCodeCompletionQuestion
  | CatalogCodeOutputQuestion

export interface CatalogQuiz {
  id: string
  title: string
  description: string
  difficulty: 'beginner'
  estimatedTime: string
  questions: CatalogQuizQuestion[]
}

export interface CatalogQuizSummary {
  id: string
  title: string
  description: string
  difficulty: 'beginner'
  estimatedTime: string
  questionCount: number
}

export interface TddTestCase {
  input_data?: unknown
  expected_output?: string
  validation_regex?: string
  hidden: boolean
}

export interface CatalogProjectStepContent {
  description?: string | null
  points?: string[] | null
  code?: string | null
  language?: string | null
  challenge?: string | null
  hint?: string | null
  walkthroughGif?: string | null
  walkthroughCaption?: string | null
  // TDD fields (populated for Python/code-validated projects)
  initialCode?: string | null
  callableName?: string | null
  testCases?: TddTestCase[] | null
}

export interface CatalogProjectStep {
  id: number
  slug?: string | null
  title: string
  type: 'understanding' | 'logic' | 'code' | 'preview' | 'challenge'
  content: CatalogProjectStepContent
  /** Optional YouTube video ID to show a step-specific tutorial in the builder. */
  videoId?: string
}

export interface CatalogProject {
  id: string
  title: string
  description: string
  shortDescription: string
  difficulty: 'beginner'
  estimatedTime: string
  steps: CatalogProjectStep[]
}

export interface CatalogProjectSummary {
  id: string
  title: string
  description: string
  shortDescription: string
  difficulty: 'beginner'
  estimatedTime: string
  stepCount: number
}

// ── Catalog fetch functions ────────────────────────────────────────────────────
// These try the backend first and fall back to the bundled static catalog so
// the app works without a running backend (e.g. local dev, demo mode).

import {
  CATALOG_QUIZ_SUMMARIES,
  CATALOG_QUIZZES,
  CATALOG_PROJECT_SUMMARIES,
  CATALOG_PROJECTS,
} from './catalog-data'

export async function fetchCatalogQuizzes(): Promise<CatalogQuizSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/catalog`)
    if (!response.ok) return CATALOG_QUIZ_SUMMARIES
    return (await response.json()) as CatalogQuizSummary[]
  } catch {
    return CATALOG_QUIZ_SUMMARIES
  }
}

export async function fetchCatalogQuiz(slug: string): Promise<CatalogQuiz> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/catalog/${encodeURIComponent(slug)}`)
    if (!response.ok) throw new Error('not ok')
    return (await response.json()) as CatalogQuiz
  } catch {
    const found = CATALOG_QUIZZES.find((q) => q.id === slug)
    if (!found) throw new Error(`Quiz "${slug}" not found`)
    return found
  }
}

export async function fetchCatalogProjects(): Promise<CatalogProjectSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/catalog`)
    if (!response.ok) return CATALOG_PROJECT_SUMMARIES
    return (await response.json()) as CatalogProjectSummary[]
  } catch {
    return CATALOG_PROJECT_SUMMARIES
  }
}

export async function fetchCatalogProject(slug: string): Promise<CatalogProject> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/catalog/${encodeURIComponent(slug)}`)
    if (!response.ok) throw new Error('not ok')
    const data = (await response.json()) as CatalogProject
    // Merge videoId from static catalog — this field is frontend-only and is
    // not stored in the backend DB, so we inject it here after fetching.
    const staticProject = CATALOG_PROJECTS.find((p) => p.id === slug)
    if (staticProject) {
      data.steps = data.steps.map((step, i) => ({
        ...step,
        videoId: staticProject.steps[i]?.videoId ?? step.videoId,
      }))
    }
    return data
  } catch {
    const found = CATALOG_PROJECTS.find((p) => p.id === slug)
    if (!found) throw new Error(`Project "${slug}" not found`)
    return found
  }
}

// Alias for TDD project fetching — same endpoint, richer return type.
export const fetchProjectBySlug = fetchCatalogProject

// ── User progress ──────────────────────────────────────────────────────────────

export interface CompletedStep {
  projectSlug: string
  stepId: number
}

export interface UserCatalogProgress {
  completedSteps: CompletedStep[]
}

export interface StageProgressRecord {
  stage_id: number
  lessons_completed: number
  total_lessons: number
  exercises_completed_pct: number
  latest_quiz_score: number
  unlocked: boolean
}

function studentAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('career-portal-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchUserProgress(): Promise<UserCatalogProgress> {
  const response = await fetchWithApiFallback('/api/v1/progress/catalog', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<UserCatalogProgress>
}

export async function fetchMyStageProgress(): Promise<StageProgressRecord[]> {
  const response = await fetchWithApiFallback('/api/v1/progress/me', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<StageProgressRecord[]>
}

export interface StudentJobOpen {
  id: number
  title: string
  company_name: string
  location: string
  employment_type: string
  description: string | null
  external_apply_url?: string | null
  listing_metadata?: Record<string, unknown> | null
  eligible_batch_id: number | null
  eligible_batch_name: string | null
  created_at: string
}

export interface JobApplyResult {
  job_id: number
  status: string
  message: string
}

export async function fetchOpenJobs(): Promise<StudentJobOpen[]> {
  const response = await fetchWithApiFallback('/api/v1/jobs/open', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<StudentJobOpen[]>
}

export async function applyToJob(jobId: number): Promise<JobApplyResult> {
  const token = localStorage.getItem('career-portal-token')
  if (!token) {
    throw new Error('Sign in to apply to jobs.')
  }
  const response = await fetchWithApiFallback(`/api/v1/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseOrThrow(response) as Promise<JobApplyResult>
}

export interface StudentJobApplicationItem {
  job_id: number
  title: string
  company_name: string
  status: string
  created_at: string
}

export interface StudentJobApplicationsMe {
  count: number
  items: StudentJobApplicationItem[]
}

export async function fetchStudentJobApplications(): Promise<StudentJobApplicationsMe> {
  const response = await fetchWithApiFallback('/api/v1/jobs/applications/me', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<StudentJobApplicationsMe>
}

export interface EnrollmentMe {
  attendance_pct: number | null
  batch_names: string[]
}

export async function fetchMyEnrollment(): Promise<EnrollmentMe> {
  const response = await fetchWithApiFallback('/api/v1/enrollment/me', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<EnrollmentMe>
}

export interface MySubmittedProject {
  id: number
  stage_id: number
  title: string
  status: string
  github_link: string | null
}

export async function fetchMySubmittedProjects(): Promise<MySubmittedProject[]> {
  const response = await fetchWithApiFallback('/api/v1/projects/me', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<MySubmittedProject[]>
}

export async function saveProjectStepProgress(projectSlug: string, stepId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/progress/project/${encodeURIComponent(projectSlug)}/step/${stepId}`,
    { method: 'POST' },
  )
  if (!response.ok) {
    // Non-blocking: log but don't crash the UI
    console.warn('Failed to save step progress:', response.status)
  }
}

export interface StepProgressPayload {
  step_id: number
  code_snapshot?: string
  passed: boolean
}

export interface ProjectProgressResponse {
  projectSlug: string
  completedStepIds: number[]
  nextStepId: number
}

async function getAuthHeadersForProjectWrites(): Promise<Record<string, string>> {
  const token = localStorage.getItem('career-portal-token')

  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        'Content-Type': 'application/json',
      }
}

export async function fetchProjectProgress(projectSlug: string): Promise<ProjectProgressResponse> {
  const headers = await getAuthHeadersForProjectWrites()
  const response = await fetch(
    `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectSlug)}/progress`,
    { headers },
  )
  return parseOrThrow(response) as Promise<ProjectProgressResponse>
}

export async function saveProjectProgressStep(
  projectSlug: string,
  payload: StepProgressPayload,
): Promise<void> {
  const headers = await getAuthHeadersForProjectWrites()
  const response = await fetch(
    `${API_BASE_URL}/api/v1/projects/${encodeURIComponent(projectSlug)}/progress`,
    { method: 'POST', headers, body: JSON.stringify(payload) },
  )

  if (!response.ok) {
    const payloadError = await response.json().catch(() => ({}))
    throw new Error(payloadError.detail || `Failed to persist step progress (${response.status})`)
  }
}

export async function saveStepProgress(projectSlug: string, payload: StepProgressPayload): Promise<void> {
  const headers = await getAuthHeadersForProjectWrites()
  const response = await fetch(
    `${API_BASE_URL}/api/v1/projects/catalog/${encodeURIComponent(projectSlug)}/progress`,
    { method: 'POST', headers, body: JSON.stringify(payload) },
  )
  if (!response.ok) {
    console.warn('Failed to save step progress:', response.status)
  }
}

// ── Schedule & Deadlines ───────────────────────────────────────────────────────

export interface UpcomingSession {
  id: number
  batch_name: string
  title: string
  topic: string | null
  session_date: string
  start_time: string
  end_time: string
  status: string
}

export interface DeadlineQuizItem {
  quiz_id: number
  title: string
  due_date: string
  passed: boolean
}

export interface DeadlineStageItem {
  stage_id: number
  title: string
  due_date: string
  unlocked: boolean
}

export interface UpcomingDeadlines {
  quizzes: DeadlineQuizItem[]
  stages: DeadlineStageItem[]
}

export async function fetchUpcomingSchedule(limit = 5): Promise<UpcomingSession[]> {
  const response = await fetchWithApiFallback(`/api/v1/schedule/upcoming?limit=${limit}`, {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<UpcomingSession[]>
}

export async function fetchUpcomingDeadlines(): Promise<UpcomingDeadlines> {
  const response = await fetchWithApiFallback('/api/v1/schedule/deadlines', {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<UpcomingDeadlines>
}

export type CalendarEventType = 'class' | 'quiz' | 'project'

export interface CalendarEvent {
  id: string
  event_type: CalendarEventType
  title: string
  subtitle: string | null
  event_date: string
  start_time: string
  end_time: string
  batch_name: string | null
  status: string | null
}

export interface CalendarEventsResponse {
  start_date: string
  end_date: string
  events: CalendarEvent[]
}

export interface FetchCalendarEventsParams {
  startDate?: string
  endDate?: string
  includeClasses?: boolean
  includeQuizzes?: boolean
  includeProjects?: boolean
}

export async function fetchCalendarEvents(
  params: FetchCalendarEventsParams = {},
): Promise<CalendarEventsResponse> {
  const qs = new URLSearchParams()
  if (params.startDate) qs.set('start_date', params.startDate)
  if (params.endDate) qs.set('end_date', params.endDate)
  if (params.includeClasses === false) qs.set('include_classes', 'false')
  if (params.includeQuizzes === false) qs.set('include_quizzes', 'false')
  if (params.includeProjects === false) qs.set('include_projects', 'false')
  const query = qs.toString()
  const path = `/api/v1/schedule/calendar${query ? `?${query}` : ''}`
  const response = await fetchWithApiFallback(path, {
    headers: { ...studentAuthHeaders() },
  })
  return parseOrThrow(response) as Promise<CalendarEventsResponse>
}

// ── Student feedback ───────────────────────────────────────────────────────────

export type FeedbackCategory = 'general' | 'concern' | 'bug' | 'suggestion'
export type FeedbackStatus = 'pending' | 'reviewed'

export interface FeedbackCreatePayload {
  category: FeedbackCategory
  message: string
}

export interface StudentFeedbackSubmission {
  id: number
  category: string
  message: string
  status: string
  created_at: string
}

export interface AdminFeedbackItem {
  id: number
  user_id: number
  student_name: string
  student_email: string
  category: string
  message: string
  status: FeedbackStatus
  admin_notes: string | null
  reviewed_by_user_id: number | null
  reviewed_at: string | null
  created_at: string
}

export async function submitStudentFeedback(
  payload: FeedbackCreatePayload,
): Promise<StudentFeedbackSubmission> {
  const response = await fetchWithApiFallback('/api/v1/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...studentAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<StudentFeedbackSubmission>
}

export async function fetchAdminFeedback(
  token: string,
  params: { status?: 'pending' | 'all'; limit?: number } = {},
): Promise<AdminFeedbackItem[]> {
  const qs = new URLSearchParams()
  qs.set('status', params.status ?? 'all')
  qs.set('limit', String(params.limit ?? 100))
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/feedback?${qs}`, token)
  return parseOrThrow(response) as Promise<AdminFeedbackItem[]>
}

export async function reviewAdminFeedback(
  token: string,
  feedbackId: number,
  payload: { admin_notes?: string | null } = {},
): Promise<AdminFeedbackItem> {
  const response = await fetchWithAuthApiFallback(`/api/v1/admin/feedback/${feedbackId}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'reviewed', ...payload }),
  })
  return parseOrThrow(response) as Promise<AdminFeedbackItem>
}

// ── Career Mapper ──────────────────────────────────────────────────────────────

import type { CareerRole } from '@/types/career'
import { careerSeedData } from '@/lib/career-seed-data'

interface BackendRoleBasic {
  id: number
  name: string
  skills_required: string[]
  salary_range: string
  companies_hiring: string[]
  difficulty_level: string
  estimated_duration_weeks: number
}

/**
 * Fetches career roles merging backend metadata with frontend seed data (syllabus).
 * Falls back to seed data if the backend is unavailable.
 */
export async function fetchCareerRoles(): Promise<CareerRole[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/roles`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const backendRoles: BackendRoleBasic[] = await response.json()
    const enriched = backendRoles
      .map((br) => {
        const slug = br.name.toLowerCase().replace(/\s+/g, '-')
        const seed = careerSeedData.find((r) => r.slug === slug)
        if (!seed) return null
        return { ...seed, skills: br.skills_required }
      })
      .filter((r): r is CareerRole => r !== null)
    return enriched.length > 0 ? enriched : careerSeedData.filter((r) => r.isActive)
  } catch {
    return careerSeedData.filter((r) => r.isActive)
  }
}

export async function fetchCareerRole(slug: string): Promise<CareerRole> {
  const roles = await fetchCareerRoles()
  const role = roles.find((r) => r.slug === slug)
  if (!role) throw new Error(`Career role not found: ${slug}`)
  return role
}


