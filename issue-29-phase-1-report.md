# Phase 1 Report — Issue #29

## A. Summary

Added a new **Code Workbench** module under `src/features/code-practice/` — dark premium coding shell inspired by Judge0 IDE / VS Code. Includes Python, JavaScript, and React sample questions, Monaco editor reuse, output/test/hints/mistakes panels, and `/practice/code` routing. Legacy Practice Hub (with SQL) unchanged.

## B. Files created

- `src/features/code-practice/types/codePractice.types.ts`
- `src/features/code-practice/data/codeQuestions.ts`
- `src/features/code-practice/data/starterTemplates.ts`
- `src/features/code-practice/utils/resultComparator.ts`
- `src/features/code-practice/utils/mistakeClassifier.ts`
- `src/features/code-practice/utils/executionTimer.ts`
- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/components/CodeWorkbenchLayout.tsx`
- `src/features/code-practice/components/PracticeToolbar.tsx`
- `src/features/code-practice/components/LanguageSelector.tsx`
- `src/features/code-practice/components/ProblemPanel.tsx`
- `src/features/code-practice/components/CodeEditorPanel.tsx`
- `src/features/code-practice/components/OutputPanel.tsx`
- `src/features/code-practice/components/TestResultsPanel.tsx`
- `src/features/code-practice/components/HintsPanel.tsx`
- `src/features/code-practice/components/OldMistakesPanel.tsx`
- `src/features/code-practice/components/AttemptHistoryPanel.tsx`
- `src/features/code-practice/components/LivePreviewPanel.tsx`
- `issue-29-phase-1-report.md`

## C. Files modified

- `src/App.tsx`
- `src/components/shells/StudentShell.tsx`
- `src/components/practice-ground/practice-ground-types.ts`
- `src/index.css`

## D. What changed

- **Routing:** `practice-code` page key, URL `/practice/code`, nav **Code Workbench**
- **UI shell:** Toolbar, problem panel, editor, output, live preview placeholder, bottom tabs
- **Data:** 9 questions (Python×3, JS×3, React×3) with hints, examples, starter code
- **Execution:** Run/Submit via existing `sandbox.execute` for Python/JS (React uses JS runner)
- **ISSUE_29 languages:** Extended to `['python', 'javascript', 'react', 'java']` (no SQL)

## E. What was intentionally not changed

- Legacy `PracticePage` / `CodePracticeGroundPage` (SQL still there)
- SQL backend, schema API, SQL UI
- Sandpack, Pyodide, Judge0, Piston
- AI/LLM features
- Java/C/C++ execution (marked coming-soon in UI)

## F. SQL boundary check

- New module has **no SQL** language, questions, editor, schema, or result grid.
- `OldMistakesPanel` filters out SQL mistakes (Issue #30).
- Legacy Practice Hub SQL tab **not removed**.

## G. AI/token check

- No AI, LLM, or token-based features added.
- No API keys or secrets committed.

## H. Build/test result

- `npm run build`: **passed** (exit code 0)
- `npm run lint`: pre-existing repo errors; Phase 1 `PracticeToolbar` unused-var fixed

## I. Manual test steps

1. Learning → **Code Workbench** opens
2. Switch Python / JavaScript / React — problem + editor update
3. Select question pills — starter code changes
4. Run Hello World (Python/JS) — output panel shows result
5. Submit — test results tab compares expected output
6. Hints / mistakes / history tabs render
7. Legacy **Practice Hub (Legacy)** → SQL tab still works

## J. Risks / warnings

- `/practice/code` direct refresh may 404 without SPA fallback
- React checks use `console.log` until Sandpack (Phase 2)
- Toolbar theme selector does not yet wire to Monaco theme
- Two practice entry points until later consolidation
