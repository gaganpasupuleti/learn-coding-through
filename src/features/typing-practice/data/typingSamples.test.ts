import { describe, expect, it } from 'vitest'
import {
  TYPING_SAMPLES,
  getTypingSamplesForMode,
  pickTypingSample,
} from './typingSamples'

describe('typingSamples metadata', () => {
  it('has unique sample ids', () => {
    const ids = TYPING_SAMPLES.map((sample) => sample.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes beginner and mid code samples for each language', () => {
    for (const language of ['python', 'javascript', 'java', 'sql'] as const) {
      expect(getTypingSamplesForMode('code', language, 'beginner').length).toBeGreaterThanOrEqual(7)
      expect(getTypingSamplesForMode('code', language, 'mid').length).toBeGreaterThanOrEqual(2)
    }
  })

  it('includes normal text samples for both difficulties', () => {
    expect(getTypingSamplesForMode('text', undefined, 'beginner').length).toBeGreaterThanOrEqual(2)
    expect(getTypingSamplesForMode('text', undefined, 'mid').length).toBeGreaterThanOrEqual(2)
  })

  it('keeps SQL samples typing-only metadata', () => {
    const sqlSamples = getTypingSamplesForMode('code', 'sql')
    expect(sqlSamples.length).toBeGreaterThan(0)
    for (const sample of sqlSamples) {
      expect(sample.language).toBe('sql')
      expect(sample.mode).toBe('code')
      expect(sample.text.trim().length).toBeGreaterThan(0)
    }
  })

  it('picks a sample for active filters', () => {
    const sample = pickTypingSample('code', 'python', 'beginner')
    expect(sample).not.toBeNull()
    expect(sample?.language).toBe('python')
    expect(sample?.difficulty).toBe('beginner')
  })
})
