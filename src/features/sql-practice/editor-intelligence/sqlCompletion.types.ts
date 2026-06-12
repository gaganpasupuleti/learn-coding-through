import type { SqlDatabaseMeta } from '../types/sqlPractice.types'

export type SqlCompletionContext =
  | 'general'
  | 'after_select'
  | 'after_from'
  | 'after_join'
  | 'after_where'
  | 'after_group_by'
  | 'after_order_by'
  | 'after_having'
  | 'table_qualified'

export interface SqlCompletionSchema {
  database: SqlDatabaseMeta
}

export interface SqlKeywordCompletion {
  label: string
  insertText?: string
  detail?: string
}

export interface SqlSnippetCompletion {
  label: string
  insertText: string
  detail?: string
  documentation?: string
  filterText?: string
}
