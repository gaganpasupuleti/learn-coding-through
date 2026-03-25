import { getAuthToken, type AuthUser } from '@/lib/auth'

interface ResumeHandoffPayload {
  token: string
  user: AuthUser
  returnUrl: string
  issuedAt: number
}

function toBase64Url(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function resolveResumeAppUrl(): string {
  const configured = (import.meta.env.VITE_RESUME_APP_URL ?? '').trim()
  const fallback = 'http://localhost:3000'
  return (configured || fallback).replace(/\/+$/, '')
}

export function buildResumeHandoffUrl(user: AuthUser): string {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No active auth token. Please log in again.')
  }

  const payload: ResumeHandoffPayload = {
    token,
    user,
    returnUrl: window.location.origin,
    issuedAt: Date.now(),
  }

  const encoded = toBase64Url(JSON.stringify(payload))
  return `${resolveResumeAppUrl()}/dashboard#cq_handoff=${encoded}`
}
