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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const TOKEN_KEY = 'career-portal-token'

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export async function ensureDemoSessionToken(): Promise<string> {
  const existingToken = getStoredToken()
  if (existingToken) {
    return existingToken
  }

  const email = 'demo.student@career-portal.dev'
  const password = 'Demo@12345'

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        full_name: 'Demo Student',
        password,
      }),
    })
  } catch {
    // User may already exist. Ignore and continue to login.
  }

  const loginResult = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  storeToken(loginResult.access_token)
  return loginResult.access_token
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
