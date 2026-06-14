import { describe, expect, it } from 'vitest'
import { getQuestionById } from '../data/sqlQuestions'
import { buildQuestionLearningContext } from './sqlQuestionLearningGuide'

describe('sqlQuestionLearningGuide', () => {
  it('detects GROUP BY and HAVING skills for aggregate questions', () => {
    const question = getQuestionById('uni-q7-having-courses')
    expect(question).toBeDefined()
    const guide = buildQuestionLearningContext(question!)
    expect(guide.sqlSkills).toContain('GROUP BY')
    expect(guide.sqlSkills).toContain('HAVING')
    expect(guide.conceptGuides.some((item) => item.title === 'HAVING vs WHERE')).toBe(true)
  })

  it('includes ORDER BY guidance when sorting is required', () => {
    const question = getQuestionById('uni-q3-order-students')
    expect(question).toBeDefined()
    const guide = buildQuestionLearningContext(question!)
    expect(guide.sqlSkills).toContain('ORDER BY')
    expect(guide.conceptGuides.some((item) => item.title === 'ORDER BY')).toBe(true)
  })

  it('lists tables referenced in the question SQL', () => {
    const question = getQuestionById('uni-q8-inner-join-courses')
    expect(question).toBeDefined()
    const guide = buildQuestionLearningContext(question!)
    expect(guide.tables).toEqual(expect.arrayContaining(['students', 'enrollments', 'courses']))
  })
})
