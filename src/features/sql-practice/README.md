# SQL Practice Ground (Issue #30)

UI shell at `/practice/sql` — **no query execution**, **no production DB**, **no backend SQL API** in this phase.

## Purpose

Replace dependency on the legacy Practice Hub SQL tab with a dedicated SSMS-inspired workbench for future Issue #30 work.

## Route

| Path | App key | Nav |
|------|---------|-----|
| `/practice/sql` | `practice-sql` | Learning → **SQL Practice Ground** |

## Current scope

- Database explorer placeholder
- SQL editor placeholder (starter query)
- Task panel with Issue #30 notice
- Result / expected / history / mistakes placeholders
- Run Query and Reset disabled

## Not included yet

- sql.js or WASM SQLite execution
- Backend `/api` SQL endpoints
- Production database connections
- Hidden test cases
- Mistake persistence (separate from Code Workbench)

## Boundary

Code Practice Ground (`/practice/code`) must remain SQL-free. See `src/features/code-practice/README.md`.
