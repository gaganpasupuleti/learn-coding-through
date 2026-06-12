import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import type { SqlDatabaseId } from '../types/sqlPractice.types'
import { UNIVERSITY_SEED_STATEMENTS } from '../data/universitySeedSql'
import { HOSPITAL_SEED_STATEMENTS } from '../data/hospitalSeedSql'
import { SHIPPING_SEED_STATEMENTS } from '../data/shippingSeedSql'

const SEED_STATEMENTS: Record<SqlDatabaseId, string[]> = {
  university_system: UNIVERSITY_SEED_STATEMENTS,
  hospital_management: HOSPITAL_SEED_STATEMENTS,
  shipping_logistics: SHIPPING_SEED_STATEMENTS,
}

export const EXECUTABLE_SQL_DATABASE_IDS: SqlDatabaseId[] = [
  'university_system',
  'hospital_management',
  'shipping_logistics',
]

export function isExecutableSqlDatabase(databaseId: SqlDatabaseId): boolean {
  return EXECUTABLE_SQL_DATABASE_IDS.includes(databaseId)
}

let sqlModule: SqlJsStatic | null = null
const databaseCache: Partial<Record<SqlDatabaseId, Database>> = {}
const loadPromises: Partial<Record<SqlDatabaseId, Promise<Database>>> = {}

function seedDatabase(SQL: SqlJsStatic, databaseId: SqlDatabaseId): Database {
  const db = new SQL.Database()
  for (const statement of SEED_STATEMENTS[databaseId]) {
    db.run(statement)
  }
  return db
}

export function isSqlEngineReady(databaseId: SqlDatabaseId): boolean {
  return databaseCache[databaseId] !== undefined
}

export async function getSqlDatabase(
  databaseId: SqlDatabaseId,
  onLoading?: () => void,
): Promise<Database> {
  const cached = databaseCache[databaseId]
  if (cached) return cached

  let promise = loadPromises[databaseId]
  if (!promise) {
    promise = (async () => {
      onLoading?.()
      if (!sqlModule) {
        sqlModule = await initSqlJs({
          locateFile: () => sqlWasmUrl,
        })
      }
      const db = seedDatabase(sqlModule, databaseId)
      databaseCache[databaseId] = db
      return db
    })().catch((error) => {
      delete loadPromises[databaseId]
      throw error
    })
    loadPromises[databaseId] = promise
  } else {
    onLoading?.()
  }

  return promise
}

/** @deprecated Use getSqlDatabase('university_system') */
export async function getUniversityDatabase(onLoading?: () => void): Promise<Database> {
  return getSqlDatabase('university_system', onLoading)
}

export function isUniversitySqlEngineReady(): boolean {
  return isSqlEngineReady('university_system')
}

/** Test-only reset (not used in UI). */
export function resetSqlEngineForTests(databaseId?: SqlDatabaseId): void {
  if (databaseId) {
    databaseCache[databaseId]?.close()
    delete databaseCache[databaseId]
    delete loadPromises[databaseId]
    return
  }

  for (const id of EXECUTABLE_SQL_DATABASE_IDS) {
    databaseCache[id]?.close()
    delete databaseCache[id]
    delete loadPromises[id]
  }
  sqlModule = null
}

/** @deprecated Use resetSqlEngineForTests('university_system') */
export function resetUniversitySqlEngineForTests(): void {
  resetSqlEngineForTests('university_system')
}

export function getSqlModuleForTests(): SqlJsStatic | null {
  return sqlModule
}
