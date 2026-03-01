export interface BackendRole {
  id: number
  name: string
  skills_required: string[]
  salary_range: string
  companies_hiring: string[]
  difficulty_level: string
  estimated_duration_weeks: number
}

export interface BackendRoadmapStage {
  id: number
  order_number: number
  title: string
  description: string
  unlock_quiz_score: number
  unlock_exercise_completion: number
  unlocked: boolean
}

export interface BackendRoadmapResponse {
  role_id: number
  role_name: string
  stages: BackendRoadmapStage[]
}

export interface BackendProgressRecord {
  stage_id: number
  lessons_completed: number
  total_lessons: number
  exercises_completed_pct: number
  latest_quiz_score: number
  unlocked: boolean
}

export interface ProgressUpdatePayload {
  role_id: number
  stage_id: number
  lessons_completed: number
  total_lessons: number
  exercises_completed_pct: number
  latest_quiz_score: number
}

interface LoginResponse {
  access_token: string
  token_type: string
}

interface RegisterRequest {
  email: string
  full_name: string
  password: string
}

interface LoginRequest {
  email: string
  password: string
}

function resolveApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
  if (!configured) {
    return '/api/v1'
  }

  const normalized = configured.replace(/\/+$/, '')
  if (normalized.endsWith('/api/v1')) {
    return normalized
  }
  if (normalized.endsWith('/api')) {
    return `${normalized}/v1`
  }
  if (/^https?:\/\//i.test(normalized)) {
    return `${normalized}/api/v1`
  }
  return normalized
}

const API_BASE_URL = resolveApiBaseUrl()
const TOKEN_KEY = 'career-portal-token'

export class ApiError extends Error {
  status: number
  endpoint: string

  constructor(message: string, status: number, endpoint: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.endpoint = endpoint
  }
}

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const json = await response.json()
    if (typeof json?.detail === 'string') {
      return json.detail
    }
  } catch {
    // fallback below
  }

  try {
    const text = await response.text()
    if (text) {
      return text
    }
  } catch {
    // ignore and fallback below
  }

  return `Request failed with status ${response.status}`
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
  } catch {
    throw new ApiError('Network error. Check if backend API is running.', 0, path)
  }

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new ApiError(message, response.status, path)
  }

  return response.json() as Promise<T>
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function registerUser(payload: RegisterRequest): Promise<void> {
  await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function loginUser(payload: LoginRequest): Promise<string> {
  const loginResult = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  storeToken(loginResult.access_token)
  return loginResult.access_token
}

export async function ensureRoadmapperToken(): Promise<string> {
  const existingToken = getStoredToken()
  if (existingToken) {
    return existingToken
  }

  const email = 'roadmapper.guest@career-portal.dev'
  const password = 'Guest@12345'

  try {
    return await loginUser({ email, password })
  } catch {
    // Fallback below.
  }

  try {
    await registerUser({
      email,
      full_name: 'Roadmapper Guest',
      password,
    })
    return await loginUser({ email, password })
  } catch {
    const suffix = Date.now()
    const fallbackEmail = `roadmapper.guest+${suffix}@career-portal.dev`
    await registerUser({
      email: fallbackEmail,
      full_name: 'Roadmapper Guest',
      password,
    })
    return await loginUser({ email: fallbackEmail, password })
  }
}

export async function fetchRoles(): Promise<BackendRole[]> {
  return apiRequest<BackendRole[]>('/roles')
}

export async function fetchRoadmap(roleId: number, token: string): Promise<BackendRoadmapResponse> {
  return apiRequest<BackendRoadmapResponse>(`/roadmap/${roleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function fetchProgress(token: string): Promise<BackendProgressRecord[]> {
  return apiRequest<BackendProgressRecord[]>('/progress/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateProgress(payload: ProgressUpdatePayload, token: string): Promise<BackendProgressRecord> {
  return apiRequest<BackendProgressRecord>('/progress/update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}
