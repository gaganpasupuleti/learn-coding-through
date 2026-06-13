# Hotfix — Full-screen SQL Schema Diagram View Report

## A. Summary

Phase 6.1 adds an **Expand schema** button to the Schema Diagram tab that opens the same interactive ERD in a full-viewport overlay. The overlay reuses `SqlSchemaDiagram` with a `fullscreen` prop, preserves search/selection/relationship features, supports Escape and Close, and locks body scroll while open. The 3D tab copy was clarified to point students to the 2D ERD. No SQL execution, answer checking, or backend changes were made.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/sql-practice/components/schema/SqlSchemaFullscreenDialog.tsx` | Full-viewport portal overlay with header, close control, Escape handler |

## C. Files modified

| File | Change |
|------|--------|
| `src/features/sql-practice/components/schema/SqlSchemaDiagram.tsx` | Added `fullscreen` and `onRequestFullscreen` props; Expand button; wider sidebar and canvas padding in fullscreen |
| `src/features/sql-practice/components/schema/SqlRelationshipList.tsx` | Added `expanded` prop for taller scrollable list in fullscreen |
| `src/features/sql-practice/components/SqlBottomPanel.tsx` | Wired fullscreen dialog state; passes expand handler; closes overlay on database switch; updated 3D tab copy |

## D. Full-screen ERD behavior

- **Open:** Click **Expand schema** (Maximize icon) in the Schema Diagram toolbar.
- **Overlay:** Fixed `inset-0` portal with dark workbench theme (`z-[100]`).
- **Header:** Shows active database `displayName` and a **Close** button.
- **Close:** Close button or **Escape** key; body scroll restored on unmount.
- **Content:** Same `SqlSchemaDiagram` with `fullscreen` — search, table cards, SVG lines, relationship list, table/relationship selection all work.
- **Layout:** Horizontal row layout, 320px sidebar, larger canvas padding, scrollable ERD area using full viewport height minus header.
- **Database switch:** Overlay auto-closes when the active database changes.

## E. Normal ERD behavior

- Bottom-panel Schema Diagram tab unchanged except for the new **Expand schema** button beside search.
- Still renders in the resizable bottom pane with existing scroll and interaction behavior.

## F. 3D tab clarification

Copy updated to:

> 3D schema view is planned for a later phase. Current Phase 6 provides the interactive 2D ERD — use the Schema Diagram tab (or Expand schema) for full table and relationship exploration.

Lightweight table summary retained. No Three.js or real 3D added.

## G. Safety confirmation

| Area | Changed? |
|------|----------|
| SQL Run / Check Answer | No |
| Expected Output Preview | No |
| Progress tracking | No |
| Mistakes / Attempt History | No |
| SQL suggestions | No |
| sql.js engine | No |
| Backend / production DB | No |
| Code Workbench | No |
| `sqlSchemaGraph.ts` | No |

## H. What was intentionally not changed

- Graph layout algorithm and metadata source
- SQL execution and validation paths
- Real 3D schema visualization
- Pan/zoom controls
- Persisted fullscreen preference across sessions

## I. Build result

```
npm run build
✓ built in ~4m
exit code: 0
```

## J. Lint result

```
npx eslint src/features/sql-practice
exit code: 0
```

## K. Typecheck result

```
npx tsc --noEmit
exit code: 2 (pre-existing repo errors only)
```

No new errors in `schema/` components or `SqlBottomPanel.tsx`. Pre-existing errors remain in career-mapper, code-practice, sqlPracticeStorage, dashboard-derive, etc.

## L. Smoke test result

Manual browser smoke test was not run in this session. Build and lint passed; component wiring follows existing patterns. Recommend running the issue checklist before merge.

## M. Risks / limitations

- Fullscreen overlay uses a high z-index portal; rare stacking conflicts with other global modals are possible.
- Fullscreen selection state is independent from the bottom-panel diagram (separate component instance).
- No focus trap inside the overlay (Escape still closes).
- Mobile: sidebar stacks below canvas in narrow fullscreen viewports.
