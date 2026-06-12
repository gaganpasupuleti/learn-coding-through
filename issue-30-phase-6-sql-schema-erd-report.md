# Issue #30 Phase 6 — Interactive SQL Schema ERD Report

## A. Summary

Phase 6 replaces the Schema Diagram tab placeholder with a frontend-only, metadata-driven interactive ERD for all three existing SQL practice databases (University, Hospital, Shipping). The diagram shows table cards with columns, PK/FK badges, SVG relationship arrows, search highlighting, a clickable relationship list, and table/relationship selection states. The 3D Schema tab remains a lightweight “coming soon” preview with a schema summary. No SQL execution, answer checking, backend, or new dependencies were added.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/utils/sqlSchemaGraph.ts` | Graph builder, layout, relationship/search helpers |
| `src/features/sql-practice/components/schema/SqlSchemaDiagram.tsx` | Main ERD container and interaction state |
| `src/features/sql-practice/components/schema/SqlSchemaTableCard.tsx` | Table card UI with columns and key badges |
| `src/features/sql-practice/components/schema/SqlRelationshipLayer.tsx` | SVG overlay for FK relationship lines |
| `src/features/sql-practice/components/schema/SqlSchemaSearch.tsx` | Search input with match count |
| `src/features/sql-practice/components/schema/SqlRelationshipList.tsx` | Clickable relationship summary list |

## C. Files modified

| File | Change |
|------|--------|
| `src/features/sql-practice/types/sqlPractice.types.ts` | Added `SqlSchemaRelationship`, `SqlSchemaNode`, `SqlSchemaGraph`, `SqlSchemaSearchMatch`, `SqlColumnKeyType` |
| `src/features/sql-practice/components/SqlBottomPanel.tsx` | Wired Schema Diagram tab to `SqlSchemaDiagram`; updated 3D tab placeholder; schema tab uses `overflow-hidden` for internal scroll |

## D. Schema graph design

- **Source:** `databaseCatalog.ts` metadata (`tables`, `columns`, `isPrimaryKey`, `isForeignKey`, `references`).
- **`buildSchemaGraph(database)`** — Derives FK relationships from column `references`, lays out nodes in a 4-column grid, returns `{ nodes, relationships, width, height }`.
- **`getTableRelationships(database)`** — Builds `SqlSchemaRelationship[]` with stable `id` keys.
- **`getRelatedTables(tableName, relationships)`** — Returns connected table names for highlight logic.
- **`getColumnKeyType(column)`** — Returns `pk`, `fk`, `pk_fk`, or `null`.
- **`getSearchMatches(database, query)`** — Case-insensitive match on table and column names.
- **`getRelationshipEndpoints(graph, relationship)`** — Computes SVG line endpoints at column row centers on card edges.

## E. ERD layout behavior

- Tables arranged in 4 columns with fixed card width (220px), vertical stacking per column, and configurable gaps.
- Canvas size computed from node positions; diagram scrolls horizontally/vertically inside the bottom panel.
- Relationship lines use cubic Bézier curves with arrow markers; endpoints attach to nearest card edge based on horizontal position.
- Selection resets when the user switches databases.

## F. Search/highlight behavior

- Search box filters by table name and column name (case-insensitive).
- Non-matching tables are dimmed (`opacity-35`); matching tables stay full opacity.
- Matching columns receive an amber highlight within their table card.
- Match count shown below search; “No matches found” when query has no hits.
- Empty query shows all tables at full opacity.

## G. Relationship list behavior

- Sidebar lists all FK relationships as `fromTable.fromColumn → toTable.toColumn`.
- Clicking a list item selects the relationship, highlights both tables and the corresponding SVG line, and shows details in the sidebar.
- Clicking a table highlights related tables and all relationships touching that table.
- Clicking again toggles selection off.

## H. 3D tab decision

- **Kept as lightweight placeholder** — “3D schema view — coming soon” message plus a compact table summary for the active database.
- **No Three.js or heavy 3D libraries** added in this phase.

## I. Safety confirmation

| Constraint | Status |
|------------|--------|
| No SQL execution changes | Confirmed |
| No answer checking changes | Confirmed |
| No sql.js engine changes | Confirmed |
| No backend / production DB / DATABASE_URL | Confirmed |
| No AI/LLM or paid APIs | Confirmed |
| No new databases | Confirmed |
| No Code Workbench changes | Confirmed |
| University/Hospital/Shipping Run + Check Answer preserved | Confirmed (no changes to execution/check paths) |
| Phase 5 progress tracking preserved | Confirmed |

## J. What was intentionally not implemented

- Full 3D schema visualization
- React Flow or other graph layout libraries
- Pan/zoom controls (scroll only)
- Minimap or auto-fit-to-viewport
- Column-level relationship endpoint precision beyond row-center alignment
- Persisted diagram selection across page reloads

## K. Build result

```
npm run build
✓ built in 2m 51s
exit code: 0
```

## L. Lint result

```
npx eslint src/features/sql-practice
exit code: 0
```

## M. Typecheck result

```
npx tsc --noEmit
exit code: 2 (pre-existing errors, none in new schema files)
```

Pre-existing errors (not introduced by Phase 6):

- `src/components/admin/widgets/KpiStatCard.tsx`
- `src/components/career-mapper/*` (CareerMapperPage, NodeDetailDrawer, SkillGapAnalyzer, SkillGapReport)
- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/editor-intelligence/completionProvider.ts`
- `src/features/sql-practice/editor-intelligence/sqlCompletionProvider.ts`
- `src/features/sql-practice/utils/sqlPracticeStorage.ts`
- `src/lib/dashboard-derive.ts`, `node-mastery-tracker.ts`, `roadmap-flow-data.ts`, `sandbox.test.ts`

## N. Smoke test result

Manual smoke test checklist from the issue spec was not run in an interactive browser session during this implementation. Build and lint passed; component wiring follows existing bottom-panel patterns and database metadata. **Recommend manual verification** using the checklist in section M of the issue before merge.

## O. Risks / limitations

- **Layout:** Fixed 4-column grid may feel crowded on very small viewports; users rely on scroll.
- **Line overlap:** Multiple relationships between distant columns may cross; no edge routing optimization.
- **Touch targets:** Relationship lines have a transparent wider hit area but may still be hard to tap on mobile.
- **Selection state:** Resets on database switch (by design); not persisted in localStorage.

## P. Phase 7 recommendation

- Add pan/zoom or “fit to panel” for large schemas
- Optional column-level hover on relationship lines
- Link schema selection to SQL editor (insert table/column names on click)
- Consider lazy-render for very large future schemas
- Address pre-existing `tsc --noEmit` errors repo-wide in a dedicated cleanup PR
