# Hotfix — SQL Page Crash (Missing Collapse Import) Report

Branch: `hotfix-sql-page-crash-missing-collapse-import`

## Summary

PR #40 accidentally removed the `SqlPaneCollapseButton` import from `SqlPracticePage.tsx` while adding `buildSqlErrorMessages`. The page still referenced `SqlPaneCollapseButton` in JSX, causing a runtime crash and preventing `/practice/sql` from loading.

## Root cause

```tsx
// Missing after PR #40:
import { SqlPaneCollapseButton } from './SqlPaneCollapseButton'
```

Runtime error: `SqlPaneCollapseButton is not defined`

## Fix

Restored the import alongside the existing PR #40 import:

```tsx
import { buildSqlErrorMessages } from '../utils/sqlExecutionMessages'
import { SqlPaneCollapseButton } from './SqlPaneCollapseButton'
```

No other logic changes.

## Files changed

| File | Change |
|------|--------|
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Restore missing import |

## Not changed

- SQL execution logic
- sql.js engine
- Backend / production DB
- Code Workbench

## Build & lint

| Command | Result |
|---------|--------|
| `npm run build` | Success |
| `npx eslint src/features/sql-practice` | Success |
| `npx tsc --noEmit` | Pre-existing project errors elsewhere (unrelated to this one-line fix) |

## Smoke test checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Open `/practice/sql` | Page loads |
| 2 | Object Explorer collapse | Works |
| 3 | Practice Question collapse | Works |
| 4 | Results collapse | Works |
| 5 | University + `SELECT * FROM students LIMIT 10` | Rows show |
| 6 | University + `SELECT * FROM orders LIMIT 10` | Messages: `no such table: orders` + Shipping hint |
| 7 | Shipping + `SELECT * FROM orders LIMIT 10` | Rows show |
| 8 | `/practice/code` JavaScript Run | Unchanged |
