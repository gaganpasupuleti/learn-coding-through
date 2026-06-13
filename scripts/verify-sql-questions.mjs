import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const wasmPath = path.join(root, 'node_modules/sql.js/dist/sql-wasm.wasm')

async function loadModule(relPath) {
  const url = pathToFileURL(path.join(root, relPath)).href
  return import(url)
}

async function main() {
  const SQL = await initSqlJs({ locateFile: () => wasmPath })
  const { UNIVERSITY_SEED_STATEMENTS } = await loadModule('src/features/sql-practice/data/universitySeedSql.ts')
  const { HOSPITAL_SEED_STATEMENTS } = await loadModule('src/features/sql-practice/data/hospitalSeedSql.ts')
  const { SHIPPING_SEED_STATEMENTS } = await loadModule('src/features/sql-practice/data/shippingSeedSql.ts')
  const { SQL_PRACTICE_QUESTIONS } = await loadModule('src/features/sql-practice/data/sqlQuestions.ts')

  const seeds = {
    university_system: UNIVERSITY_SEED_STATEMENTS,
    hospital_management: HOSPITAL_SEED_STATEMENTS,
    shipping_logistics: SHIPPING_SEED_STATEMENTS,
  }

  const dbs = {}
  for (const [id, statements] of Object.entries(seeds)) {
    const db = new SQL.Database()
    for (const stmt of statements) db.run(stmt)
    dbs[id] = db
  }

  let failed = 0
  for (const q of SQL_PRACTICE_QUESTIONS) {
    const db = dbs[q.databaseId]
    try {
      const result = db.exec(q.solutionSql)
      if (!result.length) {
        console.error(`FAIL ${q.id}: no result`)
        failed++
        continue
      }
      console.log(`OK ${q.id} (${result[0].values.length} rows)`)
    } catch (err) {
      console.error(`FAIL ${q.id}:`, err.message)
      failed++
    }
  }

  process.exit(failed > 0 ? 1 : 0)
}

main()
