# Issue #30 Phase 2 — sql.js University Execution Report

## A. Summary

Phase 2 wires the SQL Workbench Run button to execute **SELECT-only** queries against an in-browser **university_system** SQLite database powered by **sql.js**. Hospital and shipping databases remain visible in Object Explorer but show a later-phase message when Run is clicked. No backend SQL, production DB, or Code Workbench changes.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/engine/sqlEngine.ts` | Lazy sql.js init, WASM load, in-memory DB + seed |
| `src/features/sql-practice/engine/sqlRunner.ts` | Guardrails → execute → structured result |
| `src/features/sql-practice/engine/sqlGuardrails.ts` | SELECT/WITH-only validation |
| `src/features/sql-practice/data/universitySeedSql.ts` | Trusted DDL/DML for 12 tables |
| `issue-30-phase-2-sqljs-university-report.md` | This report |

## C. Files modified

| File | Change |
|------|--------|
| `package.json` / `package-lock.json` | Added `sql.js` dependency |
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Run handler, result state, attempts |
| `src/features/sql-practice/components/SqlTopBar.tsx` | Running state, Ready/Success/Error |
| `src/features/sql-practice/components/SqlEditorPanel.tsx` | Ctrl/Cmd+Enter shortcut |
| `src/features/sql-practice/components/SqlBottomPanel.tsx` | Results grid + history refresh |
| `src/features/sql-practice/components/SqlResultsPanel.tsx` | Real result table |
| `src/features/sql-practice/components/SqlStatusBar.tsx` | Run state in footer |
| `src/features/sql-practice/data/databaseCatalog.ts` | University metadata aligned to seed |
| `src/features/sql-practice/data/sqlQuestions.ts` | Starter queries use `student_name`, `city` |
| `src/features/sql-practice/types/sqlPractice.types.ts` | `SqlQueryGrid`, `SqlRunState`, attempt fields |
| `src/features/sql-practice/utils/sqlPracticeStorage.ts` | `appendSqlAttempt()` |
| `src/features/sql-practice/README.md` | Phase 2 scope + WASM notes |

## D. Dependency added

- **sql.js** `^1.14.1` (frontend only)

## E. sql.js loading approach

`sqlEngine.ts` imports the WASM binary via Vite's asset URL:

```ts
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
initSqlJs({ locateFile: () => sqlWasmUrl })
```

Production build emits `dist/assets/sql-wasm-*.wasm` (~660 KB). No manual `public/` copy required.

## F. university_system seed tables

| Table | Rows (approx.) | Notes |
|-------|----------------|-------|
| universities | 3 | Root org |
| colleges | 4 | FK → universities |
| departments | 6 | FK → colleges |
| programs | 6 | FK → departments |
| courses | 10 | FK → departments |
| students | 15 | Includes Hyderabad rows for WHERE practice |
| faculty | 10 | FK → departments |
| semesters | 4 | |
| enrollments | 20 | FK → students, courses, semesters |
| grades | 15 | FK → enrollments |
| classrooms | 8 | |
| attendance | 12 | FK → enrollments |

## G. Run execution flow

1. User clicks **Run** or presses Ctrl/Cmd+Enter.
2. If database ≠ `university_system` → show later-phase message, save blocked attempt.
3. Else `runUniversitySelectQuery(sql)`:
   - `validateUserSql()` guardrails
   - `getUniversityDatabase()` (lazy sql.js + seed on first run)
   - `db.exec(sql)` — first result set only
4. UI updates Results, Messages, status bar; `appendSqlAttempt()` to localStorage.

## H. Guardrails

User SQL must start with `SELECT` or `WITH`. Blocked keywords: DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, TRUNCATE, ATTACH, DETACH, REPLACE, VACUUM, unsafe PRAGMA.

Friendly error: **"Only SELECT queries are allowed in practice mode."**

Trusted seed SQL in `universitySeedSql.ts` is not validated.

## I. Result grid behavior

- Empty state before first run
- Column headers from query result
- Row numbers (# column)
- NULL displayed as `NULL`
- "Query returned no rows" when SELECT succeeds with zero rows
- Syntax/runtime errors clear grid, show error in Messages

## J. Messages behavior

Success:

```
Query executed successfully.
Rows returned: X
Execution time: Y ms
```

Guardrail / syntax errors shown as plain text in Messages tab. Engine loading shows "Loading SQL engine…".

## K. LocalStorage attempt tracking

Key: `sql-practice-attempt-history` (max 50 entries).

Each run saves: `id`, `databaseId`, `sql`, `ranAt`, `status` (success/error/blocked), `rowCount`, `executionTimeMs`, `message`.

## L. What was intentionally not implemented

- Execution for hospital_management / shipping_logistics
- Answer checking / expected output validation
- SQL autocomplete
- 3D schema
- Backend `/api` SQL
- Production DB / DATABASE_URL / Railway / Postgres
- AI / LLM / paid APIs
- Judge0
- Code Workbench changes

## M. Build result

```
npm run build
✓ built in ~3m 15s (exit 0)
dist/assets/sql-wasm-UFUCzYNW.wasm  659.73 kB
```

## N. Smoke test result

| # | Check | Status |
|---|-------|--------|
| 1 | `/practice/sql` loads | Manual — verify in browser |
| 2 | university_system selected | Default on load |
| 3–5 | `SELECT * FROM students LIMIT 10` | Engine + seed designed for this |
| 6–8 | Hyderabad filter query | Seed includes Hyderabad students |
| 9–10 | JOIN enrollments/courses | Seed FK data supports JOIN |
| 11 | Invalid SQL → friendly error | sqlRunner catch returns error message |
| 12 | `DROP TABLE` blocked | sqlGuardrails |
| 13 | hospital_management → later-phase msg | SqlPracticePage branch |
| 14–16 | Clear / Reset / Ctrl+Enter | Implemented |
| 17 | Attempt history | appendSqlAttempt |
| 18–19 | `/practice/code` + JS Run | Not modified |
| 20–22 | No prod DB / backend SQL / AI | Verified by scope |

Automated: `npx eslint src/features/sql-practice` — exit 0.

## O. Risks / limitations

- **Bundle size**: sql.js WASM ~660 KB added to build output.
- **Single DB**: Only university_system executes; metadata for other DBs may not match future seeds.
- **First-run latency**: WASM download + seed on first Run (loading message shown).
- **SELECT only**: No EXPLAIN, PRAGMA (except safe introspection patterns blocked anyway), or multi-statement scripts.
- **One result set**: Only first result set from `db.exec()` returned.

## P. Phase 3 plan

1. Answer checking against expected column sets / row hashes
2. Per-question validation and mistake tracking
3. Seed + execution for hospital_management and shipping_logistics
4. SQL formatting and richer Messages
5. Optional lazy-load sql.js chunk to reduce initial bundle
