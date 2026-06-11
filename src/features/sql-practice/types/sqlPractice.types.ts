/**
 * Issue #30 — SQL Practice Ground types (Phase 1 UI shell).
 * No execution, production DB, or backend SQL in this phase.
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
}

export type SqlBottomTab =
  | 'results'
  | 'expected'
  | 'messages'
  | 'history'
  | 'mistakes'
  | 'schema'
  | 'schema3d'

export type SqlAttemptStatus = 'success' | 'error' | 'blocked'

export type SqlRunState = 'ready' | 'running' | 'success' | 'error'

export interface SqlQueryGrid {
  columns: string[]
  rows: (string | null)[][]
  rowCount: number
  executionTimeMs: number
  hasRun: boolean
}

export interface SqlAttemptRecord {
  id: string
  questionId?: string
  databaseId: SqlDatabaseId
  sql: string
  ranAt: string
  status: SqlAttemptStatus
  success: boolean
  rowCount: number
  executionTimeMs: number
  message: string
}

export interface SqlMistakeRecord {
  id: string
  questionId: string
  sql: string
  recordedAt: string
  category: string
  message: string
}
