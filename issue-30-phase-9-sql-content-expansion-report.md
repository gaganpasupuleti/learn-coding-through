# Issue #30 — Phase 9: SQL Content Expansion Report

## A. Summary

Phase 9 expands SQL practice learning content for the three existing in-browser databases (`university_system`, `hospital_management`, `shipping_logistics`). **37 new questions** were added (13 university, 12 hospital, 12 shipping), bringing totals from 28 to **65 checkable questions**. All new questions include `solutionSql`, starter SQL scaffolds, 2–3 hints, learning objectives, and topic/difficulty metadata. No engine, runner, validator, backend, or UI changes were made.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/data/sqlQuestionsExpansion.ts` | Phase 9 question content (uni-q13…q25, hosp-q9…q20, ship-q9…q20) |
| `src/features/sql-practice/data/sqlQuestions.test.ts` | Lightweight integrity tests for question data |
| `scripts/verify-sql-questions.mjs` | Dev helper to execute all `solutionSql` against sql.js seeds (run via `npx vite-node`) |

## C. Files modified

| File | Change |
|------|--------|
| `src/features/sql-practice/data/sqlQuestions.ts` | Import and merge expansion arrays; add `getQuestionsByTopic`, `getAllQuestionIds`; fix `getUniversityQuestions` to include expansion |
| `package.json` | Include `sqlQuestions.test.ts` in `test:sql-practice` script |

## D. Question counts by database

| Database | Before | Added | After | Target |
|----------|--------|-------|-------|--------|
| University System | 12 | 13 | **25** | ≥25 |
| Hospital Management | 8 | 12 | **20** | ≥20 |
| Shipping & Logistics | 8 | 12 | **20** | ≥20 |
| **Total** | **28** | **37** | **65** | — |

## E. Topic coverage

Topics use existing types only (`select`, `filtering`, `joins`, `aggregates`, `subqueries`).

| Topic | University | Hospital | Shipping | Total |
|-------|------------|----------|----------|-------|
| select | 4 | 2 | 2 | 8 |
| filtering | 4 | 5 | 7 | 16 |
| joins | 5 | 3 | 3 | 11 |
| aggregates | 9 | 8 | 6 | 23 |
| subqueries | 3 | 0 | 2 | 5 |

Concepts covered across new questions include: `ORDER BY`, `LIMIT`, `COUNT`, `SUM`/`AVG`/`MIN`/`MAX`, `GROUP BY`, `HAVING`, `INNER JOIN`, `LEFT JOIN`, multi-table JOINs, `CASE WHEN`, date/text filtering (`LIKE`), `IS NULL`, and subquery-style / anti-join filtering.

## F. Difficulty distribution

| Database | Easy | Medium | Hard |
|----------|------|--------|------|
| University (25) | 10 (40%) | 10 (40%) | 5 (20%) |
| Hospital (20) | 8 (40%) | 8 (40%) | 4 (20%) |
| Shipping (20) | 9 (45%) | 8 (40%) | 3 (15%) |
| **All (65)** | **27 (42%)** | **26 (40%)** | **12 (18%)** |

Distribution is close to the suggested 35% / 45% / 20% targets. Hard questions stay within beginner-to-mid student scope (no window functions, CTE-heavy patterns, or advanced SQLite features).

## G. Scenario-based question examples

**University**
- Departments with ≥3 courses (`uni-q18`)
- Students in multiple courses (`uni-q19`)
- Most enrolled course (`uni-q20`)
- Students not in Machine Learning — LEFT JOIN anti-pattern (`uni-q21`)
- Average grade per student (`uni-q22`)
- Students per city (`uni-q15`)
- Faculty and department mapping (`uni-q16`)

**Hospital**
- Doctor with most appointments (`hosp-q10`)
- Patients without insurance (`hosp-q11`)
- Large pending bills (`hosp-q12`)
- Appointments per department (`hosp-q14`)
- Doctors with multiple appointments (`hosp-q16`)
- Total billing per patient (`hosp-q17`)
- Patients still admitted — NULL discharge (`hosp-q18`)
- Bill size categories — `CASE WHEN` (`hosp-q19`)

**Shipping**
- Customers with multiple orders (`ship-q10`)
- Average package weight per shipment (`ship-q11`)
- Revenue by order status (`ship-q13`)
- Unpaid invoices (`ship-q14`)
- Express carrier shipment counts (`ship-q15`)
- Highest order value per country (`ship-q16`)
- Order value tiers — `CASE WHEN` (`ship-q18`)
- Orders from India customers (`ship-q20`)

## H. Validation approach

1. Every `solutionSql` is `SELECT`/`WITH` only and uses tables/columns from seed data and `databaseCatalog`.
2. `ORDER BY` added where result order matters; `validationMode: 'ordered'` set for tie-break / sort-sensitive questions.
3. `ROUND()` + `validationMode: 'aggregate'` + `numericTolerance: 0.05` for floating aggregates.
4. All **65** solutions verified with `npx vite-node scripts/verify-sql-questions.mjs` against sql.js seeds — all passed.
5. `uni-q21` was adjusted from “students without any enrollments” (0 rows in seed) to “students not in Machine Learning” (14 rows) so Expected Output Preview and Check Answer work with real column metadata.

## I. Tests added/updated

**New:** `src/features/sql-practice/data/sqlQuestions.test.ts` (9 tests)

- Unique question IDs
- Every question has `solutionSql`
- `solutionSql` starts with `SELECT` or `WITH`
- Valid `databaseId` (three existing DBs only)
- Minimum counts per database (25 / 20 / 20)
- At least one hint per question
- `expectedColumns` present
- `starterSql` present
- No forbidden mutation keywords in `solutionSql`

**Updated:** `package.json` `test:sql-practice` now runs formatter, editor-insert, and question integrity tests.

## J. Safety confirmation

| Constraint | Status |
|------------|--------|
| No backend changes | Confirmed |
| No sql.js engine changes | Confirmed |
| No SQL runner changes | Confirmed |
| No validator logic changes | Confirmed |
| No production DB / Railway / Postgres | Confirmed |
| No Code Workbench changes | Confirmed |
| No AI/LLM / paid APIs | Confirmed |
| No new databases | Confirmed |
| No real 3D work | Confirmed |
| No SQL Workbench UI rewrite | Confirmed |
| Existing features preserved | Confirmed |

## K. What was intentionally not changed

- SQL execution engine (`sqlEngine.ts`, `sqlRunner.ts`, `sqlGuardrails.ts`)
- Answer checking (`sqlResultValidator.ts`)
- SQL Workbench UI components and layout
- Seed data / schema (no new tables or databases)
- Code practice (`/practice/code`)
- Backend services

## L. Build result

```
npm run build
✓ built in ~2m 44s
```

Pre-existing CSS optimization warnings and chunk-size warnings only; build succeeded.

## M. Lint result

```
npx eslint src/features/sql-practice
Exit code: 0 (no issues)
```

## N. Test result

```
npm run test:sql-practice
Test Files  3 passed (3)
Tests       32 passed (32)
```

Breakdown: 8 formatter + 15 editor-insert + 9 question integrity = 32 tests.

## O. Typecheck result

```
npx tsc --noEmit
Exit code: 2 (pre-existing repo errors, unrelated to Phase 9)
```

Sample pre-existing errors (not introduced by this phase):

- `src/components/admin/widgets/KpiStatCard.tsx` — possibly undefined invoke
- `src/components/career-mapper/*` — type mismatches, missing `Flashcard` export
- `src/features/code-practice/*` — `undefined` vs `null` types
- `src/features/sql-practice/editor-intelligence/sqlCompletionProvider.ts` — Monaco `ITextModel` export
- `src/features/sql-practice/utils/sqlPracticeStorage.ts` — duplicate property spreads
- `src/lib/dashboard-derive.ts`, `node-mastery-tracker.ts`, `roadmap-flow-data.ts` — assorted type issues

`npm run build` uses `tsc -b --noCheck` and succeeds.

## P. Smoke test result

Automated browser smoke was not run in this session (no dev server session). Recommended manual checklist:

1. `/practice/sql` — verify question counts: University 25, Hospital 20, Shipping 20
2. Check Answer on 3+ new questions per database (solutions verified programmatically)
3. Topic/difficulty filters, progress badges, Expected Output Preview
4. Mistakes retry, attempt history Load SQL, Format SQL, Quick Queries
5. Schema Diagram (normal + full-screen)
6. `/practice/code` JavaScript Run still works

## Q. Risks / limitations

- **Empty-result questions:** sql.js `db.exec` returns no result set for 0-row queries (columns empty). Questions with legitimately empty answers may break Expected Output Preview; avoided where possible (`uni-q21` revised).
- **Topic taxonomy:** `CASE WHEN`, `HAVING`, and date filters are grouped under existing topics (`aggregates`, `filtering`) — no new topic enum added per scope.
- **Solution verification in CI:** Integrity tests do not execute SQL against sql.js (by design for this phase). Use `npx vite-node scripts/verify-sql-questions.mjs` locally when adding questions.
- **Difficulty labels:** Subjective; some “hard” questions are pattern practice rather than complex SQL.

## R. Phase 10 recommendation

1. **CI solution runner:** Add optional vitest + sql.js test that executes every `solutionSql` and compares row/column counts (heavier but catches seed drift).
2. **Topic enum expansion:** Add `case`, `having`, `dates`, `nulls` topics for finer filtering in the question browser.
3. **Question tagging:** Add `tags: string[]` for scenario labels (billing, enrollment, logistics) without new DBs.
4. **Progress analytics:** Surface topic/difficulty completion percentages on the SQL practice landing panel.
5. **Empty-result UX:** Teach Expected Output Preview to show column headers from `expectedColumns` when sql.js returns no result set.
6. **Content depth:** Add 5–10 “challenge” questions per DB using `WITH` subqueries (still sql.js-safe) once students exhaust the current 65.
