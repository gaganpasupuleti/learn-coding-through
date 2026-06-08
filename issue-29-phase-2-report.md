# Phase 2 Report — Issue #29

## A. Summary

Improved Code Workbench execution wiring: Monaco theme now follows the toolbar selector, Python stdin is mocked client-side via an execution adapter, questions gained structured test cases, Submit runs multi-case comparisons, React preview boundary clarified for Phase 3, and coming-soon languages show Judge0 messaging without switching selection.

## B. Files created

- `src/features/code-practice/utils/executionAdapter.ts`
- `issue-29-phase-2-report.md`

## C. Files modified

- `src/components/CodeEditor.tsx`
- `src/features/code-practice/types/codePractice.types.ts`
- `src/features/code-practice/data/codeQuestions.ts`
- `src/features/code-practice/utils/resultComparator.ts`
- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/components/CodeEditorPanel.tsx`
- `src/features/code-practice/components/LanguageSelector.tsx`
- `src/features/code-practice/components/PracticeToolbar.tsx`
- `src/features/code-practice/components/ProblemPanel.tsx`
- `src/features/code-practice/components/OutputPanel.tsx`
- `src/features/code-practice/components/LivePreviewPanel.tsx`

## D. Theme wiring changes

- Added optional `monacoTheme` prop to `CodeEditor` (`vs-dark` | `vs` | `hc-black`).
- When provided, overrides internal KV theme for Monaco only; other `CodeEditor` usages unchanged.
- `CodeEditorPanel` passes workbench toolbar theme into `CodeEditor`.

## E. Input/test-case changes

- `CodePracticeQuestion` now supports `defaultInput?` and `testCases[]` (`label`, `input?`, `expectedOutput`).
- All 9 questions updated with sample test cases.
- `ProblemPanel` shows sample stdin and case summary.
- `OutputPanel` shows stdin used for the current run + adapter note.
- `executionAdapter.ts` mocks Python stdin with `io.StringIO` until backend accepts stdin.
- **TODO:** `POST /api/v1/execute` still uses `stdin=DEVNULL` in `backend/executors/common.py` — proper server-side stdin is a later backend task.

## F. Execution behavior after Phase 2

- **Run:** executes with `defaultInput` / first test case stdin via adapter.
- **Submit:** loops all test cases, compares each with `buildTestResultsFromCases`.
- **Python** `input()` questions work via client-side stdin mock.
- **JavaScript/React:** inline variables / `console.log` (no stdin yet).
- **Java/C/C++:** visible, clickable with toast — selection does not change.

## G. React/Sandpack boundary

- `LivePreviewPanel` now states: *"Live React preview will be connected in Phase 3 using Sandpack."*
- React questions still use `console.log` for temporary checks.
- Full Sandpack **not** implemented.

## H. SQL boundary check

- No SQL added to Issue #29 module.
- Legacy Practice Hub SQL untouched.
- SQL remains Issue #30 only.

## I. AI/token check

- No AI, LLM, or paid model/API usage added.
- No secrets committed.

## J. Build/lint result

- `npm run build`: **passed** (exit code 0, ~3m 35s)
- `npm run lint`: pre-existing repo errors (~389); no new errors in Phase 2 feature files

## K. Manual test steps

1. Open `/practice/code` → Code Workbench loads
2. Change theme (Dark/Light/HC) → Monaco appearance updates
3. Python Hello World → Run + Submit pass
4. Python Add Two Numbers → sample stdin shown; Run outputs `5`
5. Submit on multi-case Python question → per-case results in bottom panel
6. Switch JavaScript / React → problem + editor update
7. Click Java/C/C++ → toast about Judge0; language stays on current selection
8. Legacy Practice Hub → SQL still present

## L. Risks before Phase 3

1. Python stdin mock is client-side only — move to backend stdin when ready.
2. JS multi-case questions with different variable values still require manual code edits for non-default cases.
3. `/practice/code` direct refresh may 404 without SPA fallback.
4. Sandpack + real React preview deferred to Phase 3.

---
*Phase 2 complete. Phase 3 not started.*
