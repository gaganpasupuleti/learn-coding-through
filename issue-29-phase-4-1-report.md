# Phase 4.1 Report — Issue #29

## A. Summary

Fixed the **Python Run guard** in `CodePracticePage.tsx` so Python Run reaches `executeOnce()` → `runPythonWithPyodide()` instead of being blocked by `toSandboxLanguage()`. JavaScript, React/Sandpack, and coming-soon languages remain unchanged.

## B. Files modified

- `src/features/code-practice/components/CodePracticePage.tsx`
- `issue-29-phase-4-1-report.md`

## C. Root cause

`handleRun()` gated execution on `toSandboxLanguage(language)`, which only returns `'javascript'`. Python was added to `executeOnce()` in Phase 4 but the Run entry path was never updated, so Python Run showed *"Execution for this language is planned for a later phase"* and never called Pyodide.

`handleSubmit()` did not use that guard and already looped test cases through `executeOnce()` correctly.

## D. Fix applied

Added explicit workbench executability helpers:

- `canRunInWorkbench(language)` — `python` or `javascript`
- `isComingSoonLanguage(language)` — reads `CODE_PRACTICE_LANGUAGE_MODES` status

Updated `handleRun()` routing:

| Language | Behavior |
|----------|----------|
| React | `handleReactRun()` (Sandpack guidance) |
| Python | `executeOnce()` → Pyodide |
| JavaScript | `executeOnce()` → `sandbox.execute` |
| Java / C / C++ | coming-soon toast, stop |

`toSandboxLanguage()` remains used **inside** `executeOnce()` for backend JS only — not as the Run gate for Python.

`handleSubmit()` received matching coming-soon / `canRunInWorkbench` guards for consistency (Python Submit path unchanged).

## E. Python Run verification

- `handleRun()` no longer blocks `language === 'python'`.
- Run calls `executeOnce()` → `runPythonWithPyodide()`.
- Output panel shows **Runtime: Pyodide** on success.
- Stdin from active test case / `defaultInput` still passed.

## F. Python Submit verification

- Submit still iterates `resolveQuestionTestCases(question)` and calls `executeOnce()` per case.
- Multi-case questions (e.g. Add Two Numbers) run through Pyodide unchanged.
- Results compared via `buildTestResultsFromCases`.

## G. JavaScript regression check

- JavaScript Run/Submit still routed through `executeOnce()` → `sandbox.execute` → backend `/api/v1/execute`.
- No Pyodide involvement for JS.

## H. React/Sandpack regression check

- React Run → `handleReactRun()` only.
- React Submit → `buildReactPreviewCheckResults()` preview-check only.
- No backend or Pyodide calls for React.

## I. Java/C/C++ coming-soon check

- Language selector already blocks selection with Judge0 toast.
- Run/Submit guards use `isComingSoonLanguage()` for defensive stop if state were ever set.

## J. SQL boundary check

- No SQL in `src/features/code-practice/`.
- Legacy SQL hub untouched.
- Issue #30 boundary comments unchanged.

## K. AI/token check

- No AI, LLM, Judge0, or new paid APIs added.

## L. Build result

- `npm run build`: **passed** (exit code 0, built in ~4m 55s)
- Pyodide chunk unchanged (~2.5MB); no new build warnings from Phase 4.1 changes

## M. Manual test steps

1. Open `/practice/code`
2. Switch to **Python**
3. Run **Print Hello World** → output appears, **Runtime: Pyodide** shown
4. Run **Add Two Numbers** with sample input → `input()` works
5. Submit **Add Two Numbers** → sample cases pass
6. Switch to **JavaScript** → Run Hello World → backend JS path works
7. Switch to **React** → Run and Submit → Sandpack only, no backend
8. Click **Java / C / C++** → coming-soon behavior
9. Confirm SQL not in Issue #29 module
10. Run `npm run build`
