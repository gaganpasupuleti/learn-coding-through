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
  const runtimeConfigured =
    typeof window !== 'undefined'
      ? (((window as Window & { __RUNTIME_CONFIG__?: { VITE_API_URL?: string; VITE_API_BASE_URL?: string } }).__RUNTIME_CONFIG__?.VITE_API_URL ??
          (window as Window & { __RUNTIME_CONFIG__?: { VITE_API_URL?: string; VITE_API_BASE_URL?: string } }).__RUNTIME_CONFIG__?.VITE_API_BASE_URL ??
          '') as string).trim()
      : ''

  const configured = (runtimeConfigured || (import.meta.env.VITE_API_BASE_URL ?? '').trim()).trim()
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

interface BackendLoginResponse {
  access_token: string
  token_type?: string
}

interface ForgotPasswordApiResponse {
  message: string
  reset_token?: string
}

async function parseOrThrow(response: Response): Promise<any> {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.detail || `HTTP error ${response.status}`)
  }
  return payload
}

export async function loginWithBackend(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const payload = (await parseOrThrow(response)) as BackendLoginResponse
  if (!payload?.access_token) {
    throw new Error('Login did not return an access token.')
  }
  return payload.access_token
}

export async function loginWithGoogleIdToken(idToken: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  })
  const payload = (await parseOrThrow(response)) as BackendLoginResponse
  if (!payload?.access_token) {
    throw new Error('Google login did not return an access token.')
  }
  return payload.access_token
}

export async function registerWithBackend(fullName: string, email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  })
  await parseOrThrow(response)
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return (await parseOrThrow(response)) as ForgotPasswordApiResponse
}

export async function resetPasswordWithToken(resetToken: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reset_token: resetToken,
      new_password: newPassword,
    }),
  })
  await parseOrThrow(response)
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
