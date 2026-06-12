import type { SqlQueryResult } from './sqlRunner'

export interface SqlValidationOptions {
  requireExactColumns: boolean
  requireExactOrder: boolean
  normalizeCase: boolean
  numericTolerance?: number
}

export type SqlMistakeErrorType =
  | 'syntax_error'
  | 'blocked_query'
  | 'missing_column'
  | 'extra_column'
  | 'row_count_mismatch'
  | 'value_mismatch'
  | 'empty_result'
  | 'other'

export interface SqlAnswerCheckResult {
  passed: boolean
  feedback: string[]
  errorType: SqlMistakeErrorType | null
  studentColumns: string[]
  expectedColumns: string[]
  studentRowCount: number
  expectedRowCount: number
  studentResult: SqlQueryResult | null
}

function normalizeColumn(name: string, normalizeCase: boolean): string {
  return normalizeCase ? name.toLowerCase() : name
}

function normalizeCell(value: string | null, normalizeCase: boolean): string {
  if (value === null) return '__NULL__'
  return normalizeCase ? value.toLowerCase() : value
}

function parseNumeric(value: string | null): number | null {
  if (value === null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function cellsEqual(
  a: string | null,
  b: string | null,
  options: SqlValidationOptions,
): boolean {
  const tol = options.numericTolerance ?? 0
  const numA = parseNumeric(a)
  const numB = parseNumeric(b)
  if (numA !== null && numB !== null && tol > 0) {
    return Math.abs(numA - numB) <= tol
  }
  return normalizeCell(a, options.normalizeCase) === normalizeCell(b, options.normalizeCase)
}

function rowKey(row: (string | null)[], options: SqlValidationOptions): string {
  return row.map((cell) => normalizeCell(cell, options.normalizeCase)).join('\u001f')
}

function compareRows(
  studentRows: (string | null)[][],
  expectedRows: (string | null)[][],
  options: SqlValidationOptions,
): boolean {
  if (studentRows.length !== expectedRows.length) return false

  const student = options.requireExactOrder
    ? studentRows
    : [...studentRows].sort((a, b) => rowKey(a, options).localeCompare(rowKey(b, options)))
  const expected = options.requireExactOrder
    ? expectedRows
    : [...expectedRows].sort((a, b) => rowKey(a, options).localeCompare(rowKey(b, options)))

  for (let i = 0; i < expected.length; i += 1) {
    const expRow = expected[i]
    const stuRow = student[i]
    if (expRow.length !== stuRow.length) return false
    for (let j = 0; j < expRow.length; j += 1) {
      if (!cellsEqual(stuRow[j], expRow[j], options)) return false
    }
  }
  return true
}

export function validateSqlResults(
  student: SqlQueryResult,
  solution: SqlQueryResult,
  options: SqlValidationOptions,
): SqlAnswerCheckResult {
  const base = {
    studentColumns: student.columns,
    expectedColumns: solution.columns,
    studentRowCount: student.rowCount,
    expectedRowCount: solution.rowCount,
    studentResult: student,
  }

  if (student.blocked) {
    return {
      ...base,
      passed: false,
      errorType: 'blocked_query',
      feedback: ['Your query was blocked because only SELECT queries are allowed.'],
    }
  }

  if (!student.success) {
    return {
      ...base,
      passed: false,
      errorType: 'syntax_error',
      feedback: ['Your SQL has a syntax error.', student.error ?? 'SQL execution failed.'],
    }
  }

  if (!solution.success) {
    return {
      ...base,
      passed: false,
      errorType: 'other',
      feedback: ['Unable to validate: solution query failed internally.'],
    }
  }

  const feedback: string[] = ['Your query ran successfully, but the answer is not correct yet.']

  const studentCols = student.columns.map((c) => normalizeColumn(c, options.normalizeCase))
  const expectedCols = solution.columns.map((c) => normalizeColumn(c, options.normalizeCase))

  if (options.requireExactColumns) {
    const missing = solution.columns.filter(
      (col) => !studentCols.includes(normalizeColumn(col, options.normalizeCase)),
    )
    const extra = student.columns.filter(
      (col) => !expectedCols.includes(normalizeColumn(col, options.normalizeCase)),
    )

    if (missing.length > 0 || extra.length > 0) {
      feedback.length = 0
      feedback.push('Your query ran successfully, but the column names do not match.')
      for (const col of missing) feedback.push(`Missing column: ${col}`)
      for (const col of extra) feedback.push(`Extra column: ${col}`)
      return {
        ...base,
        passed: false,
        errorType: missing.length > 0 ? 'missing_column' : 'extra_column',
        feedback,
      }
    }
  }

  if (student.rowCount !== solution.rowCount) {
    feedback.length = 0
    feedback.push(`Expected ${solution.rowCount} rows but got ${student.rowCount}.`)
    return {
      ...base,
      passed: false,
      errorType: 'row_count_mismatch',
      feedback,
    }
  }

  if (student.rowCount === 0 && solution.rowCount === 0) {
    return {
      ...base,
      passed: true,
      errorType: null,
      feedback: ['Correct answer.'],
    }
  }

  if (student.rowCount === 0) {
    return {
      ...base,
      passed: false,
      errorType: 'empty_result',
      feedback: ['Your query returned no rows.'],
    }
  }

  const studentAligned = alignRowsToExpectedColumns(student, solution, options)
  if (!compareRows(studentAligned, solution.rows, options)) {
    feedback.length = 0
    feedback.push('The values do not match the expected result.')
    if (options.requireExactOrder) {
      feedback.push('Row order matters for this question.')
    }
    return {
      ...base,
      passed: false,
      errorType: 'value_mismatch',
      feedback,
    }
  }

  return {
    ...base,
    passed: true,
    errorType: null,
    feedback: ['Correct answer.'],
  }
}

function alignRowsToExpectedColumns(
  student: SqlQueryResult,
  solution: SqlQueryResult,
  options: SqlValidationOptions,
): (string | null)[][] {
  return student.rows.map((row) =>
    solution.columns.map((expectedCol) => {
      const idx = student.columns.findIndex(
        (col) =>
          normalizeColumn(col, options.normalizeCase) ===
          normalizeColumn(expectedCol, options.normalizeCase),
      )
      return idx >= 0 ? row[idx] : null
    }),
  )
}
