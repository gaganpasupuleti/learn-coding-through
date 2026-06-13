import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { HOSPITAL_SEED_STATEMENTS } from '../data/hospitalSeedSql'
import { SHIPPING_SEED_STATEMENTS } from '../data/shippingSeedSql'
import { UNIVERSITY_SEED_STATEMENTS } from '../data/universitySeedSql'
import type { SqlDatabaseId } from '../types/sqlPractice.types'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const WASM_PATH = path.join(REPO_ROOT, 'node_modules/sql.js/dist/sql-wasm.wasm')

const SEEDS: Record<SqlDatabaseId, string[]> = {
  university_system: UNIVERSITY_SEED_STATEMENTS,
  hospital_management: HOSPITAL_SEED_STATEMENTS,
  shipping_logistics: SHIPPING_SEED_STATEMENTS,
}

let sqlModule: SqlJsStatic | null = null
let databases: Record<SqlDatabaseId, Database> | null = null

export interface SqlExecResultSet {
  columns: string[]
  values: (string | number | null)[][]
}

export async function initSqlJsSeedHarness(): Promise<{
  SQL: SqlJsStatic
  databases: Record<SqlDatabaseId, Database>
}> {
  if (sqlModule && databases) {
    return { SQL: sqlModule, databases }
  }

  sqlModule = await initSqlJs({ locateFile: () => WASM_PATH })
  const dbs = {} as Record<SqlDatabaseId, Database>

  for (const [id, statements] of Object.entries(SEEDS) as [SqlDatabaseId, string[]][]) {
    const db = new sqlModule.Database()
    for (const stmt of statements) db.run(stmt)
    dbs[id] = db
  }

  databases = dbs
  return { SQL: sqlModule, databases: dbs }
}

export function execSolutionOnDatabase(
  db: Database,
  solutionSql: string,
): SqlExecResultSet[] {
  return db.exec(solutionSql) as SqlExecResultSet[]
}

export function normalizeColumnName(name: string): string {
  return name.toLowerCase()
}

export function resultColumnsMatchExpected(
  resultColumns: string[],
  expectedColumns: string[],
): boolean {
  const resultNorm = resultColumns.map(normalizeColumnName).sort()
  const expectedNorm = expectedColumns.map(normalizeColumnName).sort()
  if (resultNorm.length !== expectedNorm.length) return false
  return resultNorm.every((col, i) => col === expectedNorm[i])
}
