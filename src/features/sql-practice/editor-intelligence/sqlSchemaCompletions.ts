import type { SqlDatabaseMeta } from '../types/sqlPractice.types'
import type { SqlCompletionContext } from './sqlCompletion.types'

export function getTableNames(database: SqlDatabaseMeta): string[] {
  return database.tables.map((t) => t.name)
}

export function getAllColumnNames(database: SqlDatabaseMeta): string[] {
  const seen = new Set<string>()
  const columns: string[] = []
  for (const table of database.tables) {
    for (const col of table.columns) {
      if (!seen.has(col.name)) {
        seen.add(col.name)
        columns.push(col.name)
      }
    }
  }
  return columns.sort()
}

export function getColumnsForTable(database: SqlDatabaseMeta, tableName: string): string[] {
  const table = database.tables.find((t) => t.name.toLowerCase() === tableName.toLowerCase())
  return table?.columns.map((c) => c.name) ?? []
}

export function resolveTableFromQualifier(
  database: SqlDatabaseMeta,
  qualifier: string,
  sqlText: string,
): string | null {
  const direct = database.tables.find((t) => t.name.toLowerCase() === qualifier.toLowerCase())
  if (direct) return direct.name

  const aliasPattern = new RegExp(
    `\\bFROM\\s+\\w+\\s+(?:AS\\s+)?${qualifier}\\b|\\bJOIN\\s+\\w+\\s+(?:AS\\s+)?${qualifier}\\b`,
    'i',
  )
  if (aliasPattern.test(sqlText)) {
    const fromMatch = sqlText.match(
      new RegExp(`\\b(?:FROM|JOIN)\\s+(\\w+)\\s+(?:AS\\s+)?${qualifier}\\b`, 'i'),
    )
    if (fromMatch?.[1]) return fromMatch[1]
  }
  return null
}

const CONTEXT_KEYWORD_RE =
  /\b(SELECT|FROM|JOIN|INNER\s+JOIN|LEFT\s+JOIN|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING)\s*$/i

export function detectSqlCompletionContext(
  textBeforeCursor: string,
): { context: SqlCompletionContext; tableQualifier?: string } {
  const qualified = /(?:\b(\w+)\.)$/.exec(textBeforeCursor)
  if (qualified) {
    return { context: 'table_qualified', tableQualifier: qualified[1] }
  }

  const trimmed = textBeforeCursor.trimEnd()
  if (/\b(FROM|JOIN)\s*$/i.test(trimmed)) {
    return { context: 'after_from' }
  }

  const normalized = textBeforeCursor.replace(/\s+/g, ' ').toUpperCase()
  if (/\bSELECT\s*$/.test(normalized) || /,\s*$/.test(textBeforeCursor)) {
    return { context: 'after_select' }
  }
  if (/\bWHERE\s*$/.test(normalized)) {
    return { context: 'after_where' }
  }
  if (/\bGROUP\s+BY\s*$/.test(normalized)) {
    return { context: 'after_group_by' }
  }
  if (/\bORDER\s+BY\s*$/.test(normalized)) {
    return { context: 'after_order_by' }
  }
  if (/\bHAVING\s*$/.test(normalized)) {
    return { context: 'after_having' }
  }
  if (CONTEXT_KEYWORD_RE.test(textBeforeCursor)) {
    return { context: 'general' }
  }
  return { context: 'general' }
}
