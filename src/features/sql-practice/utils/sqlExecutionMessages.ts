import { SQL_DATABASE_CATALOG, getDatabaseById } from '../data/databaseCatalog'
import type { SqlDatabaseId } from '../types/sqlPractice.types'

const TABLE_HOME_DATABASE = new Map<string, SqlDatabaseId>()

for (const db of SQL_DATABASE_CATALOG) {
  for (const table of db.tables) {
    TABLE_HOME_DATABASE.set(table.name.toLowerCase(), db.id)
  }
}

const NO_SUCH_TABLE_PATTERN = /no such table:\s*([A-Za-z_][\w]*)/i

export function buildSqlErrorMessages(databaseId: SqlDatabaseId, error: string): string[] {
  const primary = error.trim() || 'SQL execution failed.'
  const messages = [primary]

  const match = primary.match(NO_SUCH_TABLE_PATTERN)
  if (!match) return messages

  const tableName = match[1].toLowerCase()
  const homeDatabaseId = TABLE_HOME_DATABASE.get(tableName)
  if (!homeDatabaseId || homeDatabaseId === databaseId) return messages

  const currentDatabase = getDatabaseById(databaseId)
  const homeDatabase = getDatabaseById(homeDatabaseId)

  messages.push(
    `You are using ${currentDatabase.displayName}, but this table may belong to another database. Try selecting ${homeDatabase.displayName} for ${tableName}.`,
  )

  return messages
}

export function isSqlExecutionErrorMessage(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('no such table') ||
    lower.includes('syntax error') ||
    lower.includes('sql execution failed') ||
    lower.includes('query blocked') ||
    lower.includes('only select')
  )
}
