# Phase 0 Report — Issue #29

## A. Summary

Fixed the `CodeEditor` controlled `code` prop bug so Monaco stays in sync when parent state changes (retry, reset, exercise load). Froze SQL boundaries with comments and `ISSUE_29_CODE_PRACTICE_LANGUAGES` — SQL remains Issue #30 only. No SQL behavior was changed or removed.

## B. Files created

- `issue-29-phase-0-report.md`

## C. Files modified

- `src/components/CodeEditor.tsx`
- `src/components/practice-ground/practice-ground-types.ts`
- `src/components/pages/PracticePage.tsx`
- `src/components/pages/CodePracticeGroundPage.tsx`
- `src/lib/practice-mistakes.ts`
- `src/lib/api.ts`

## D. What changed

- **CodeEditor:** Controlled mode when `code` prop is passed; uncontrolled mode when only `initialCode`; run/reset use `editorCode`.
- **SQL boundary:** Comments marking SQL as Issue #30; `ISSUE_29_CODE_PRACTICE_LANGUAGES = ['python', 'java']` (no SQL).
- **Legacy practice:** SQL tab and schema UI untouched; only documentation comments added.

## E. What was intentionally not changed

- `PracticePage` structure (still monolithic)
- SQL executors, schema API, SQL tab behavior
- New Code Workbench module (Phase 1)
- Pyodide, Sandpack, Judge0, AI/LLM features
- Legacy `CodePracticeGroundPage` routing

## F. SQL boundary check

- SQL was **not** added to Issue #29 work.
- SQL still belongs to **Issue #30** (comments + constant exclude `sql`).
- Legacy SQL practice hub section remains available.

## G. AI/token check

- No AI, LLM, or paid model/API usage added.
- No API keys or secrets added.

## H. Build/test result

- `npm run build`: **passed** (exit code 0)
- `npm run lint`: repo has pre-existing lint errors (389); no new errors in Phase 0 files

## I. Manual test steps

1. Open legacy Practice Hub — loads correctly
2. Switch exercises — editor syncs with parent code state
3. Retry from Mistakes Review — editor shows retried code
4. Reset starter code — editor updates
5. Python/Java run paths unchanged
6. SQL tab still present and functional

## J. Risks / warnings

- PracticePage remains monolithic until Phase 1+ split
- Dual Python execution paths (Pyodide vs backend) still exist in other flows
- Phase 1 should not refactor SQL paths
