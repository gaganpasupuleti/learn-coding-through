# SQL Practice Ground (Issue #30)

SSMS-inspired SQL Workbench at **`/practice/sql`**. Students practice SELECT queries against three in-browser SQLite databases powered by **sql.js** — no server, no production database.

## Supported databases

| Database ID | Display name | Questions |
|-------------|--------------|-----------|
| `university_system` | University System | 25 |
| `hospital_management` | Hospital Management | 20 |
| `shipping_logistics` | Shipping & Logistics | 20 |

**Total:** 65 checkable practice questions with `solutionSql`, hints, and starter SQL.

## What runs in the browser (sql.js)

- **Run** — execute user `SELECT` / `WITH` queries via sql.js WASM
- **Check Answer** — compare student result to trusted `solutionSql` (same engine)
- **Expected Output Preview** — trusted solution shape (columns + sample rows; solution SQL never shown)
- **Schema Diagram** — interactive 2D ERD + full-screen view
- **Guardrails** — user SQL limited to `SELECT` / `WITH`; no DDL/DML

Seed DDL/DML lives in `data/*SeedSql.ts` and is loaded into an in-memory SQLite database per session.

## What is localStorage-based

Saved **only in the current browser** (not sent to backend):

| Key area | Storage |
|----------|---------|
| Question progress | `sql-practice-progress-v1` |
| Attempt history | `sql-practice-attempt-history` |
| Mistakes | `sql-practice-mistakes` |
| Revealed hints | `sql-practice-revealed-hints` |
| Revealed solutions | `sql-practice-solution-revealed` |
| Pane layout | `sql-practice-layout-v1` |

Clearing site data or using another browser/device resets progress.

## What is NOT connected

- Production database / Railway / Postgres / `DATABASE_URL`
- Backend SQL execution
- AI / LLM answer generation
- Paid external APIs
- Code Workbench (`/practice/code`) — see `src/features/code-practice/README.md`

## Main features

| Feature | Description |
|---------|-------------|
| Run | Execute SELECT in sql.js |
| Check Answer | Validate against `solutionSql` |
| Expected Output Preview | Column/row shape preview |
| Review Mode | Retry failed, mistakes, unfinished, weak topics |
| Progress Analytics | Passed/failed/unattempted by topic & difficulty |
| Weak topic detection | Rule-based (no AI) |
| Mistakes | Failed checks with retry / load SQL |
| ERD | 2D schema diagram + fullscreen |
| Formatter | Local SQL format (Ctrl/Cmd+Shift+F) |
| Suggestions | Schema-aware Monaco completions |
| Quick Queries | Starter templates per question |

3D schema tab is a placeholder — use 2D ERD.

## Testing commands

```bash
# Unit + solution regression (118 tests)
npm run test:sql-practice

# Tests + all 65 solutionSql against seeds
npm run verify:sql-practice

# Dev verification script (same seed check)
npx vite-node scripts/verify-sql-questions.mjs

# Lint SQL feature
npx eslint src/features/sql-practice

# Production build (separate)
npm run build
```

## Smoke checklist (deploy / release)

```bash
node scripts/sql-practice-smoke-notes.mjs
```

Full manual steps: [`docs/sql-practice-smoke-checklist.md`](../../docs/sql-practice-smoke-checklist.md)

## sql.js WASM (Vite)

```ts
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
initSqlJs({ locateFile: () => sqlWasmUrl })
```

Vite emits hashed WASM into `dist/` — no manual `public/` copy.

## Safety boundaries for future work

**Do not change without explicit scope:**

- `engine/sqlRunner.ts`, `engine/sqlEngine.ts`, `engine/sqlResultValidator.ts` — execution & checking
- `data/*SeedSql.ts` — breaks solution regression tests
- `solutionSql` in `sqlQuestions.ts` — run `npm run verify:sql-practice` after edits

**Safe to extend:**

- New questions (keep 65+ verified; update counts in docs)
- UI copy, analytics, review flows (localStorage only)
- Additional unit tests in `*.test.ts`

## Route

| Path | App key |
|------|---------|
| `/practice/sql` | `practice-sql` |

## Key files

| Path | Role |
|------|------|
| `data/sqlQuestions.ts` | Question catalog |
| `data/sqlQuestionsExpansion.ts` | Phase 9+ content |
| `utils/sqlPracticeAnalytics.ts` | Review & progress analytics |
| `utils/sqlPracticeDataSafety.ts` | localStorage sanitization |
| `utils/sqlExpectedPreviewMapper.ts` | Preview zero-row fallback |
| `data/sqlQuestionSolutions.test.ts` | 65 solution regression |
| `components/SqlPracticePage.tsx` | Main workbench |
