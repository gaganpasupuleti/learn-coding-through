import type { SqlExpectedOutputPreview, SqlPracticeQuestion } from '../types/sqlPractice.types'
import type { SqlQueryResult } from '../engine/sqlRunner'

export const ZERO_ROW_PREVIEW_MESSAGE =
  'Expected output has 0 rows for this seed data, but these are the expected columns.'

export const PREVIEW_SAMPLE_ROW_LIMIT = 5

export type ExpectedPreviewSqlOutcome = Pick<
  SqlQueryResult,
  'success' | 'columns' | 'rows' | 'rowCount' | 'error'
>

export function mapExpectedPreviewResult(
  question: SqlPracticeQuestion,
  outcome: ExpectedPreviewSqlOutcome,
): SqlExpectedOutputPreview {
  if (!outcome.success) {
    return {
      status: 'error',
      columns: [],
      sampleRows: [],
      rowCount: 0,
      errorMessage: outcome.error ?? 'Unable to load expected output preview.',
    }
  }

  const hasResultColumns = outcome.columns.length > 0
  const columns = hasResultColumns ? outcome.columns : question.expectedColumns
  const rowCount = outcome.rowCount
  const sampleRows = outcome.rows.slice(0, PREVIEW_SAMPLE_ROW_LIMIT)
  const usedColumnFallback = !hasResultColumns && question.expectedColumns.length > 0

  return {
    status: 'ready',
    columns,
    sampleRows,
    rowCount,
    zeroRowMessage: rowCount === 0 && usedColumnFallback ? ZERO_ROW_PREVIEW_MESSAGE : undefined,
  }
}
