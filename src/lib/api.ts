/**
 * API client for backend code execution
 */

type RuntimeConfig = {
  VITE_API_URL?: string
  VITE_API_BASE_URL?: string
  VITE_API_PROXY_TARGET?: string
}

const runtimeConfig: RuntimeConfig =
  typeof window !== 'undefined' && (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
    ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__!
    : {}

const RAW_API_BASE_URL =
  runtimeConfig.VITE_API_URL ||
  runtimeConfig.VITE_API_BASE_URL ||
  runtimeConfig.VITE_API_PROXY_TARGET ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_PROXY_TARGET ||
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

async function fetchWithApiFallback(path: string, init?: RequestInit): Promise<Response> {
  const candidateUrls: string[] = []
  const addCandidate = (url: string) => {
    if (!url || candidateUrls.includes(url)) return
    candidateUrls.push(url)
  }

  if (API_BASE_URL) {
    addCandidate(`${API_BASE_URL}${path}`)
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocalHost = host === 'localhost' || host === '127.0.0.1'
    if (!API_BASE_URL || isLocalHost) {
      addCandidate(path)
    }
  }

  let lastError: unknown = null

  for (let index = 0; index < candidateUrls.length; index += 1) {
    const candidate = candidateUrls[index]
    const hasMoreCandidates = index < candidateUrls.length - 1

    try {
      const response = await fetch(candidate, init)

      if (response.ok) {
        return response
      }

      if (hasMoreCandidates && [404, 405, 502, 503].includes(response.status)) {
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

export interface AdminJobPost {
  id: number
  title: string
  company_name: string
  location: string
  employment_type: string
  description: string | null
  status: string
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
  const response = await fetch(`${API_BASE_URL}/health/db`)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    return {
      status: 'error',
      database: payload.database ?? 'unreachable',
      detail: payload.detail ?? `HTTP error ${response.status}`,
    }
  }
  return response.json() as Promise<DatabaseHealth>
}

export async function createTypingAttempt(
  payload: CreateTypingAttemptPayload,
): Promise<TypingAttempt> {
  const response = await fetch(`${API_BASE_URL}/api/v1/typing/attempts`, {
    method: 'POST',
    headers: getOptionalAuthHeaders(),
    body: JSON.stringify(payload),
  })

  return parseOrThrow(response) as Promise<TypingAttempt>
}

export async function fetchTypingAttempts(limit = 20): Promise<TypingAttempt[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/typing/attempts?limit=${limit}`, {
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function fetchAdminStudents(token: string, search?: string): Promise<AdminStudent[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/students${query}`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminStudent[]>
}

export async function fetchAdminMetrics(token: string): Promise<AdminMetrics> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/metrics`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminMetrics>
}

export async function fetchAdminMonthlyKpis(token: string): Promise<AdminMonthlyKpis> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/kpis/monthly`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminMonthlyKpis>
}

export async function fetchAdminActivity(token: string, limit = 20): Promise<AdminActivityLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/activity?limit=${limit}`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminActivityLog[]>
}

export async function fetchAdminBatches(token: string): Promise<AdminBatch[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/batches`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminBatch[]>
}

export async function fetchAdminClassInsights(token: string, batchId: number): Promise<AdminClassInsights> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/batches/${batchId}/insights`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminClassInsights>
}

export async function fetchAdminJobs(token: string): Promise<AdminJobPost[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/jobs`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminJobPost[]>
}

export async function createAdminJob(token: string, payload: AdminJobCreatePayload): Promise<AdminJobPost> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/jobs`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminJobPost>
}

export async function fetchAdminRoleSplitInsights(token: string): Promise<AdminRoleSplitInsights> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/role-split-insights`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminRoleSplitInsights>
}

export async function createAdminStudent(token: string, payload: AdminStudentCreatePayload): Promise<AdminStudent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/students`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminStudent>
}

export async function updateAdminStudent(
  token: string,
  studentId: number,
  payload: AdminStudentUpdatePayload
): Promise<AdminStudent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/students/${studentId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminStudent>
}

export async function fetchAdminRegistrationWaitlist(
  token: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<AdminRegistrationWaitlistEntry[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/registration-waitlist${query}`, {
    headers: buildAuthHeaders(token),
  })
  return parseOrThrow(response) as Promise<AdminRegistrationWaitlistEntry[]>
}

