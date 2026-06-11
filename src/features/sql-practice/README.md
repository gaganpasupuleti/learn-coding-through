# SQL Practice Ground (Issue #30)

SSMS-inspired SQL Workbench at `/practice/sql`.

## Phase 1 scope (current)

- Object Explorer with 3 starter databases (metadata only)
- Monaco SQL editor (16px / 26px line height)
- Practice question panel with hints
- Bottom results tabs (placeholders)
- Run shows Phase 2 toast — **no execution**

## Not included yet

- sql.js / WASM SQLite
- Backend SQL execution
- Production database connections
- Answer validation
- SQL autocomplete
- 3D schema (Phase 6)

## Boundary

Code Workbench (`/practice/code`) remains SQL-free. See `src/features/code-practice/README.md`.

## Route

| Path | App key |
|------|---------|
| `/practice/sql` | `practice-sql` |
