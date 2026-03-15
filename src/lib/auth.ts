/**
 * Auth utilities – token storage, role detection, login/logout helpers.
 * The backend token is stored in localStorage under TOKEN_KEY.
 * After login the user profile is fetched from /auth/me to determine role.
 * Falls back to "student" when the /me endpoint is unavailable.
 */

export type UserRole = 'student' | 'admin' | 'demo'

export interface AuthUser {
  id: number
  email: string
  full_name: string
  role: UserRole
  /** Supabase Auth UUID (set when signed in via Supabase). */
  supabase_uid?: string
}

const TOKEN_KEY = 'career-portal-token'
const USER_KEY = 'career-portal-user'
const DEMO_FLAG_KEY = 'career-portal-demo'

// ---------- token helpers ----------

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ---------- user helpers ----------

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function storeUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY)
}

// ---------- demo helpers ----------

export function setDemoFlag(value: boolean) {
  if (value) {
    localStorage.setItem(DEMO_FLAG_KEY, '1')
  } else {
    localStorage.removeItem(DEMO_FLAG_KEY)
  }
}

export function isDemoUser(): boolean {
  return localStorage.getItem(DEMO_FLAG_KEY) === '1'
}

// ---------- logout ----------

export function clearAuth() {
  clearAuthToken()
  clearStoredUser()
  setDemoFlag(false)
}

// ---------- backend /auth/me ----------

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

interface MeResponse {
  id: number
  email: string
  full_name: string
  role: string
  /** Included for backend compatibility; not currently used client-side. */
  is_active?: boolean
}

/**
 * Fetch the current user profile from the backend.
 * Returns null if the request fails (offline, 401, etc.).
 */
export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) return null
    const data = (await response.json()) as MeResponse
    const role: UserRole =
      data.role === 'admin' ? 'admin' : data.role === 'demo' ? 'demo' : 'student'
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role,
    }
  } catch {
    return null
  }
}