export async function updateAdminRegistrationWaitlistStatus(
  token: string,
  entryId: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<AdminRegistrationWaitlistEntry> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/registration-waitlist/${entryId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ status }),
  })
  return parseOrThrow(response) as Promise<AdminRegistrationWaitlistEntry>
}

export async function fetchAdminUserActivity(token: string, limit = 50): Promise<AdminUserActivity[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/user-activity?limit=${limit}`, {
    headers: buildAuthHeaders(token),
  })
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
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/overview`, {
    headers: buildAuthHeaders(token),
  })
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
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/batches`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminBatch>
}

export async function updateAdminBatch(token: string, batchId: number, payload: AdminBatchUpdatePayload): Promise<AdminBatch> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/batches/${batchId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminBatch>
}

export async function deleteAdminBatch(token: string, batchId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/batches/${batchId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
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
  eligible_batch_id?: number | null
}

export async function updateAdminJob(token: string, jobId: number, payload: AdminJobUpdatePayload): Promise<AdminJobPost> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/jobs/${jobId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<AdminJobPost>
}

export async function deleteAdminJob(token: string, jobId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/jobs/${jobId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  })
  await parseOrThrow(response)
}

// ── Student delete ─────────────────────────────────────────────────────────────

export async function deleteAdminStudent(token: string, studentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/students/${studentId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
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
    return (await response.json()) as CatalogProject
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

export async function fetchUserProgress(): Promise<UserCatalogProgress> {
  const response = await fetch(`${API_BASE_URL}/api/v1/progress/catalog`)
  return parseOrThrow(response) as Promise<UserCatalogProgress>
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

// ── Resume Builder API ─────────────────────────────────────────────────────────

export interface ResumeExperienceItem {
  title: string
  company: string
  location: string
  start_date: string
  end_date: string
  description: string
}

export interface ResumeEducationItem {
  degree: string
  school: string
  location: string
  start_date: string
  end_date: string
  description: string
}

export interface ResumeProjectItem {
  name: string
  description: string
  technologies: string
  url: string
}

export interface ResumeData {
  id: number
  user_id: number
  role_id: number | null
  title: string
  template: string
  full_name: string
  email: string | null
  phone: string | null
  location: string | null
  website: string | null
  summary: string
  skills: string[]
  experience: ResumeExperienceItem[]
  education: ResumeEducationItem[]
  projects: ResumeProjectItem[]
  certifications: string[]
  ats_score: number
  pdf_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ResumeCreatePayload {
  title?: string
  template?: string
  full_name: string
  email?: string | null
  phone?: string | null
  location?: string | null
  website?: string | null
  summary?: string
  skills?: string[]
  experience?: ResumeExperienceItem[]
  education?: ResumeEducationItem[]
  projects?: ResumeProjectItem[]
  certifications?: string[]
  role_id?: number | null
}

export type ResumeUpdatePayload = Partial<ResumeCreatePayload>

export async function fetchResumeList(): Promise<ResumeData[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/resume/list`, {
    headers: getOptionalAuthHeaders(),
  })
  return parseOrThrow(response) as Promise<ResumeData[]>
}

export async function fetchResume(resumeId: number): Promise<ResumeData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/resume/${resumeId}`, {
    headers: getOptionalAuthHeaders(),
  })
  return parseOrThrow(response) as Promise<ResumeData>
}

export async function createResume(payload: ResumeCreatePayload): Promise<ResumeData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/resume/build`, {
    method: 'POST',
    headers: getOptionalAuthHeaders(),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<ResumeData>
}

export async function updateResume(resumeId: number, payload: ResumeUpdatePayload): Promise<ResumeData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/resume/${resumeId}`, {
    method: 'PATCH',
    headers: getOptionalAuthHeaders(),
    body: JSON.stringify(payload),
  })
  return parseOrThrow(response) as Promise<ResumeData>
}

export async function deleteResume(resumeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/resume/${resumeId}`, {
    method: 'DELETE',
    headers: getOptionalAuthHeaders(),
  })
  await parseOrThrow(response)
}
