import { getUniversityDatabase } from './sqlEngine'
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

export async function runUniversitySelectQuery(
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

  const started = performance.now()

  try {
    const db = await getUniversityDatabase(onLoading)
    const resultSets = db.exec(sql)
    const executionTimeMs = performance.now() - started

    if (resultSets.length === 0) {
      return {
        success: true,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        messages: [
          'Query executed successfully.',
          'Rows returned: 0',
          'Query returned no rows.',
          `Execution time: ${Math.round(executionTimeMs)} ms`,
        ],
        error: null,
        blocked: false,
      }
    }

    const first = resultSets[0]
    const rows = first.values.map((row) => row.map(formatCellValue))
    const rowCount = rows.length
    const messages = [
      'Query executed successfully.',
      `Rows returned: ${rowCount}`,
      `Execution time: ${Math.round(executionTimeMs)} ms`,
    ]
    if (rowCount === 0) {
      messages.splice(2, 0, 'Query returned no rows.')
    }

    return {
      success: true,
      columns: first.columns,
      rows,
      rowCount,
      executionTimeMs,
      messages,
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
