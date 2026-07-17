/**
 * Browser client for Code Quest → Resume Matcher proxy routes.
 * Never calls Resume Matcher directly.
 */

import { resumeMatcherAnalysisToCodeQuestResult } from '@/lib/resume/codequest-resume-v1'

export type ParseResumeResult = {
  markdown: string
  content_type: string
  original_filename: string
  byte_size: number
  parser: string
}

export type PromptPrepResult = {
  task: string
  system_prompt: string
  user_prompt: string
  source: string
}

function authHeaders(json = true): HeadersInit {
  const token = localStorage.getItem('career-portal-token')
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

function apiUrl(path: string): string {
  return `${window.location.origin}${path}`
}

async function parseError(response: Response): Promise<Error> {
  const payload = (await response.json().catch(() => null)) as {
    detail?: { code?: string; message?: string } | string
  } | null
  if (payload?.detail && typeof payload.detail === 'object') {
    return new Error(payload.detail.message || payload.detail.code || `Request failed (${response.status})`)
  }
  if (typeof payload?.detail === 'string') return new Error(payload.detail)
  return new Error(`Request failed (${response.status})`)
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init)
  if (!response.ok) throw await parseError(response)
  return response.json() as Promise<T>
}

export async function fetchResumeMatcherHealth(signal?: AbortSignal) {
  return requestJson<{ enabled: boolean; upstream: Record<string, unknown> }>(
    '/api/v1/resume-matcher/health',
    { headers: authHeaders(), signal },
  )
}

export async function parseResumeViaMatcher(
  file: { filename: string; contentBase64: string; contentType: string },
  signal?: AbortSignal,
): Promise<ParseResumeResult> {
  const binary = atob(file.contentBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: file.contentType })
  const form = new FormData()
  form.append('file', blob, file.filename)

  return requestJson('/api/v1/resume-matcher/resumes/parse', {
    method: 'POST',
    headers: authHeaders(false),
    body: form,
    signal,
  })
}

export async function analyzeJobViaMatcher(
  input: { resume: Record<string, unknown>; jobDescription: string; resumeText?: string },
  signal?: AbortSignal,
) {
  const payload = await requestJson<Record<string, unknown>>('/api/v1/resume-matcher/jobs/analyze', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      resume: input.resume,
      job_description: input.jobDescription,
      resume_text: input.resumeText,
    }),
    signal,
  })
  return resumeMatcherAnalysisToCodeQuestResult(payload)
}

export async function matchResumeViaMatcher(
  input: {
    resume: Record<string, unknown>
    jobDescription?: string
    jobKeywords?: Record<string, unknown>
  },
  signal?: AbortSignal,
) {
  const payload = await requestJson<Record<string, unknown>>('/api/v1/resume-matcher/resumes/match', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      resume: input.resume,
      job_description: input.jobDescription,
      job_keywords: input.jobKeywords ?? {},
    }),
    signal,
  })
  return resumeMatcherAnalysisToCodeQuestResult(payload)
}

export async function prepareCoverLetterPrompt(
  input: { resume: Record<string, unknown>; jobDescription: string },
  signal?: AbortSignal,
): Promise<PromptPrepResult> {
  return requestJson('/api/v1/resume-matcher/prompts/cover-letter', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      resume: input.resume,
      job_description: input.jobDescription,
    }),
    signal,
  })
}

export async function prepareApplicationEmailPrompt(
  input: { resume: Record<string, unknown>; jobDescription: string },
  signal?: AbortSignal,
): Promise<PromptPrepResult> {
  return requestJson('/api/v1/resume-matcher/prompts/application-email', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      resume: input.resume,
      job_description: input.jobDescription,
    }),
    signal,
  })
}
