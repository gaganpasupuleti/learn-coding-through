import { describe, expect, it } from 'vitest'
import type { SqlMistakeRecord, SqlPracticeQuestion } from '../types/sqlPractice.types'
import type { SqlProgressStore } from './sqlPracticeProgress'
import {
  getDatabaseAnalyticsSummary,
  getDifficultyProgressSummary,
  getQuestionProgressSummary,
  getReviewQueue,
  getSuggestedNextQuestion,
  getTopicProgressSummary,
  getWeakTopics,
  isTopicWeak,
} from './sqlPracticeAnalytics'

const sampleQuestions: SqlPracticeQuestion[] = [
  {
    id: 'q1',
    title: 'Q1 Select',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: '',
    learningObjective: '',
    expectedColumns: ['a'],
    hints: ['h1'],
    starterSql: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    validationMode: 'default',
  },
  {
    id: 'q2',
    title: 'Q2 Filter',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'filtering',
    problemStatement: '',
    learningObjective: '',
    expectedColumns: ['a'],
    hints: ['h1'],
    starterSql: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    validationMode: 'default',
  },
  {
    id: 'q3',
    title: 'Q3 Join',
    databaseId: 'university_system',
    difficulty: 'hard',
    topic: 'joins',
    problemStatement: '',
    learningObjective: '',
    expectedColumns: ['a'],
    hints: ['h1'],
    starterSql: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    validationMode: 'default',
  },
  {
    id: 'q4',
    title: 'Q4 Agg',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'aggregates',
    problemStatement: '',
    learningObjective: '',
    expectedColumns: ['a'],
    hints: ['h1'],
    starterSql: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    validationMode: 'default',
  },
]

const progress: SqlProgressStore = {
  q1: {
    questionId: 'q1',
    databaseId: 'university_system',
    attemptsCount: 2,
    passedCount: 1,
    failedCount: 0,
    lastStatus: 'passed',
    firstPassedAt: '2025-01-01',
    solutionRevealed: false,
    hintsUsedCount: 1,
  },
  q2: {
    questionId: 'q2',
    databaseId: 'university_system',
    attemptsCount: 3,
    passedCount: 0,
    failedCount: 2,
    lastStatus: 'failed',
    solutionRevealed: true,
    hintsUsedCount: 2,
  },
  q3: {
    questionId: 'q3',
    databaseId: 'university_system',
    attemptsCount: 1,
    passedCount: 0,
    failedCount: 1,
    lastStatus: 'failed',
    solutionRevealed: false,
    hintsUsedCount: 0,
  },
}

const mistakes: SqlMistakeRecord[] = [
  {
    id: 'm1',
    questionId: 'q2',
    questionTitle: 'Q2 Filter',
    databaseId: 'university_system',
    sql: 'SELECT bad;',
    recordedAt: '2025-01-02',
    errorType: 'value_mismatch',
    feedback: 'Values do not match.',
    message: 'Values do not match.',
  },
  {
    id: 'm2',
    questionId: 'q3',
    questionTitle: 'Q3 Join',
    databaseId: 'university_system',
    sql: 'SELECT x;',
    recordedAt: '2025-01-03',
    errorType: 'syntax_error',
    feedback: 'Syntax error.',
    message: 'Syntax error.',
  },
]

