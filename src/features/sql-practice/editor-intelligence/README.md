# SQL Practice — offline editor intelligence

Rule-based Monaco completions for `/practice/sql`. No AI, no backend.

## Files

| File | Role |
|------|------|
| `sqlKeywordCompletions.ts` | SQL keywords and aggregate/function templates |
| `sqlSnippetCompletions.ts` | JOIN, GROUP BY, HAVING, date filter snippets |
| `sqlSchemaCompletions.ts` | Table/column names from selected database metadata |
| `sqlCompletionProvider.ts` | Context-aware `registerCompletionItemProvider` for `sql` |
| `sqlCompletion.types.ts` | Shared types |

## Context rules

- After `FROM` / `JOIN` → table names first
- After `SELECT` → columns + aggregates first
- After `WHERE` / `GROUP BY` / `ORDER BY` / `HAVING` → columns first
- `table.` or `alias.` → columns for that table when resolvable
- Prefix `co` → `COUNT()`, `COUNT(*) AS total_count`, `COALESCE()`

## Boundary

Code Workbench uses `src/features/code-practice/editor-intelligence/` only. SQL provider is registered from `SqlEditorPanel` and does not affect Python/JavaScript/React suggestions.
