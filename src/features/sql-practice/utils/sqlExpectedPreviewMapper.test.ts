import { describe, expect, it } from 'vitest'
import type { SqlPracticeQuestion } from '../types/sqlPractice.types'
import {
  mapExpectedPreviewResult,
  PREVIEW_SAMPLE_ROW_LIMIT,
  ZERO_ROW_PREVIEW_MESSAGE,
} from './sqlExpectedPreviewMapper'

const baseQuestion: SqlPracticeQuestion = {
  id: 'test-q',
  title: 'Test',
  databaseId: 'university_system',
  difficulty: 'easy',
  topic: 'select',
  problemStatement: '',
  learningObjective: '',
  expectedColumns: ['student_name', 'city'],
  hints: [],
  starterSql: 'SELECT 1;',
  solutionSql: 'SELECT student_name, city FROM students;',
  validationMode: 'default',
}

describe('mapExpectedPreviewResult', () => {
  it('maps non-empty result columns, sample rows, and row count', () => {
    const preview = mapExpectedPreviewResult(baseQuestion, {
      success: true,
      columns: ['student_name', 'city'],
      rows: [
        ['A', 'Hyderabad'],
        ['B', 'Pune'],
        ['C', 'Mumbai'],
        ['D', 'Delhi'],
        ['E', 'Chennai'],
        ['F', 'Kolkata'],
      ],
      rowCount: 6,
      error: null,
    })

    expect(preview.status).toBe('ready')
    expect(preview.columns).toEqual(['student_name', 'city'])
    expect(preview.rowCount).toBe(6)
    expect(preview.sampleRows).toHaveLength(PREVIEW_SAMPLE_ROW_LIMIT)
    expect(preview.zeroRowMessage).toBeUndefined()
  })

  it('falls back to expectedColumns for empty zero-row result metadata', () => {
    const preview = mapExpectedPreviewResult(baseQuestion, {
      success: true,
      columns: [],
      rows: [],
      rowCount: 0,
      error: null,
    })

    expect(preview.status).toBe('ready')
    expect(preview.columns).toEqual(['student_name', 'city'])
    expect(preview.rowCount).toBe(0)
    expect(preview.sampleRows).toEqual([])
    expect(preview.zeroRowMessage).toBe(ZERO_ROW_PREVIEW_MESSAGE)
  })

  it('maps execution errors without exposing solutionSql', () => {
    const preview = mapExpectedPreviewResult(baseQuestion, {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      error: 'syntax error near FROM',
    })

    expect(preview.status).toBe('error')
    expect(preview.errorMessage).toContain('syntax error')
    expect(JSON.stringify(preview)).not.toContain(baseQuestion.solutionSql)
  })

  it('limits sample rows to first five', () => {
    const rows = Array.from({ length: 12 }, (_, i) => [String(i)])
    const preview = mapExpectedPreviewResult(
      { ...baseQuestion, expectedColumns: ['n'] },
      {
        success: true,
        columns: ['n'],
        rows,
        rowCount: 12,
        error: null,
      },
    )

    expect(preview.sampleRows).toHaveLength(5)
  })
})
