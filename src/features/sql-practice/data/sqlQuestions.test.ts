import { describe, expect, it } from 'vitest'
import type { SqlDatabaseId } from '../types/sqlPractice.types'
import { SQL_PRACTICE_QUESTIONS } from './sqlQuestions'

const VALID_DATABASE_IDS: SqlDatabaseId[] = [
  'university_system',
  'hospital_management',
  'shipping_logistics',
]

const MIN_QUESTIONS_BY_DATABASE: Record<SqlDatabaseId, number> = {
  university_system: 25,
  hospital_management: 20,
  shipping_logistics: 20,
}

const FORBIDDEN_MUTATION_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'TRUNCATE',
  'CREATE',
] as const

function containsForbiddenKeyword(sql: string): string | null {
  const upper = sql.toUpperCase()
  for (const keyword of FORBIDDEN_MUTATION_KEYWORDS) {
    const pattern = new RegExp(`\\b${keyword}\\b`)
    if (pattern.test(upper)) return keyword
  }
  return null
}

describe('sqlQuestions integrity', () => {
  it('has unique question IDs', () => {
    const ids = SQL_PRACTICE_QUESTIONS.map((q) => q.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('every question has solutionSql', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      expect(q.solutionSql.trim().length, q.id).toBeGreaterThan(0)
    }
  })

  it('every solutionSql starts with SELECT or WITH', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      const trimmed = q.solutionSql.trim().toUpperCase()
      const valid = trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')
      expect(valid, q.id).toBe(true)
    }
  })

  it('every question databaseId is one of the three existing databases', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      expect(VALID_DATABASE_IDS, q.id).toContain(q.databaseId)
    }
  })

  it('each database meets the minimum question count', () => {
    for (const databaseId of VALID_DATABASE_IDS) {
      const count = SQL_PRACTICE_QUESTIONS.filter((q) => q.databaseId === databaseId).length
      expect(count, databaseId).toBeGreaterThanOrEqual(MIN_QUESTIONS_BY_DATABASE[databaseId])
    }
  })

  it('every question has at least one hint', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      expect(q.hints.length, q.id).toBeGreaterThanOrEqual(1)
    }
  })

  it('every question has expectedColumns', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      expect(q.expectedColumns.length, q.id).toBeGreaterThan(0)
    }
  })

  it('every question has starterSql', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      expect(q.starterSql.trim().length, q.id).toBeGreaterThan(0)
    }
  })

  it('no solutionSql uses forbidden mutation keywords', () => {
    for (const q of SQL_PRACTICE_QUESTIONS) {
      const keyword = containsForbiddenKeyword(q.solutionSql)
      expect(keyword, `${q.id} contains ${keyword}`).toBeNull()
    }
  })
})
