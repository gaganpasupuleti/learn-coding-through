/**
 * API client for backend code execution
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

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

export interface DatabaseHealth {
  status: 'ok' | 'error'
  database: string
  detail?: string
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
    const response = await fetch(`${API_BASE_URL}/api/execute`, {
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
  const response = await fetch(`${API_BASE_URL}/api/sql/schema`)
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

function buildAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
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

export async function saveStepProgress(projectSlug: string, payload: StepProgressPayload): Promise<void> {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
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
