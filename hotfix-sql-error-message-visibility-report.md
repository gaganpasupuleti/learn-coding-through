# Hotfix — SQL Error Message Visibility Report

Branch: `hotfix-sql-error-message-visibility`

## Summary

Fixed confusing UX on `/practice/sql` when a query fails (e.g. wrong table for selected database). Failed runs now auto-open the **Messages** tab with the real sql.js error and an optional database hint. The **Results** tab no longer shows “Query returned no rows.” for execution errors.

## Problem

When running `SELECT * FROM orders` with **University System** selected:

- Status bar showed **Error**
- **Results** tab incorrectly showed “Query returned no rows.”
- The actual error (`no such table: orders`) was easy to miss

## Fix

1. **`SqlQueryGrid.errorMessage`** — tracks execution failures separately from empty successful results
2. **Auto-switch to Messages** on Run/Check execution errors (and blocked queries)
3. **Auto-switch to Results** on successful Run with data path
4. **`buildSqlErrorMessages()`** — adds friendly hint when a missing table belongs to another catalog database
5. **Results tab** — shows “See the Messages tab for error details” instead of a false empty-result message
6. **Messages tab** — error line in red; helper hint in amber callout

## Files changed

| File | Change |
|------|--------|
| `src/features/sql-practice/types/sqlPractice.types.ts` | Added `errorMessage` to `SqlQueryGrid` |
| `src/features/sql-practice/utils/sqlExecutionMessages.ts` | **New** — error + cross-database table hints |
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Wire messages, tab switching, error state |
| `src/features/sql-practice/components/SqlResultsPanel.tsx` | Distinguish errors from empty results |
| `src/features/sql-practice/components/SqlBottomPanel.tsx` | Only show “no rows” when not an error |
| `src/features/sql-practice/components/SqlMessagesPanel.tsx` | Styled error + helper messages |

## Not changed

- sql.js engine
- Backend / production DB
- Code Workbench (`/practice/code`)
- AI/LLM

## Build & lint

- `npm run build` — success
- `npx eslint src/features/sql-practice` — success

## Smoke test checklist

| # | Test | Expected |
|---|------|----------|
| 1 | University + `SELECT * FROM orders LIMIT 10` | Messages tab opens; `no such table: orders` + Shipping hint |
| 2 | University + `SELECT * FROM students LIMIT 10` | Results shows rows |
| 3 | Shipping + `SELECT * FROM orders LIMIT 10` | Results shows rows |
| 4 | Check Answer on university question | Still works |
| 5 | `/practice/code` JavaScript Run | Unchanged |

## Example helper message

> You are using University System, but this table may belong to another database. Try selecting Shipping & Logistics for orders.

Similar hints apply for hospital tables (e.g. `patients`) when the wrong database is selected.
