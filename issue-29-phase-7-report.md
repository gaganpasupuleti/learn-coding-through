# Phase 7 Report — Issue #29

## A. Summary

Integrated **dedicated Code Practice Ground mistake tracking** with rich localStorage records, a full **Old Mistakes** panel (retry, clear item, clear all, repeated-mistake summary), and save hooks on Python/JavaScript Run and Submit. Legacy `practice-mistakes.ts` and `MistakesReviewPanel` unchanged.

## B. Files created

- `src/features/code-practice/utils/codePracticeMistakes.ts`
- `issue-29-phase-7-report.md`

## C. Files modified

- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/components/OldMistakesPanel.tsx`

## D. Existing mistake tracking reviewed

**Legacy (`src/lib/practice-mistakes.ts`)**

- Key: `codequest-practice-mistakes`
- Shape: `{ id, language, message, codePreview, createdAt }`
- Languages: `python | sql | java | quiz`
- Used by legacy `MistakesReviewPanel` — **not modified**

**New module (Phase 7)**

- Separate key: `codequest-code-practice-mistakes`
- Richer records for Issue #29 workbench only
- No SQL / quiz entries from new adapter

## E. New mistake record structure

```ts
{
  id, language, questionId, questionTitle, topic, difficulty,
  submittedCode, inputUsed, expectedOutput, actualOutput,
  errorMessage, feedbackTitle, feedbackMessage, feedbackSuggestion,
  feedbackRuleId, mistakeType, createdAt, attemptType, status
}
```

- `mistakeType`: syntax | runtime | safety-block | prerun-block | wrong-output | failed-test-case | unknown
- `status`: failed | blocked | warning
- `attemptType`: run | submit
- Max 50 records; 30s duplicate suppression

## F. Python Run mistake behavior

| Outcome | Saved? | Type / status |
|---------|--------|---------------|
| Success | No | — |
| Safety block | Yes | safety-block / blocked |
| Pre-run block | Yes | prerun-block / blocked |
| Pyodide runtime error | Yes | syntax or runtime / failed |
| Non-blocking hints only | No | — |

Uses Phase 6 `explainPythonError()` for runtime feedback fields.

## G. Python Submit mistake behavior

| Outcome | Saved? | Type / status |
|---------|--------|---------------|
| All cases pass | No | — |
| Safety / pre-run / runtime during loop | Yes | same as Run, attemptType submit |
| Wrong output (test mismatch) | Yes | failed-test-case / failed with expected vs actual |

## H. JavaScript mistake behavior

- Run/Submit backend errors → `recordJavaScriptErrorMistake` (syntax/runtime via `classifyRunError`)
- Failed test case on Submit → `recordFailedTestCaseMistake`
- No extra JS feedback layer in Phase 7

## I. React/Sandpack limitation

- Successful React preview-check Submit is **not** saved as a mistake.
- Sandpack compile/runtime errors are not wired to mistake storage in Phase 7 (no easy accessible error hook without faking DOM validation).
- **Deferred to Phase 8/9** in report risks.

## J. Retry behavior

- **Retry** loads language, question, `submittedCode`, and `inputUsed` (matching test case when possible).
- Does **not** auto-run.
- Clears output/error/console/test results; toast: *"Mistake loaded — fix your code and run again."*

## K. Clear mistake behavior

- **X** on each item → `removeCodePracticeMistake(id)`
- **Clear all** → `clearCodePracticeMistakes()` with confirm dialog
- Panel refreshes via `refreshKey` + local state

## L. Repeated mistake summary

- `getTopRepeatedMistake()` counts by `feedbackRuleId` or `mistakeType`
- Shown when count ≥ 2: *"Most repeated: missing-colon (3×)"*

## M. SQL boundary check

- New storage adapter excludes SQL.
- Legacy SQL hub and `practice-mistakes.ts` untouched.

## N. AI/token check

- No AI, LLM, Judge0, or paid APIs.

## O. Build/lint result

- `npm run build`: **passed** (exit code 0, built in ~6m 2s)
- Touched files: no new linter errors

## P. Manual test steps

1. `/practice/code` → Python
2. Run `pritn("Hello")` → mistake saved (runtime)
3. Old Mistakes panel shows rule/message
4. Retry → language/question/code/input reload
5. `if x > 5` → prerun-block saved
6. `import os` → safety-block saved
7. Submit Add Two Numbers wrong code → failed-test-case with expected/actual
8. Clear one / clear all
9. JavaScript error → JS mistake saved
10. React preview-check success → no mistake
11. Java/C/C++ coming-soon unchanged
12. SQL absent from Issue #29 module; legacy hub intact
13. `npm run build`

## Q. Risks before Phase 8

- New and legacy mistake stores are separate — legacy hub mistakes do not appear in new panel.
- Duplicate suppression may skip rapid identical failures within 30s.
- React/Sandpack errors not tracked yet.
- No backend sync — localStorage only.
- Phase 8 may unify legacy + workbench views or add cross-panel migration.
