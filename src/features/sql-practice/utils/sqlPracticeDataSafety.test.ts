import { describe, expect, it } from 'vitest'
import type { SqlPracticeQuestion } from '../types/sqlPractice.types'
import { getQuestionProgressSummary, getReviewQueue } from './sqlPracticeAnalytics'
import type { SqlProgressStore } from './sqlPracticeProgress'
import {
  filterQuestionsToKnownIds,
  isValidProgressRecord,
  resolveQuestionDisplayMeta,
  sanitizeProgressStore,
} from './sqlPracticeDataSafety'

const sampleQuestions: SqlPracticeQuestion[] = [
  {
    id: 'q1',
    title: 'Q1',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: '',
    learningObjective: '',
    expectedColumns: ['a'],
    hints: [],
    starterSql: '',
    solutionSql: 'SELECT 1;',
    validationMode: 'default',
  },
]

describe('sqlPracticeDataSafety', () => {
  it('validates progress records', () => {
    expect(
      isValidProgressRecord({
        questionId: 'q1',
        databaseId: 'university_system',
        attemptsCount: 1,
        passedCount: 0,
        failedCount: 1,
        lastStatus: 'failed',
        solutionRevealed: false,
        hintsUsedCount: 0,
      }),
    ).toBe(true)
    expect(isValidProgressRecord({ questionId: 'q1', bad: true })).toBe(false)
    expect(isValidProgressRecord(null)).toBe(false)
  })

  it('sanitizes corrupted progress store without crashing analytics', () => {
    const corrupt = {
      q1: {
        questionId: 'q1',
        databaseId: 'university_system',
        attemptsCount: 2,
        passedCount: 1,
        failedCount: 0,
        lastStatus: 'passed',
        solutionRevealed: false,
        hintsUsedCount: 1,
      },
      bad: { foo: 'bar' },
      q2: 'not-an-object',
    }

    const safe = sanitizeProgressStore(corrupt)
    expect(Object.keys(safe)).toEqual(['q1'])

    const summary = getQuestionProgressSummary(sampleQuestions, safe as SqlProgressStore)
    expect(summary.passed).toBe(1)
  })

  it('resolves missing question metadata safely', () => {
    const meta = resolveQuestionDisplayMeta('missing-question-id')
    expect(meta.found).toBe(false)
    expect(meta.title).toBe('missing-question-id')
    expect(meta.topicLabel).toBe('Unknown topic')
  })

  it('filters review queue to known question IDs only', () => {
    const progress: SqlProgressStore = {
      'ghost-q': {
        questionId: 'ghost-q',
        databaseId: 'university_system',
        attemptsCount: 1,
        passedCount: 0,
        failedCount: 1,
        lastStatus: 'failed',
        solutionRevealed: false,
        hintsUsedCount: 0,
      },
    }

    const mistakes = [
      {
        id: 'm1',
        questionId: 'ghost-q',
        databaseId: 'university_system' as const,
        sql: 'SELECT 1;',
        recordedAt: '2025-01-01',
        errorType: 'other' as const,
        feedback: 'fail',
        message: 'fail',
      },
    ]

    const queue = getReviewQueue(
      'mistakes',
      'university_system',
      sampleQuestions,
      progress,
      mistakes,
    )
    expect(queue).toHaveLength(0)

    const filtered = filterQuestionsToKnownIds(sampleQuestions, ['q1', 'ghost-q'])
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('q1')
  })
})
