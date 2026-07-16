import { describe, expect, it } from 'vitest'

import { resolveResumeAppUrl } from '@/lib/resume-app-url'

describe('resolveResumeAppUrl', () => {
  it('expands a plain origin to /dashboard/resumes', () => {
    const result = resolveResumeAppUrl('http://localhost:3000')
    expect(result).toEqual({ ok: true, url: 'http://localhost:3000/dashboard/resumes' })
  })

  it('preserves an explicitly configured path', () => {
    const result = resolveResumeAppUrl('http://localhost:3000/dashboard/resumes?sort=name')
    expect(result).toEqual({
      ok: true,
      url: 'http://localhost:3000/dashboard/resumes?sort=name',
    })
  })

  it('accepts HTTP URLs', () => {
    const result = resolveResumeAppUrl('http://resume.example.com/builder/abc')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('http://resume.example.com/builder/abc')
    }
  })

  it('accepts HTTPS URLs', () => {
    const result = resolveResumeAppUrl('https://resume.example.com/dashboard/resumes')
    expect(result).toEqual({
      ok: true,
      url: 'https://resume.example.com/dashboard/resumes',
    })
  })

  it('rejects javascript: URLs', () => {
    const result = resolveResumeAppUrl('javascript:alert(1)')
    expect(result).toEqual({
      ok: false,
      error: 'Resume application URL must use HTTP or HTTPS.',
    })
  })

  it('rejects malformed URLs', () => {
    const result = resolveResumeAppUrl('not a url')
    expect(result).toEqual({
      ok: false,
      error: 'Resume application URL is malformed.',
    })
  })
})
