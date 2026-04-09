import { getAuthToken, type AuthUser } from '@/lib/auth'

interface ResumeHandoffPayload {
  token?: string
  user: AuthUser
  returnUrl: string
  flowMode: ResumeFlowMode
  issuedAt: number
}

export type ResumeDestination = 'dashboard' | 'tailor'
export type ResumeFlowMode = 'no_ai' | 'ai'

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

export function buildResumeHandoffUrl(
  user: AuthUser,
  destination: ResumeDestination = 'dashboard',
  flowMode: ResumeFlowMode = destination === 'tailor' ? 'ai' : 'no_ai'
): string {
  const token = getAuthToken()

  const payload: ResumeHandoffPayload = {
    ...(token ? { token } : {}),
    user,
    returnUrl: window.location.origin,
    flowMode,
    issuedAt: Date.now(),
  }

  const encoded = toBase64Url(JSON.stringify(payload))
  return `${resolveResumeAppUrl()}/${destination}#cq_handoff=${encoded}`
}
