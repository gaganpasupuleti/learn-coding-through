# Issue #30 Phase 3 — SQL Answer Checking Report

Branch: `issue-30-phase-3-sql-answer-checking`

## A. Summary

Phase 3 adds answer checking for **university_system** SQL practice questions on `/practice/sql`. When the user clicks **Check Answer**, the student query and hidden solution SQL both run locally via sql.js. A rule-based validator compares columns, row counts, and values. Results show Passed/Failed feedback, update attempt history and mistakes tracking in localStorage, and support optional solution reveal behind confirmation.

Non-university databases show: *"Answer checking for this database will be enabled in a later phase."*

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/engine/sqlResultValidator.ts` | Compare student vs solution query results |
| `src/features/sql-practice/components/SqlAnswerFeedbackPanel.tsx` | Passed/Failed badge and comparison details |
| `src/features/sql-practice/components/SqlSolutionPanel.tsx` | Hidden solution reveal + optional "Use solution" |
| `issue-30-phase-3-sql-answer-checking-report.md` | This report |

## C. Files modified

| File | Changes |
|------|---------|
| `src/features/sql-practice/types/sqlPractice.types.ts` | `solutionSql`, `validationMode`, answer feedback, attempt/mistake types |
| `src/features/sql-practice/data/sqlQuestions.ts` | 12 university questions with solutions; helpers for question selection |
| `src/features/sql-practice/engine/sqlRunner.ts` | `runTrustedUniversitySql()` for internal solution execution |
| `src/features/sql-practice/utils/sqlPracticeStorage.ts` | Mistakes, solution reveal, extended attempt records |
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Check Answer flow, question selection, state wiring |
| `src/features/sql-practice/components/SqlQuestionPanel.tsx` | Question picker, answer feedback, solution panel |
| `src/features/sql-practice/components/SqlBottomPanel.tsx` | Rich attempt history and mistakes display |
| `src/features/sql-practice/components/SqlMessagesPanel.tsx` | Answer feedback in Messages tab |
| `src/features/sql-practice/components/SqlTopBar.tsx` | Checking state, disabled buttons while busy |
| `src/features/sql-practice/components/SqlStatusBar.tsx` | Checking / Passed / Failed labels |

## D. Question model updates

Each university question includes:

- `id`, `title`, `difficulty`, `topic`, `databaseId`
- `problemStatement` (prompt), `learningObjective`
- `starterSql`, `expectedColumns`, `hints`
- `solutionSql` (hidden until user confirms reveal)
- `validationMode`: `default` | `ordered` | `aggregate`
- Optional `validation` overrides (`numericTolerance`, etc.)

**12 university_system questions** cover SELECT, WHERE, ORDER BY, LIMIT, COUNT, GROUP BY, HAVING, INNER JOIN, LEFT JOIN, aggregates (AVG), DISTINCT, and a subquery-style enrollment filter.

## E. Validation engine approach

`validateSqlResults(student, solution, options)` in `sqlResultValidator.ts`:

1. Detect blocked user SQL
2. Detect syntax/execution errors
3. Compare column names (missing/extra)
4. Compare row counts
5. Compare cell values (with optional numeric tolerance)
6. Respect `requireExactOrder` for ORDER BY questions

Default options: exact columns, row count, values; order flexible unless `validationMode: 'ordered'`.

## F. Check Answer flow

1. Validate database is `university_system` (else later-phase message)
2. Run student SQL via `runUniversitySelectQuery()` (guardrails apply)
3. Run `question.solutionSql` via `runTrustedUniversitySql()` (no guardrails)
4. Compare with `validateSqlResults()`
5. Update `answerFeedback` state; switch Messages tab
6. Keep Results tab showing **student** query output only
7. Save attempt with `action: 'check'` and status `passed` | `failed` | `blocked` | `error`
8. On failure, append to mistakes with `errorType`

## G. Feedback UI

- **Practice Question panel**: Answer Feedback block with Passed/Failed badge, bullet feedback, expected vs actual columns/rows
- **Messages tab**: Same feedback plus execution messages
- Beginner-friendly messages per spec (column mismatch, row count, blocked, syntax, etc.)

## H. Attempt history updates

Attempts now record:

- `action`: `run` | `check`
- `status`: `success` | `error` | `blocked` | `passed` | `failed`
- `questionTitle`, `feedbackSummary`, timestamp, row count, execution time

History tab shows formatted labels: *Ran · Success*, *Checked · Passed*, etc.

## I. Mistakes tracking

Failed checks save to localStorage (`sql-practice-mistakes`) with:

- `questionId`, `databaseId`, `sql`, `feedback`, `errorType`, `recordedAt`

Mistakes tab shows error type, timestamp, SQL snippet, and feedback.

## J. Solution reveal behavior

- Solution hidden by default
- **Show solution** → confirmation: *"This will reveal the solution. Try solving it yourself first."*
- After confirm, solution SQL displayed (not copied to editor)
- **Use solution** explicitly replaces editor content

Reveal state persisted per question in localStorage.

## K. Safety guardrails

- User SQL: SELECT/WITH only via existing `sqlGuardrails.ts`
- Solution SQL: trusted internal data only, executed via `runTrustedUniversitySql()`
- No backend SQL, production DB, Railway, Postgres, or DATABASE_URL
- No AI/LLM or paid APIs
- Code Workbench (`/practice/code`) unchanged

## L. What was intentionally not implemented

- Answer checking for `hospital_management` and `shipping_logistics`
- sql.js execution for non-university databases
- 10 full database catalog expansion
- 3D schema viewer
- Backend SQL executor changes
- SQL formatter
- Automatic solution copy without user action

## M. Build result

```
npm run build
```

**Result:** Success (exit code 0)

```
npx eslint src/features/sql-practice
```

**Result:** Success (exit code 0)

## N. Smoke test result

Manual smoke tests to run in browser:

| # | Test | Expected |
|---|------|----------|
| 1 | Open `/practice/sql` | Page loads |
| 2 | Select University System | University questions available |
| 3 | Select "List student names" | Question loads |
| 4 | Run `SELECT student_name, city FROM students;` + Check Answer | Passed |
| 5 | Change to `SELECT * FROM students;` + Check Answer | Failed (extra columns) |
| 6 | Run `SELECT student_name FROM students;` + Check Answer | Failed (missing city) |
| 7 | Invalid SQL + Check Answer | Syntax feedback |
| 8 | `DROP TABLE students;` + Check Answer | Blocked feedback |
| 9 | Failed checks | Appear in Mistakes tab |
| 10 | Successful checks | Appear in Attempt History |
| 11 | Show Solution | Requires confirmation |
| 12 | Solution default | Hidden |
| 13 | Shipping & Logistics Check Answer | Later-phase message |
| 14 | Editor suggestions | Still work |
| 15 | Resizable panes | Still work |
| 16 | `/practice/code` | Still works |
| 17 | JavaScript Run | Still works |
| 18 | No backend/production DB | Confirmed by design |
| 19 | No AI/LLM | Confirmed by design |

*Automated browser smoke tests were not run in CI; validation performed via build, lint, and code review.*

## O. Risks / limitations

- **Column alias sensitivity**: Comparison normalizes case but expects matching aliases (e.g. `total_students` not `COUNT(*)` without alias)
- **Aggregate rounding**: `uni-q10-avg-grade` uses `ROUND(..., 2)` in solution; student must match or use compatible rounding
- **Unordered JOIN results**: Multi-row JOIN questions use order-insensitive comparison unless specified
- **localStorage only**: Attempts/mistakes are device-local, not synced
- **Single shared sql.js DB**: Solution and student queries share the same in-memory database instance (read-only SELECTs)

## P. Phase 4 recommendation

1. Enable sql.js seed + Run for `hospital_management` and `shipping_logistics`
2. Add solution SQL and answer checking for those question sets
3. Add expected output preview tab (sample rows from solution, still hidden until check)
4. Question progress tracking (completed count per topic)
5. Optional SQL formatter and keyboard shortcut for Check Answer
6. Export/import attempt history for instructors
