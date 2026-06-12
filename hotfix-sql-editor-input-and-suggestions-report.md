# Hotfix — SQL Editor Input & Suggestions Report

## A. Summary

Fixed the `/practice/sql` Query Editor so Monaco is visible, writable, and shows starter SQL. Added offline SQL autocomplete (keywords, aggregates, schema tables/columns, snippets) scoped to the selected database metadata. Code Workbench execution and suggestions were not changed.

## B. Root cause of editor issue

The Code Workbench already had CSS in `src/index.css` under `.code-practice-editor` so Monaco’s `height="100%"` resolves inside a flex panel. The SQL Workbench used `.sql-practice-editor` **without equivalent rules**, so the embedded Monaco container collapsed to ~0 height — black area, no visible text, not focusable/typeable in production.

Secondary fixes: flex column on the editor grid cell, `code-editor-embedded-root` flex wrapper in embedded `CodeEditor` mode, explicit `readOnly: false`, and textarea fallback if Monaco does not mount within 12s.

## C. Files added

| File |
|------|
| `src/features/sql-practice/editor-intelligence/sqlCompletion.types.ts` |
| `src/features/sql-practice/editor-intelligence/sqlKeywordCompletions.ts` |
| `src/features/sql-practice/editor-intelligence/sqlSnippetCompletions.ts` |
| `src/features/sql-practice/editor-intelligence/sqlSchemaCompletions.ts` |
| `src/features/sql-practice/editor-intelligence/sqlCompletionProvider.ts` |
| `src/features/sql-practice/editor-intelligence/README.md` |
| `hotfix-sql-editor-input-and-suggestions-report.md` |

## D. Files modified

| File | Change |
|------|--------|
| `src/index.css` | `.sql-practice-editor` height/flex rules (mirrors code practice) |
| `src/components/CodeEditor.tsx` | Embedded flex root, `readOnly: false`, `enableQuickSuggestions`, `onEditorMount` hook |
| `src/features/sql-practice/components/SqlEditorPanel.tsx` | Fallback textarea, suggestions mount, phase-2 run note |
| `src/features/sql-practice/components/SqlPracticeLayout.tsx` | Editor column `flex flex-col` |
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Pass `database` / `databaseId` to editor |

## E. SQL editor fix

- CSS ensures Monaco fills panel (`min-height: 280px`, `flex: 1`, `height: 100%`)
- Controlled `code={sql}` wiring unchanged; starter SQL from `SQL_STARTER_QUERY` / question on DB switch
- Dark theme `vs-dark`, 16px / 26px line height
- Ctrl/Cmd+Enter Run preserved
- Textarea fallback if Monaco mount times out
- Non-university DBs show amber note about Phase 2 run scope

## F. SQL suggestions added

Offline Monaco provider registered only from `SqlEditorPanel`:

- **Keywords:** SELECT, FROM, WHERE, JOIN, GROUP BY, HAVING, ORDER BY, LIMIT, etc.
- **Aggregates:** COUNT(), SUM(), AVG(), MIN(), MAX(), ROUND(), COALESCE(), CASE WHEN, templates
- **Schema:** table/column names from `databaseCatalog` for selected DB
- **Snippets:** SELECT LIMIT, WHERE, INNER/LEFT JOIN, GROUP BY, HAVING, aggregates, date filter
- **Context:** after FROM/JOIN → tables; after SELECT → columns + aggregates; after WHERE/GROUP BY/ORDER BY → columns; `table.` → columns when resolvable
- Prefix `co` → COUNT(), COUNT(*) AS total_count, COALESCE()

## G. What was intentionally not implemented

- Phase 3 answer checking
- Execution for hospital_management / shipping_logistics
- 3D schema
- Backend / production SQL
- AI / LLM / paid APIs
- Code Workbench execution changes

## H. Build result

```
npm run build — exit 0
```

## I. Smoke test result

| Check | Result |
|-------|--------|
| Guardrails SELECT / DROP block | Pass (engine-level) |
| `co` prefix completions defined | Pass (COUNT, COALESCE, etc.) |
| Full browser UI smoke | Manual — verify in browser after deploy |

Recommended manual checks: starter SQL visible, typing works, Ctrl+Space suggestions, university Run + DROP block, shipping later-phase message, `/practice/code` JS Run.

## J. Risks / limitations

- Context detection is heuristic (not a full SQL parser)
- Table alias → column resolution is basic
- Monaco first paint can be slow on cold load; fallback appears after 12s timeout
- Suggestions use metadata catalogs (not live sql.js seed) — aligned for university; hospital/shipping metadata only

## K. Next phase recommendation

After this hotfix is merged and smoke-tested in production:

1. Issue #30 Phase 3 — answer checking for university questions
2. Optional: dedicated SQL smoke Playwright script
3. Later: seed + execution for other databases
