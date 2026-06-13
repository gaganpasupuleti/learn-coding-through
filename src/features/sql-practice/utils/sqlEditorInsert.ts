import type { SqlDatabaseMeta, SqlPracticeQuestion, SqlSchemaRelationship, SqlTableMeta } from '../types/sqlPractice.types'

export interface SqlInsertResult {
  text: string
  cursorOffset: number
}

export function insertSnippetAtCursor(
  currentSql: string,
  snippet: string,
  cursorPosition?: number,
): SqlInsertResult {
  const pos = Math.max(0, Math.min(cursorPosition ?? currentSql.length, currentSql.length))
  const before = currentSql.slice(0, pos)
  const after = currentSql.slice(pos)

  const trimmedBefore = before.trimEnd()
  const needsGap = trimmedBefore.length > 0 && !before.endsWith('\n')
  const prefix = needsGap ? '\n\n' : ''
  const suffix = after.length > 0 && !after.startsWith('\n') && after.trim().length > 0 ? '' : ''

  const text = `${before}${prefix}${snippet}${suffix}${after}`
  const cursorOffset = before.length + prefix.length + snippet.length
  return { text, cursorOffset }
}

export function appendSnippet(currentSql: string, snippet: string): SqlInsertResult {
  const trimmed = currentSql.trimEnd()
  if (!trimmed) {
    return { text: snippet, cursorOffset: snippet.length }
  }
  const text = `${trimmed}\n\n${snippet}`
  return { text, cursorOffset: text.length }
}

export function buildSelectTemplate(tableName: string): string {
  return `SELECT *\nFROM ${tableName}\nLIMIT 10;`
}

export function buildJoinTemplate(relationship: SqlSchemaRelationship): string {
  return `SELECT *\nFROM ${relationship.fromTable}\nJOIN ${relationship.toTable}\nON ${relationship.fromTable}.${relationship.fromColumn} = ${relationship.toTable}.${relationship.toColumn}\nLIMIT 10;`
}

export function buildCountTemplate(tableName: string): string {
  return `SELECT COUNT(*) AS total_count\nFROM ${tableName};`
}

export function buildGroupByTemplate(tableName: string, columnName: string): string {
  return `SELECT ${columnName}, COUNT(*) AS total_count\nFROM ${tableName}\nGROUP BY ${columnName}\nORDER BY total_count DESC;`
}

export function buildWhereTemplate(tableName: string, columnName: string): string {
  return `SELECT *\nFROM ${tableName}\nWHERE ${columnName} = 'value'\nLIMIT 10;`
}

export function buildHavingTemplate(tableName: string, groupColumn: string): string {
  return `SELECT ${groupColumn}, COUNT(*) AS total_count\nFROM ${tableName}\nGROUP BY ${groupColumn}\nHAVING COUNT(*) > 1\nORDER BY total_count DESC;`
}

export function buildOrderLimitTemplate(tableName: string, columnName: string): string {
  return `SELECT *\nFROM ${tableName}\nORDER BY ${columnName}\nLIMIT 10;`
}

export function buildJoinTwoTablesTemplate(
  fromTable: string,
  toTable: string,
  fromColumn: string,
  toColumn: string,
): string {
  return `SELECT *\nFROM ${fromTable}\nJOIN ${toTable}\nON ${fromTable}.${fromColumn} = ${toTable}.${toColumn}\nLIMIT 10;`
}

export function getDefaultTableName(database: SqlDatabaseMeta, question?: SqlPracticeQuestion): string {
  if (question) {
    const haystack = `${question.starterSql}\n${question.solutionSql}`.toLowerCase()
    const match = database.tables.find((table) => haystack.includes(table.name.toLowerCase()))
    if (match) return match.name
  }
  return database.tables[0]?.name ?? 'table_name'
}

export function getDefaultColumnName(table: SqlTableMeta | undefined): string {
  if (!table) return 'column_name'
  const nonPk = table.columns.find((column) => !column.isPrimaryKey)
  return nonPk?.name ?? table.columns[0]?.name ?? 'column_name'
}

export function getDefaultJoinPair(database: SqlDatabaseMeta): {
  fromTable: string
  toTable: string
  fromColumn: string
  toColumn: string
} | null {
  for (const table of database.tables) {
    for (const column of table.columns) {
      if (!column.references) continue
      return {
        fromTable: table.name,
        toTable: column.references.table,
        fromColumn: column.name,
        toColumn: column.references.column,
      }
    }
  }
  return null
}

export function buildColumnSnippet(columnName: string): string {
  return columnName
}