describe('sqlPracticeAnalytics', () => {
  it('counts passed/failed/unattempted correctly', () => {
    const summary = getQuestionProgressSummary(sampleQuestions, progress)
    expect(summary.total).toBe(4)
    expect(summary.passed).toBe(1)
    expect(summary.failed).toBe(2)
    expect(summary.unattempted).toBe(1)
    expect(summary.hintsUsedTotal).toBe(3)
    expect(summary.solutionsRevealedCount).toBe(1)
  })

  it('builds database analytics summary', () => {
    const summary = getDatabaseAnalyticsSummary('university_system', sampleQuestions, progress)
    expect(summary.passed).toBe(1)
    expect(summary.failed).toBe(2)
    expect(summary.unattempted).toBe(1)
  })

  it('builds topic summary', () => {
    const rows = getTopicProgressSummary('university_system', sampleQuestions, progress)
    const filtering = rows.find((r) => r.topic === 'filtering')
    expect(filtering?.passed).toBe(0)
    expect(filtering?.failed).toBe(1)
    expect(filtering?.total).toBe(1)
  })

  it('builds difficulty summary', () => {
    const rows = getDifficultyProgressSummary('university_system', sampleQuestions, progress)
    expect(rows.find((r) => r.difficulty === 'easy')?.passed).toBe(1)
    expect(rows.find((r) => r.difficulty === 'medium')?.failed).toBe(1)
  })

  it('detects weak topics', () => {
    expect(isTopicWeak(3, 0, 2)).toBe(true)
    expect(isTopicWeak(5, 4, 1)).toBe(false)
    expect(isTopicWeak(5, 2, 2)).toBe(true)
    const weak = getWeakTopics('university_system', sampleQuestions, progress)
    expect(weak.some((w) => w.topic === 'filtering')).toBe(true)
  })

  it('prioritizes failed unanswered question for suggestion', () => {
    const result = getSuggestedNextQuestion('university_system', sampleQuestions, progress, mistakes, 'q1')
    expect(result.question?.id).toBe('q2')
    expect(result.reason).toBe('failed')
  })

  it('falls back to unattempted question when no failures remain', () => {
    const noFailures: SqlProgressStore = {
      q1: { ...progress.q1 },
      q2: {
        questionId: 'q2',
        databaseId: 'university_system',
        attemptsCount: 4,
        passedCount: 1,
        failedCount: 3,
        lastStatus: 'passed',
        firstPassedAt: '2025-01-05',
        solutionRevealed: false,
        hintsUsedCount: 0,
      },
      q3: {
        questionId: 'q3',
        databaseId: 'university_system',
        attemptsCount: 2,
        passedCount: 1,
        failedCount: 1,
        lastStatus: 'passed',
        firstPassedAt: '2025-01-06',
        solutionRevealed: false,
        hintsUsedCount: 0,
      },
    }
    const result = getSuggestedNextQuestion('university_system', sampleQuestions, noFailures, [], 'q1')
    expect(result.question?.id).toBe('q4')
    expect(result.reason).toBe('unattempted')
  })

  it('suggests unattempted question in a weak topic before other unattempted', () => {
    const extraFiltering: SqlPracticeQuestion = {
      ...sampleQuestions[1],
      id: 'q5',
      title: 'Q5 Filter 2',
    }
    const allQuestions = [...sampleQuestions, extraFiltering]
    const weakProgress: SqlProgressStore = {
      ...progress,
      q2: {
        questionId: 'q2',
        databaseId: 'university_system',
        attemptsCount: 5,
        passedCount: 1,
        failedCount: 4,
        lastStatus: 'passed',
        firstPassedAt: '2025-01-07',
        solutionRevealed: false,
        hintsUsedCount: 0,
      },
      q3: {
        questionId: 'q3',
        databaseId: 'university_system',
        attemptsCount: 2,
        passedCount: 1,
        failedCount: 1,
        lastStatus: 'passed',
        firstPassedAt: '2025-01-06',
        solutionRevealed: false,
        hintsUsedCount: 0,
      },
    }
    const result = getSuggestedNextQuestion('university_system', allQuestions, weakProgress, [], 'q1')
    expect(result.question?.id).toBe('q5')
    expect(result.reason).toBe('weak_topic_unattempted')
  })

  it('returns review queue for mistakes only', () => {
    const queue = getReviewQueue('mistakes', 'university_system', sampleQuestions, progress, mistakes)
    expect(queue.map((q) => q.id).sort()).toEqual(['q2', 'q3'])
  })

  it('returns review queue for unattempted only', () => {
    const queue = getReviewQueue('unattempted', 'university_system', sampleQuestions, progress, mistakes)
    expect(queue).toHaveLength(1)
    expect(queue[0].id).toBe('q4')
  })

  it('returns review queue for failed only', () => {
    const queue = getReviewQueue('failed', 'university_system', sampleQuestions, progress, mistakes)
    expect(queue.map((q) => q.id).sort()).toEqual(['q2', 'q3'])
  })

  it('returns all caught up when everything passed', () => {
    const allPassed: SqlProgressStore = Object.fromEntries(
      sampleQuestions.map((q) => [
        q.id,
        {
          questionId: q.id,
          databaseId: 'university_system',
          attemptsCount: 1,
          passedCount: 1,
          failedCount: 0,
          lastStatus: 'passed' as const,
          firstPassedAt: '2025-01-01',
          solutionRevealed: false,
          hintsUsedCount: 0,
        },
      ]),
    )
    const result = getSuggestedNextQuestion('university_system', sampleQuestions, allPassed, [])
    expect(result.question).toBeNull()
    expect(result.reason).toBe('all_caught_up')
  })
})
