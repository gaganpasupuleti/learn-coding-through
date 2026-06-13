# Issue #30 — Phase 11: SQL Reliability Hardening Report

## A. Summary

Phase 11 hardens SQL Practice Ground against silent regressions: all **65** `solutionSql` queries are now verified in Vitest against sql.js seeds, Expected Output Preview handles zero-row results with `expectedColumns` fallback, and progress/review/mistakes paths tolerate corrupted or missing localStorage data. No question content, seed data, engine, validator, or backend changes were required.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/test-utils/sqlJsSeedHarness.ts` | Reusable sql.js + seed DB initializer for tests |
| `src/features/sql-practice/data/sqlQuestionSolutions.test.ts` | Executes all 65 solutions; asserts columns and non-zero rows |
| `src/features/sql-practice/utils/sqlExpectedPreviewMapper.ts` | Pure preview mapping with zero-row column fallback |
| `src/features/sql-practice/utils/sqlExpectedPreviewMapper.test.ts` | 4 unit tests for preview mapper |
| `src/features/sql-practice/utils/sqlPracticeDataSafety.ts` | Progress/mistakes sanitization and question meta resolution |
| `src/features/sql-practice/utils/sqlPracticeDataSafety.test.ts` | 4 safety/regression tests |

## C. Files modified

| File | Change |
|------|--------|
| `scripts/verify-sql-questions.mjs` | Column checks, richer failure labels (id, database, title, error) |
| `src/features/sql-practice/hooks/useSqlExpectedPreview.ts` | Uses `mapExpectedPreviewResult` |
| `src/features/sql-practice/components/SqlExpectedOutputPreview.tsx` | Shows `zeroRowMessage` for empty previews |
| `src/features/sql-practice/types/sqlPractice.types.ts` | Added optional `zeroRowMessage` on preview type |
| `src/features/sql-practice/utils/sqlPracticeProgress.ts` | Sanitizes progress on `loadSqlProgress()` |
| `src/features/sql-practice/utils/sqlPracticeStorage.ts` | Sanitizes mistakes on load |
| `src/features/sql-practice/utils/sqlPracticeAnalytics.ts` | Sanitized progress in review/suggestion paths; skip unknown mistake IDs |
| `src/features/sql-practice/components/SqlMistakesPanel.tsx` | Safe metadata via `resolveQuestionDisplayMeta` |
| `package.json` | Expanded `test:sql-practice` script |

## D. Solution SQL verification test

`sqlQuestionSolutions.test.ts`:

- Initializes sql.js once via `sqlJsSeedHarness`
- Seeds all three databases from existing seed files
- Runs each `solutionSql` with `db.exec`
- Asserts: no SQL error, result set present, columns match `expectedColumns` (case-insensitive), at least one row
- **66 test cases** (1 count check + 65 per-question)

All 65 solutions pass — **no question `solutionSql` fixes required**.

## E. Expected Output Preview zero-row handling

`mapExpectedPreviewResult`:

- On successful execution with empty column metadata → uses `question.expectedColumns`
- Sets `rowCount: 0`, `sampleRows: []`, `status: 'ready'`
- Sets `zeroRowMessage`: *"Expected output has 0 rows for this seed data, but these are the expected columns."*
- Does not expose `solutionSql`
- Errors still map to `status: 'error'`
- Sample rows capped at 5

SQL execution and Check Answer behavior unchanged.

## F. Progress/review safety improvements

| Guard | Implementation |
|-------|----------------|
| Invalid progress records | `sanitizeProgressStore` on load and in analytics |
| Invalid mistake records | `sanitizeMistakeRecords` on load |
| Missing question in mistakes | `resolveQuestionDisplayMeta` → questionId + "Unknown topic" |
| Ghost IDs in review queue | Mistakes mode filters to known question IDs only |
| Corrupt JSON | Existing `readJson` fallback preserved |

## G. Tests added

| File | Tests |
|------|-------|
| `sqlQuestionSolutions.test.ts` | 66 |
| `sqlExpectedPreviewMapper.test.ts` | 4 |
| `sqlPracticeDataSafety.test.ts` | 4 |

**Total `test:sql-practice`:** 118 tests (was 44)

## H. Safety confirmation

| Constraint | Status |
|------------|--------|
| No SQL execution behavior change | Confirmed |
| No answer-checking logic change | Confirmed |
| No sql.js engine change | Confirmed |
| No seed/question content change | Confirmed |
| No backend / production DB | Confirmed |
| No Code Workbench change | Confirmed |
| No AI/LLM | Confirmed |
| Frontend-only | Confirmed |

## I. What was intentionally not changed

- Question content and `solutionSql` (all verified passing)
- Seed DDL/DML
- `sqlRunner.ts`, `sqlEngine.ts`, `sqlResultValidator.ts` public behavior
- SQL Workbench layout and review UI structure
- Code practice, backend, 3D schema

## J. Build result

```
npm run build
✓ built successfully
```

## K. Lint result

```
npx eslint src/features/sql-practice
npx eslint scripts/verify-sql-questions.mjs
Exit code: 0
```

## L. Test result

```
npm run test:sql-practice
Test Files  7 passed (7)
Tests       118 passed (118)
```

## M. verify-sql-questions result

```
npx vite-node scripts/verify-sql-questions.mjs
All 65 solutions passed.
```

## N. Typecheck result

Not re-run (`npm run build` uses `tsc -b --noCheck`). Pre-existing unrelated `tsc --noEmit` errors remain in career-mapper, code-practice, admin widgets, etc.

## O. Smoke test result

Automated browser smoke not run. Manual checklist recommended per Phase 11 spec.

## P. Risks / limitations

- Solution tests require sql.js WASM on disk (`node_modules/sql.js/dist/sql-wasm.wasm`); CI must have `npm install` first.
- Zero-row preview fallback is UX-only; Check Answer still compares empty metadata when sql.js returns no result set (unchanged).
- Progress sanitization drops invalid records silently (no user notification).
- Per-question solution tests add ~250ms to `test:sql-practice` runtime.

## Q. Phase 12 recommendation

1. **Allowlisted zero-row questions** — if a future question legitimately returns 0 rows, add explicit `allowsZeroRows` metadata instead of loosening all tests.
2. **CI workflow** — run `npm run test:sql-practice` on PRs touching `sql-practice/`.
3. **Preview integration test** — optional hook-level test with mocked `runTrustedSql`.
4. **Progress repair UI** — surface when corrupt records were dropped.
5. **Topic enum expansion** — finer filters without new databases.
6. **Export progress JSON** — student/instructor download from localStorage.
