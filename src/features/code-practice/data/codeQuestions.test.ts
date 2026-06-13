import { describe, expect, it } from 'vitest'
import { CODE_PRACTICE_QUESTIONS, getQuestionsForLanguage } from './codeQuestions'

describe('codeQuestions java metadata', () => {
  it('has six beginner Java questions', () => {
    const java = getQuestionsForLanguage('java')
    expect(java).toHaveLength(6)
    expect(java.every((q) => q.language === 'java')).toBe(true)
    expect(java.every((q) => q.starterCode.includes('class Main'))).toBe(true)
  })

  it('assigns unique ids for Java drills', () => {
    const javaIds = CODE_PRACTICE_QUESTIONS.filter((q) => q.language === 'java').map((q) => q.id)
    expect(new Set(javaIds).size).toBe(javaIds.length)
  })
})
