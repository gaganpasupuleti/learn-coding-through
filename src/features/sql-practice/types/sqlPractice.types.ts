/**
 * Issue #30 — SQL Practice Ground types.
 */

export const SQL_PRACTICE_ROUTE = '/practice/sql'

export type SqlDatabaseId = 'university_system' | 'hospital_management' | 'shipping_logistics'

export type SqlPracticeDifficulty = 'easy' | 'medium' | 'hard'

export type SqlPracticeTopic =
  | 'select'
  | 'filtering'
  | 'joins'
  | 'aggregates'
  | 'subqueries'

export interface SqlValidationOptions {
  requireExactColumns: boolean
  requireExactOrder: boolean
  normalizeCase: boolean
  numericTolerance?: number
}

export type SqlValidationMode = 'default' | 'ordered' | 'aggregate'

export interface SqlColumnMeta {
  name: string
  dataType: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  references?: { table: string; column: string }
}

export interface SqlTableMeta {
  name: string
  rowCount: number
  columns: SqlColumnMeta[]
}

export interface SqlDatabaseMeta {
  id: SqlDatabaseId
  displayName: string
  description: string
  tables: SqlTableMeta[]
  viewNames: string[]
  storedProcedureNames: string[]
}

export interface SqlPracticeQuestion {
  id: string
  title: string
  databaseId: SqlDatabaseId
  difficulty: SqlPracticeDifficulty
  topic: SqlPracticeTopic
  problemStatement: string
  learningObjective: string
  expectedColumns: string[]
  hints: string[]
  starterSql: string
  solutionSql: string
  validationMode: SqlValidationMode
  validation?: Partial<SqlValidationOptions>
}

export type SqlBottomTab =
  | 'results'
  | 'expected'
  | 'messages'
  | 'history'
  | 'mistakes'
  | 'schema'
  | 'schema3d'

export type SqlAttemptAction = 'run' | 'check'

export type SqlAttemptStatus = 'success' | 'error' | 'blocked' | 'passed' | 'failed'

export type SqlRunState = 'ready' | 'running' | 'success' | 'error' | 'checking' | 'passed' | 'failed'

export type SqlMistakeErrorType =
  | 'syntax_error'
  | 'blocked_query'
  | 'missing_column'
  | 'extra_column'
  | 'row_count_mismatch'
  | 'value_mismatch'
  | 'empty_result'
  | 'other'

export interface SqlQueryGrid {
  columns: string[]
  rows: (string | null)[][]
  rowCount: number
  executionTimeMs: number
  hasRun: boolean
}

export interface SqlAnswerFeedback {
  passed: boolean
  feedback: string[]
  studentColumns: string[]
  expectedColumns: string[]
  studentRowCount: number
  expectedRowCount: number
  checkedAt: string
}

export interface SqlAttemptRecord {
  id: string
  questionId?: string
  questionTitle?: string
  databaseId: SqlDatabaseId
  sql: string
  ranAt: string
  action: SqlAttemptAction
  status: SqlAttemptStatus
  success: boolean
  rowCount: number
  executionTimeMs: number
  message: string
  feedbackSummary?: string
}

export interface SqlMistakeRecord {
  id: string
  questionId: string
  databaseId: SqlDatabaseId
  sql: string
  recordedAt: string
  errorType: SqlMistakeErrorType
  feedback: string
  message: string
}

export function getValidationOptionsForQuestion(question: SqlPracticeQuestion): SqlValidationOptions {
  const defaults: Record<SqlValidationMode, SqlValidationOptions> = {
    default: {
      requireExactColumns: true,
      requireExactOrder: false,
      normalizeCase: true,
    },
    ordered: {
      requireExactColumns: true,
      requireExactOrder: true,
      normalizeCase: true,
    },
    aggregate: {
      requireExactColumns: true,
      requireExactOrder: false,
      normalizeCase: true,
      numericTolerance: 0.01,
    },
  }
  return { ...defaults[question.validationMode], ...question.validation }
}
