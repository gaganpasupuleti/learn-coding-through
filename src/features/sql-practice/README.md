# SQL Practice Ground (Issue #30)

SSMS-inspired SQL Workbench at `/practice/sql`.

## Phase 2 scope (current)

- Object Explorer with 3 starter databases (metadata for all; execution for `university_system` only)
- Monaco SQL editor (16px / 26px line height)
- **sql.js** in-browser SQLite for `university_system` SELECT queries
- Results grid, Messages tab, attempt history (localStorage)
- Guardrails: SELECT / WITH only; no DDL/DML from user SQL

## sql.js WASM loading (Vite)

`sqlEngine.ts` imports the WASM asset with Vite's `?url` suffix:

```ts
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
// ...
initSqlJs({ locateFile: () => sqlWasmUrl })
```

Vite emits `sql-wasm.wasm` into the build output with a hashed filename. No manual copy to `public/` is required.

## Not included yet

- Execution for `hospital_management` / `shipping_logistics`
- Backend SQL execution or production database connections
- Answer validation
- SQL autocomplete
- 3D schema (Phase 6)

## Boundary

Code Workbench (`/practice/code`) remains SQL-free. See `src/features/code-practice/README.md`.

## Route

| Path | App key |
|------|---------|
| `/practice/sql` | `practice-sql` |
