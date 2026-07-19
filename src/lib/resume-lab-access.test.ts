import { describe, expect, it } from 'vitest'

import { canAccessResumeLab } from './resume-lab-access'

describe('canAccessResumeLab', () => {
  it('allows Riya only', () => {
    expect(canAccessResumeLab('kundetiriya@gmail.com')).toBe(true)
    expect(canAccessResumeLab('Kundetiriya@gmail.com')).toBe(true)
  })

  it('locks everyone else', () => {
    expect(canAccessResumeLab('student@example.com')).toBe(false)
    expect(canAccessResumeLab('')).toBe(false)
    expect(canAccessResumeLab(null)).toBe(false)
  })
})
