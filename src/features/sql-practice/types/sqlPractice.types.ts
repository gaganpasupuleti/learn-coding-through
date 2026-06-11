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

export interface SqlAttemptRecord {
  id: string
  questionId: string
  sql: string
  ranAt: string
  success: boolean
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
