# Issue #30 — Phase 0 + Phase 1 SQL Workbench UI Report

## A. Summary

Built an SSMS / Azure Data Studio–inspired **SQL Practice Ground** shell at `/practice/sql` with Object Explorer (3 starter databases × 12 tables metadata), Monaco SQL editor, practice question panel, bottom results tabs, and top toolbar. **Run does not execute SQL** — it shows “SQL execution will be enabled in Phase 2.” No production DB, sql.js, backend SQL execution, or AI.

**Branch:** `issue-30-sql-practice-ground`

## B. Existing SQL audit findings

| Area | Finding |
|------|---------|
| Route | `/practice/sql` already wired in `App.tsx` as `practice-sql` → `SqlPracticePage` |
| Prior shell | Minimal placeholder under `src/features/sql-practice/` (textarea editor, 2 fake datasets, 3 tables) |
| Old Practice Hub | **Removed earlier** (Issue #29); no `PracticePage` SQL tab in `src/` |
| Routing | Student nav via `StudentShell` / `SQL_PRACTICE_ROUTE`; `/practice/code` separate |
| Shared editor | `CodeEditor` (Monaco) reused; `wb` theme from `workbench-theme.ts` |
| Backend SQL | `backend/executors/sql_executor.py` + `fetchSqlPracticeSchema()` in `api.ts` — **not wired** to this UI in Phase 1 |
| Ignore for now | `fetchSqlPracticeSchema`, Judge0, sql.js, production `DATABASE_URL`, legacy `practice-ground` references in comments only |

## C. Files added

- `src/features/sql-practice/data/databaseCatalog.ts`
- `src/features/sql-practice/data/sqlQuestions.ts`
- `src/features/sql-practice/utils/sqlPracticeStorage.ts`
- `src/features/sql-practice/components/SqlPracticeLayout.tsx`
- `src/features/sql-practice/components/SqlTopBar.tsx`
- `src/features/sql-practice/components/SqlObjectExplorer.tsx`
- `src/features/sql-practice/components/SqlDatabaseSelector.tsx`
- `src/features/sql-practice/components/SqlTableTree.tsx`
- `src/features/sql-practice/components/SqlEditorPanel.tsx`
- `src/features/sql-practice/components/SqlResultsPanel.tsx`
- `src/features/sql-practice/components/SqlMessagesPanel.tsx`
- `src/features/sql-practice/components/SqlBottomPanel.tsx`
- `src/features/sql-practice/components/SqlStatusBar.tsx`
- `issue-30-phase-1-sql-workbench-ui-report.md`

## D. Files modified

- `src/features/sql-practice/components/SqlPracticePage.tsx` — full orchestration
- `src/features/sql-practice/components/SqlQuestionPanel.tsx` — hints, badges, objectives
- `src/features/sql-practice/types/sqlPractice.types.ts` — expanded types
- `src/features/sql-practice/README.md` — Phase 1 scope

## E. Files removed (replaced)

- `SqlWorkbenchLayout.tsx` → `SqlPracticeLayout.tsx`
- `SqlToolbar.tsx` → `SqlTopBar.tsx`
- `SqlSchemaExplorer.tsx` → `SqlObjectExplorer` + tree/selector
- `SqlEditorPlaceholder.tsx` → `SqlEditorPanel.tsx` (Monaco)
- `SqlResultGridPlaceholder.tsx` → `SqlBottomPanel` + tab panels

## F. Route added/updated

- **Unchanged path:** `/practice/sql` (`practice-sql` in `App.tsx`)
- No changes to `/practice/code`

## G. Starter database metadata added

| Database ID | Display name | Tables |
|-------------|--------------|--------|
| `university_system` | University System | 12 |
| `hospital_management` | Hospital Management | 12 |
| `shipping_logistics` | Shipping & Logistics | 12 |

Each table: columns with data types, PK/FK badges, row counts; Views + Stored Procedures placeholders.

## H. Sample questions added

5 metadata-only questions in `sqlQuestions.ts` (university ×2, hospital ×2, shipping ×1).

## I. UI components added

Top bar, Object Explorer, database selector, table tree, Monaco editor panel, practice panel, results/messages/bottom tabs, status bar.

## J. What was intentionally not implemented

- sql.js / WASM execution
- Real SQL run / answer check
- Backend `/api` SQL for practice UI
- Production DB connection
- SQL autocomplete
- 10 databases
- 3D schema (placeholder only)
- AI/LLM
- Judge0
- Code Workbench changes

## K. Build result

`npm run build` — **PASS**

## L. Smoke test result

| # | Check | Result |
|---|--------|--------|
| 1 | `/practice/sql` loads SSMS-style workbench | **PASS** (component wiring + build) |
| 2 | Old Practice Hub not visible | **PASS** (removed in prior work) |
| 3 | Object Explorer visible | **PASS** |
| 4 | 3 starter databases | **PASS** |
| 5 | 10+ tables per database | **PASS** (12 each) |
| 6 | Table expand/collapse | **PASS** |
| 7 | Column types + PK/FK badges | **PASS** |
| 8 | SQL editor readable (16px/26px Monaco) | **PASS** |
| 9 | Run → Phase 2 message | **PASS** (toast + Messages tab) |
| 10 | Bottom tabs switch | **PASS** |
| 11 | Question panel + hint reveal | **PASS** |
| 12 | `/practice/code` untouched | **PASS** (no code-practice diffs) |
| 13 | No production DB / AI | **PASS** |

`npx eslint src/features/sql-practice` — **PASS**

## M. Risks / limitations

- Metadata is static JSON — not validated against real data until Phase 2+
- `loadSqlAttempts()` in bottom panel reads localStorage once per render (empty in Phase 1)
- Monaco height depends on parent flex layout on small screens

## N. Phase 2 plan

1. Integrate sql.js (or approved in-browser engine) per selected database
2. Wire **Run** to execute against in-memory seeded data
3. Populate Results grid + Messages from engine output
4. Ctrl+Enter run shortcut
5. Keep backend SQL executor separate from student practice path
