import type { SqlDatabaseId } from '../types/sqlPractice.types'
import { getSqlDatabase } from './sqlEngine'
import { validateUserSql } from './sqlGuardrails'

export interface SqlQueryResult {
  success: boolean
  columns: string[]
  rows: (string | null)[][]
  rowCount: number
  executionTimeMs: number
  messages: string[]
  error: string | null
  blocked: boolean
}

function formatCellValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return String(value)
}

function buildSuccessMessages(rowCount: number, executionTimeMs: number): string[] {
  const messages = [
    'Query executed successfully.',
    `Rows returned: ${rowCount}`,
    `Execution time: ${Math.round(executionTimeMs)} ms`,
  ]
  if (rowCount === 0) {
    messages.splice(2, 0, 'Query returned no rows.')
  }
  return messages
}

async function execSqlOnDatabase(
  databaseId: SqlDatabaseId,
  sql: string,
  onLoading?: () => void,
): Promise<SqlQueryResult> {
  const started = performance.now()

  try {
    const db = await getSqlDatabase(databaseId, onLoading)
    const resultSets = db.exec(sql)
    const executionTimeMs = performance.now() - started

    if (resultSets.length === 0) {
      return {
        success: true,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        messages: [],
        error: null,
        blocked: false,
      }
    }

    const first = resultSets[0]
    const rows = first.values.map((row) => row.map(formatCellValue))
    return {
      success: true,
      columns: first.columns,
      rows,
      rowCount: rows.length,
      executionTimeMs,
      messages: [],
      error: null,
      blocked: false,
    }
  } catch (error) {
    const executionTimeMs = performance.now() - started
    const message = error instanceof Error ? error.message : 'SQL execution failed.'
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs,
      messages: [],
      error: message,
      blocked: false,
    }
  }
}

export async function runTrustedSql(
  databaseId: SqlDatabaseId,
  sql: string,
  onLoading?: () => void,
): Promise<SqlQueryResult> {
  return execSqlOnDatabase(databaseId, sql, onLoading)
}

export async function runSelectQuery(
  databaseId: SqlDatabaseId,
  sql: string,
  onLoading?: () => void,
): Promise<SqlQueryResult> {
  const guard = validateUserSql(sql)
  if (!guard.ok) {
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      messages: [],
      error: guard.message,
      blocked: true,
    }
  }

  const outcome = await execSqlOnDatabase(databaseId, sql, onLoading)
  if (!outcome.success) return outcome

  return {
    ...outcome,
    messages: buildSuccessMessages(outcome.rowCount, outcome.executionTimeMs),
  }
}

/** @deprecated Use runTrustedSql('university_system', sql) */
export async function runTrustedUniversitySql(
  sql: string,
  onLoading?: () => void,
): Promise<SqlQueryResult> {
  return runTrustedSql('university_system', sql, onLoading)
}

/** @deprecated Use runSelectQuery('university_system', sql) */
export async function runUniversitySelectQuery(
  sql: string,
  onLoading?: () => void,
): Promise<SqlQueryResult> {
  return runSelectQuery('university_system', sql, onLoading)
}
