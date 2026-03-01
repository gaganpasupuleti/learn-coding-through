/**
 * API client for backend code execution
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

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

/**
 * Execute code on the backend
 */
export async function executeCode(
  code: string,
  language: string
): Promise<ExecuteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
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
