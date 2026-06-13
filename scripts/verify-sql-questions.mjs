import initSqlJs from 'sql.js'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const wasmPath = path.join(root, 'node_modules/sql.js/dist/sql-wasm.wasm')

async function loadModule(relPath) {
  const url = pathToFileURL(path.join(root, relPath)).href
  return import(url)
}

function normalizeColumn(name) {
  return name.toLowerCase()
}

function columnsMatch(resultColumns, expectedColumns) {
  const a = [...resultColumns].map(normalizeColumn).sort()
  const b = [...expectedColumns].map(normalizeColumn).sort()
  if (a.length !== b.length) return false
  return a.every((col, i) => col === b[i])
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
  console.log(`Verifying ${SQL_PRACTICE_QUESTIONS.length} solution SQL queries…`)

  for (const q of SQL_PRACTICE_QUESTIONS) {
    const db = dbs[q.databaseId]
    const label = `[${q.databaseId}] ${q.id} (${q.title})`
    try {
      const result = db.exec(q.solutionSql)
      if (!result.length) {
        console.error(`FAIL ${label}: no result set (zero rows or empty metadata)`)
        failed++
        continue
      }
      const first = result[0]
      if (!first.columns?.length) {
        console.error(`FAIL ${label}: missing column metadata`)
        failed++
        continue
      }
      if (!columnsMatch(first.columns, q.expectedColumns)) {
        console.error(
          `FAIL ${label}: column mismatch got [${first.columns.join(', ')}] expected [${q.expectedColumns.join(', ')}]`,
        )
        failed++
        continue
      }
      if (first.values.length === 0) {
        console.error(`FAIL ${label}: zero rows returned`)
        failed++
        continue
      }
      console.log(`OK ${q.id} (${first.values.length} rows)`)
    } catch (err) {
      console.error(`FAIL ${label}: ${err.message}`)
      failed++
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} solution(s) failed verification.`)
  } else {
    console.log(`\nAll ${SQL_PRACTICE_QUESTIONS.length} solutions passed.`)
  }

  process.exit(failed > 0 ? 1 : 0)
}

main()
