# Issue #30 Phase 4 — Hospital & Shipping SQL Execution Report

Branch: `issue-30-phase-4-hospital-shipping-sql-execution`

## A. Summary

Phase 4 extends the in-browser sql.js workbench to **hospital_management** and **shipping_logistics**. The SQL engine was refactored from university-only to a multi-database cache. Run and Check Answer now work for all three starter databases. Each new database has seed DDL/DML and at least 8 checkable practice questions with hidden `solutionSql`.

University System behavior is unchanged.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/data/hospitalSeedSql.ts` | Hospital DDL + seed rows |
| `src/features/sql-practice/data/shippingSeedSql.ts` | Shipping DDL + seed rows |
| `issue-30-phase-4-hospital-shipping-sql-execution-report.md` | This report |

## C. Files modified

| File | Changes |
|------|---------|
| `src/features/sql-practice/engine/sqlEngine.ts` | Multi-DB `getSqlDatabase()`, lazy per-DB cache |
| `src/features/sql-practice/engine/sqlRunner.ts` | `runSelectQuery()`, `runTrustedSql()` with databaseId |
| `src/features/sql-practice/data/sqlQuestions.ts` | 8 hospital + 8 shipping questions with solutions |
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Run/check against selected database |
| `src/features/sql-practice/components/SqlEditorPanel.tsx` | Remove Phase 2-only execution note |
| `src/features/sql-practice/components/SqlQuestionPanel.tsx` | Use `isCheckableQuestion()` |
| `src/features/sql-practice/components/SqlStatusBar.tsx` | Show active `databaseId` |

## D. Multi-database sql.js engine changes

- `getSqlDatabase(databaseId)` lazily loads sql.js once, then seeds a separate in-memory Database per ID
- `EXECUTABLE_SQL_DATABASE_IDS` and `isExecutableSqlDatabase()` gate Run/Check
- `runSelectQuery(databaseId, sql)` applies user guardrails then executes
- `runTrustedSql(databaseId, sql)` executes solution SQL from question data only
- Legacy `getUniversityDatabase()` / `runUniversitySelectQuery()` kept as thin aliases

## E. Hospital seed data

12 tables matching `databaseCatalog` metadata:

- departments, rooms, patients, medications, doctors, nurses
- appointments, admissions, prescriptions, lab_results, billing, insurance

Seed includes 8 patients, 5 doctors, 8 appointments (scheduled/completed/cancelled), pending/paid bills, prescriptions, lab results, and insurance records — enough for SELECT, WHERE, JOIN, LEFT JOIN, GROUP BY, COUNT, and ORDER BY questions.

## F. Shipping seed data

12 tables matching catalog metadata:

- carriers, customers, warehouses, orders, drivers, shipments
- vehicles, packages, inventory, routes, tracking_events, invoices

Seed includes 5 customers, 8 orders (multiple statuses), 5 shipments, 6 packages, carriers, invoices, and tracking events — enough for filtering, joins, aggregates, and LEFT JOIN (unshipped orders) questions.

## G. Questions added

**Hospital (8 checkable):**

1. Upcoming patient appointments (WHERE)
2. Doctors with department names (JOIN)
3. List patient names (SELECT)
4. Pending hospital bills (WHERE)
5. Appointments per doctor (GROUP BY / COUNT)
6. Departments by floor (ORDER BY)
7. Patients with insurance providers (LEFT JOIN)
8. Count all patients (COUNT)

**Shipping (8 checkable):**

1. High-value orders (WHERE)
2. List customers (SELECT)
3. Shipped orders (WHERE)
4. Shipments per carrier (JOIN / GROUP BY)
5. Total order value per customer (SUM aggregate)
6. Heavy packages (WHERE)
7. Orders without shipments (LEFT JOIN)
8. Orders by date (ORDER BY)

University questions unchanged (12).

## H. Run behavior

- Run executes on `university_system`, `hospital_management`, or `shipping_logistics`
- Guardrails unchanged (SELECT/WITH only)
- Results grid, messages, and attempt history work per selected database
- Later-phase message only shown if a future unsupported database ID is added

## I. Check Answer behavior

- Check Answer runs student + solution SQL on the **selected** database
- Uses existing `validateSqlResults()` and feedback UI
- Mistakes and attempt history include hospital/shipping entries
- Solution reveal and Use Solution unchanged

## J. Safety guardrails

- All execution remains in-browser sql.js
- No backend SQL, production DB, Railway, Postgres, DATABASE_URL, API calls, or AI/LLM
- User SQL guardrails unchanged
- Solution SQL only from local question data via `runTrustedSql()`
- Code Workbench (`/practice/code`) not modified

## K. What was intentionally not implemented

- Additional databases beyond the three starters
- 3D schema viewer
- Backend SQL executor
- SQL formatter
- Expected output preview rows from solution
- Full catalog-scale row counts (metadata row counts remain illustrative)

## L. Build result

```
npm run build
```

**Result:** Success (exit code 0, built in ~3m 12s)

```
npx eslint src/features/sql-practice
```

**Result:** Success (exit code 0)

## M. Smoke test result

Manual browser tests recommended:

| Area | Test | Expected |
|------|------|----------|
| University | Run `SELECT * FROM students LIMIT 10` | Rows show |
| University | Check correct answer | Passed |
| University | `DROP TABLE students` | Blocked |
| Hospital | Run `SELECT * FROM patients LIMIT 10` | Rows show |
| Hospital | Check correct/wrong answers | Passed / Failed |
| Hospital | Mistakes tab after failed check | Updated |
| Shipping | Run `SELECT * FROM orders LIMIT 10` | Rows show |
| Shipping | Check correct/wrong answers | Passed / Failed |
| Editor | Suggestions for `co` match selected DB | Works |
| Layout | Resizable panes, Show Solution confirm | Works |
| Regression | `/practice/code`, JS Run | Works |

*Automated browser smoke tests not run in CI; validated via build, lint, and code review.*

## N. Risks / limitations

- Each database loads its own sql.js instance on first use (small memory cost)
- Catalog `rowCount` values are metadata-only; seed data is intentionally small
- Aggregate questions with ROUND in solution may require numeric tolerance (configured where needed)
- localStorage attempts/mistakes remain device-local

## O. Phase 5 recommendation

1. Expected output preview tab (sample rows from solution, still hidden until check)
2. Question progress tracking per database/topic
3. SQL formatter
4. Keyboard shortcut for Check Answer
5. Lazy-load sql.js WASM only when user first opens `/practice/sql`
6. Expand question sets and add difficulty-based learning paths
