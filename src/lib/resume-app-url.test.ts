import { describe, expect, it } from 'vitest'

import { resolveResumeAppUrl } from '@/lib/resume-app-url'

describe('resolveResumeAppUrl', () => {
  it('keeps a plain origin at the CodeQuest resume app root', () => {
    const result = resolveResumeAppUrl('http://localhost:3000')
    expect(result).toEqual({ ok: true, url: 'http://localhost:3000/' })
  })

  it('preserves an explicitly configured path', () => {
    const result = resolveResumeAppUrl('http://localhost:3000/builder/1')
    expect(result).toEqual({
      ok: true,
      url: 'http://localhost:3000/builder/1',
    })
  })

  it('accepts HTTP URLs', () => {
    const result = resolveResumeAppUrl('http://resume.example.com/app')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('http://resume.example.com/app')
    }
  })

  it('accepts HTTPS URLs', () => {
    const result = resolveResumeAppUrl('https://resume.example.com/')
    expect(result).toEqual({
      ok: true,
      url: 'https://resume.example.com/',
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
