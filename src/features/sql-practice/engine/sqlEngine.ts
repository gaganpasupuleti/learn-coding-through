import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { UNIVERSITY_SEED_STATEMENTS } from '../data/universitySeedSql'

let sqlModule: SqlJsStatic | null = null
let universityDb: Database | null = null
let loadPromise: Promise<Database> | null = null

export function isUniversitySqlEngineReady(): boolean {
  return universityDb !== null
}

export async function getUniversityDatabase(onLoading?: () => void): Promise<Database> {
  if (universityDb) return universityDb

  if (!loadPromise) {
    loadPromise = (async () => {
      onLoading?.()
      const SQL = await initSqlJs({
        locateFile: () => sqlWasmUrl,
      })
      sqlModule = SQL
      const db = new SQL.Database()
      for (const statement of UNIVERSITY_SEED_STATEMENTS) {
        db.run(statement)
      }
      universityDb = db
      return db
    })().catch((error) => {
      loadPromise = null
      throw error
    })
  } else {
    onLoading?.()
  }

  return loadPromise
}

/** Test-only reset (not used in UI). */
export function resetUniversitySqlEngineForTests(): void {
  universityDb?.close()
  universityDb = null
  loadPromise = null
  sqlModule = null
}

export function getSqlModuleForTests(): SqlJsStatic | null {
  return sqlModule
}
