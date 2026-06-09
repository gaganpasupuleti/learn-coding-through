# Issue #29 — Workbench Typography Polish Report

PR: [#31 — Rebuild Code Practice Ground without AI token usage](https://github.com/gaganpasupuleti/learn-coding-through/pull/31)  
Branch: `issue-29-code-practice-rebuild`

## A. Summary

Improved readability across **Code Workbench** (`/practice/code`) and **SQL Practice Ground** (`/practice/sql`) by raising font sizes from 10–12px to a 13–16px range, increasing panel padding, widening grid columns slightly, and configuring Monaco with 15px / 1.6 line height. No execution logic, routing, or feature behavior was changed.

## B. Files modified

| File | Change |
|------|--------|
| `src/components/CodeEditor.tsx` | `fontSize`, `lineHeight`, `showEditorChrome` props; default 15px editor |
| `src/index.css` | Embedded editor fill rule for workbench |
| `src/features/code-practice/components/CodeEditorPanel.tsx` | 15px Monaco, hide duplicate chrome |
| `src/features/code-practice/components/ProblemPanel.tsx` | Larger title/body/examples padding |
| `src/features/code-practice/components/PracticeToolbar.tsx` | `text-sm` buttons, taller toolbar |
| `src/features/code-practice/components/LanguageSelector.tsx` | `text-sm` tabs; coming-soon `text-xs` |
| `src/features/code-practice/components/OutputPanel.tsx` | `text-sm` stdout/console/feedback |
| `src/features/code-practice/components/LivePreviewPanel.tsx` | `text-sm` headers |
| `src/features/code-practice/components/CodeWorkbenchLayout.tsx` | Wider columns, taller bottom panel |
| `src/features/code-practice/components/TestResultsPanel.tsx` | `text-sm` content |
| `src/features/code-practice/components/HintsPanel.tsx` | `text-sm` content |
| `src/features/code-practice/components/OldMistakesPanel.tsx` | `text-sm` list items |
| `src/features/code-practice/components/AttemptHistoryPanel.tsx` | `text-sm` content |
| `src/features/code-practice/components/CodePracticePage.tsx` | Question picker `text-sm` |
| `src/features/sql-practice/components/SqlToolbar.tsx` | `text-sm` controls |
| `src/features/sql-practice/components/SqlEditorPlaceholder.tsx` | 15px / 1.6 SQL textarea |
| `src/features/sql-practice/components/SqlSchemaExplorer.tsx` | `text-sm` explorer |
| `src/features/sql-practice/components/SqlQuestionPanel.tsx` | `text-sm` / `text-base` task copy |
| `src/features/sql-practice/components/SqlResultGridPlaceholder.tsx` | `text-sm` tabs/content |
| `src/features/sql-practice/components/SqlWorkbenchLayout.tsx` | Slightly wider side columns |

## C. Font size changes

| Area | Before | After |
|------|--------|-------|
| Monaco editor | 14px | **15px**, line height **24px** (~1.6) |
| Problem title | `text-sm` (14px) | **`text-base` (16px)** |
| Problem body / examples | `text-xs` (12px) | **`text-sm` (14px)** |
| Section labels | `text-[10px]` | **`text-xs` (12px)** |
| Toolbar / language tabs | `text-xs` | **`text-sm` (14px)** |
| Output stdout/console | `text-xs` | **`text-sm` (14px)** |
| Bottom tabs | `text-xs` | **`text-sm` (14px)** |
| SQL editor textarea | `text-xs` | **`text-[15px]`** with `leading-[1.6]` |
| SQL task panel | `text-xs` | **`text-sm` / `text-base`** |
| Metadata chips / timestamps | `text-[10px]` | **`text-xs` (12px)** where kept |

## D. Spacing/layout changes

- Toolbar padding: `py-2.5` → **`py-3`**
- Problem panel padding: `px-4 py-3` → **`px-5 py-4`**
- Output panel padding: `p-3` → **`p-4`**
- Bottom panel max height: `max-h-44` → **`max-h-52`**
- Code grid columns: `minmax(220px,280px)` → **`minmax(240px,300px)`** (problem), **`minmax(240px,320px)`** (output)
- SQL grid columns widened similarly
- Code editor: removed duplicate Monaco chrome in workbench (cleaner vertical space)

## E. Code editor changes

- Added optional props to `CodeEditor`: `fontSize`, `lineHeight`, `showEditorChrome`
- Workbench passes `fontSize={15}`, `lineHeight={24}`, `showEditorChrome={false}`
- Default `fontSize` for standalone `CodeEditor` usage is now **15px** (was 14px)
- Dark Monaco theme unchanged (`vs-dark` / workbench theme picker)

## F. Code Workbench smoke test

| Check | Result |
|-------|--------|
| Route `/practice/code` builds | Pass |
| Monaco 15px in workbench | Pass (configured) |
| Python / JS / React paths unchanged | Pass (no logic edits) |
| Sandpack preview component intact | Pass |
| Java/C/C++ coming-soon tabs | Pass |
| Manual browser Run/Submit | Verify locally |

## G. SQL shell smoke test

| Check | Result |
|-------|--------|
| Route `/practice/sql` builds | Pass |
| Readable SQL editor / panels | Pass (typography updated) |
| Run Query still disabled | Pass |
| No SQL execution added | Pass |

## H. Intentionally not changed

- Execution engines (Pyodide, backend JS sandbox, Sandpack)
- Judge0 scaffold (still disabled)
- Routing / navigation / legacy hub removal
- Quiz, Typing, unrelated app pages
- AI/LLM — none added
- SQL execution — still placeholder

## I. Build/lint result

```
npm run build                              → PASS
eslint src/features/code-practice          → PASS (0 errors)
eslint src/features/sql-practice           → PASS (0 errors, 1 react-refresh warning — pre-existing)
```

## J. Risks before merge

1. **Standalone CodeEditor** (projects/quiz) now defaults to 15px — slightly larger but more readable; acceptable shared change.
2. **Taller bottom panels** may reduce editor height on short viewports — mitigated by `max-h-52` and scroll.
3. **Manual visual check** at 1366px and 1920px recommended before merge.

---

*Typography-only polish on `issue-29-code-practice-rebuild`. Do not merge to `main` from this step alone.*
