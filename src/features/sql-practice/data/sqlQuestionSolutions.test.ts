import { describe, expect, it, beforeAll } from 'vitest'
import { SQL_PRACTICE_QUESTIONS } from './sqlQuestions'
import type { SqlDatabaseId } from '../types/sqlPractice.types'
import {
  execSolutionOnDatabase,
  initSqlJsSeedHarness,
  resultColumnsMatchExpected,
} from '../test-utils/sqlJsSeedHarness'

const VALID_DATABASE_IDS: SqlDatabaseId[] = [
  'university_system',
  'hospital_management',
  'shipping_logistics',
]

describe('sqlQuestionSolutions against sql.js seeds', () => {
  let databases: Awaited<ReturnType<typeof initSqlJsSeedHarness>>['databases']

  beforeAll(async () => {
    const harness = await initSqlJsSeedHarness()
    databases = harness.databases
  }, 30_000)

  it('has 65 questions across three databases', () => {
    expect(SQL_PRACTICE_QUESTIONS).toHaveLength(65)
    for (const dbId of VALID_DATABASE_IDS) {
      const count = SQL_PRACTICE_QUESTIONS.filter((q) => q.databaseId === dbId).length
      expect(count).toBeGreaterThan(0)
    }
  })

  it.each(SQL_PRACTICE_QUESTIONS.map((q) => [q.id, q] as const))(
    '%s solutionSql executes without error',
    (id, question) => {
      const db = databases[question.databaseId]
      expect(db, `${id}: missing database ${question.databaseId}`).toBeDefined()

      let resultSets: ReturnType<typeof execSolutionOnDatabase>
      try {
        resultSets = execSolutionOnDatabase(db, question.solutionSql)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        throw new Error(
          `[${question.databaseId}] ${id} (${question.title}): ${message}`,
        )
      }

      expect(
        resultSets.length,
        `[${question.databaseId}] ${id}: query returned no result set`,
      ).toBeGreaterThan(0)

      const first = resultSets[0]
      expect(first.columns.length, `${id}: missing columns`).toBeGreaterThan(0)
      expect(
        resultColumnsMatchExpected(first.columns, question.expectedColumns),
        `${id}: columns ${first.columns.join(', ')} !== expected ${question.expectedColumns.join(', ')}`,
      ).toBe(true)

      expect(first.values.length, `${id}: accidental zero-row result`).toBeGreaterThan(0)
    },
  )
})
