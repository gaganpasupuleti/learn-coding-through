import { describe, expect, it } from 'vitest'
import { CODE_PRACTICE_QUESTIONS, getQuestionsForLanguage } from './codeQuestions'
import { resolveQuestionTestCases } from '../utils/executionAdapter'

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

  it('allows only one executable test case until Java stdin is supported', () => {
    const java = getQuestionsForLanguage('java')
    for (const question of java) {
      const cases = resolveQuestionTestCases(question)
      expect(cases.length).toBe(1)
      const distinctOutputs = new Set(cases.map((c) => c.expectedOutput))
      expect(distinctOutputs.size).toBe(1)
      expect(cases[0].expectedOutput).toBe(question.expectedOutput)
    }
  })
})
