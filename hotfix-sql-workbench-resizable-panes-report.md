# Hotfix — SQL Workbench Resizable Panes Report

## A. Summary

Added SSMS-style draggable and collapsible panes to `/practice/sql`: Object Explorer (left), Practice Question (right), and Results (bottom). Layout dimensions and collapsed state persist in `localStorage`. Editor expands when panes are hidden. Reset Layout restores defaults. Code Workbench unchanged.

## B. Files added

| File |
|------|
| `src/features/sql-practice/utils/sqlPracticeLayoutStorage.ts` |
| `src/features/sql-practice/hooks/useResizableSqlLayout.ts` |
| `src/features/sql-practice/components/SqlPaneResizeHandle.tsx` |
| `src/features/sql-practice/components/SqlExpandRail.tsx` |
| `src/features/sql-practice/components/SqlPaneCollapseButton.tsx` |
| `hotfix-sql-workbench-resizable-panes-report.md` |

## C. Files modified

| File | Change |
|------|--------|
| `SqlPracticeLayout.tsx` | Resizable desktop layout + mobile stack fallback |
| `SqlPracticePage.tsx` | Wire layout hook, collapse buttons, reset |
| `SqlTopBar.tsx` | Reset Layout button |
| `SqlObjectExplorer.tsx` | Header collapse slot |
| `SqlQuestionPanel.tsx` | Header collapse slot |
| `SqlBottomPanel.tsx` | Flex height fill + collapse in tab bar |

## D. Layout behavior added

| Pane | Resize | Collapse | Limits |
|------|--------|----------|--------|
| Object Explorer | Horizontal drag | Chevron + expand rail | 220–420px, default 280 |
| Practice Question | Horizontal drag | Chevron + expand rail | 280–520px, default 340 |
| Results | Vertical drag | Chevron + expand rail | 120px – 45% viewport, default 220 |

- Thin dividers with `col-resize` / `row-resize` cursors and hover highlight
- Editor column grows when side/bottom panes collapse
- `window.resize` dispatched after drag/collapse for Monaco `automaticLayout`
- Below 1280px width: stacked layout (no drag/collapse chrome)

## E. localStorage layout persistence

Key: `sql-practice-layout-v1`

```json
{
  "leftWidth": 280,
  "rightWidth": 340,
  "bottomHeight": 220,
  "isLeftCollapsed": false,
  "isRightCollapsed": false,
  "isBottomCollapsed": false
}
```

## F. What was intentionally not implemented

- Phase 3 answer checking
- New database execution
- 3D schema
- Backend / production SQL
- AI / LLM
- Code Workbench layout changes

## G. Build result

```
npm run build — exit 0
```

## H. Smoke test result

| Check | Result |
|-------|--------|
| Build / lint | Pass |
| Browser resize/collapse/reset | Manual — verify after deploy |

## I. Risks / limitations

- Pixel-based drag (not `react-resizable-panels` %) — simpler but less touch-friendly
- Mobile/tablet uses stacked layout without persisted resize
- Very small viewports may still feel tight with all panes open

## J. Next phase recommendation

1. Merge hotfix and smoke-test production layout
2. Issue #30 Phase 3 — university answer checking
3. Optional: Playwright layout smoke script
