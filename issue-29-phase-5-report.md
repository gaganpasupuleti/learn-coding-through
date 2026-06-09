# Phase 5 Report — Issue #29

## A. Summary

Added **beginner Python browser-runtime safety checks** before Pyodide execution, capped stdout size, improved Reset and first-run loading UX. JavaScript, React/Sandpack, and legacy SQL hub remain unchanged. No Judge0, AI, or backend Python fallback.

## B. Files created

- `src/features/code-practice/python/pythonSafetyValidator.ts`
- `issue-29-phase-5-report.md`

## C. Files modified

- `src/features/code-practice/python/pyodideRunner.ts`
- `src/features/code-practice/components/CodePracticePage.tsx`

## D. Python safety validator behavior

- `validatePythonSafety(code)` inspects source before Pyodide runs.
- `getPythonSafetyBlock(code)` returns a block result or `null` when safe.
- Applied only in `executeOnce()` when `language === 'python'` (Run + Submit).
- Blocked code never calls `runPythonWithPyodide()` — page stays responsive.
- User-facing error: *"This code looks unsafe for browser execution."*
- Rule detail shown in output note + console (`[ruleId] message`).
- Warnings (infinite loops, huge `range`) use `allowed: false` — no confirmation UI in Phase 5.
- Documented as **beginner safety**, not full sandbox security.

## E. Blocked patterns

| Rule ID | Pattern |
|---------|---------|
| `infinite-while` | `while True` / `while 1` without `break` within ~1200 chars |
| `large-range` | `range()` numeric args ≥ 1,000,000 |
| `import-os` / `from-os` | `import os` / `from os` |
| `import-subprocess` / `from-subprocess` | subprocess imports |
| `import-socket` / `from-socket` | socket imports |
| `import-requests` / `from-requests` | requests imports |
| `eval-call` | `eval(` |
| `exec-call` | `exec(` |
| `dunder-import` | `__import__(` |
| `file-write` | `open(..., "w")` / `open(..., "a")` |
| `os-remove` / `os-unlink` | file delete calls |

Single-line `#` comments are stripped before loop/range checks to reduce false positives.

## F. Output truncation behavior

- `MAX_PYODIDE_OUTPUT_CHARS = 20_000` in `pyodideRunner.ts`.
- `truncatePyodideOutput()` applied to success and partial-error stdout.
- Truncated output appends: `[Output truncated for browser safety]`.
- Normal small outputs unchanged.

## G. Reset UX changes

`handleReset()` now clears via `clearExecutionState()`:

- output
- error
- console lines
- test results
- last run time
- execution note
- runtime label

Starter code restored; toast confirms reset.

## H. Python Run/Submit verification

- Safe Python (Hello World, Add Two Numbers) still runs through Pyodide.
- `input()` stdin wiring unchanged.
- Submit still loops test cases through `executeOnce()` → Pyodide.
- Unsafe code blocked before WASM execution on Run and Submit.
- Loading: *"Starting Python runtime…"* → *"Running Python…"* after Pyodide loads.
- Load failure message unchanged (no backend fallback).

## I. JavaScript regression check

- JavaScript Run/Submit unchanged — `sandbox.execute` backend path only.
- Validator not applied to JavaScript.

## J. React/Sandpack regression check

- React Run/Submit unchanged — Sandpack preview-check only.
- Validator not applied to React.

## K. SQL boundary check

- No SQL added to `src/features/code-practice/`.
- Issue #30 boundary comments unchanged.
- Legacy `PracticePage` SQL hub not modified.

## L. AI/token check

- No AI, LLM, Judge0, or paid API usage added.
- Pyodide still runs locally in browser.

## M. Build/lint result

- `npm run build`: **passed** (exit code 0, built in ~3m 27s)
- Touched files: no new linter errors

## N. Manual test steps

1. Open `/practice/code`
2. **Python** → Run Hello World → Pyodide works, Runtime label shown
3. Run Add Two Numbers with input → `input()` works
4. Submit Add Two Numbers → cases pass
5. `while True:` → blocked before Pyodide
6. `range(1000000000)` → blocked
7. `import os` → blocked
8. Many `print()` lines → output truncated at 20k chars
9. **Reset** → output, console, timer, runtime label, error, test results clear
10. **JavaScript** → Run/Submit still works via backend
11. **React** → Sandpack preview; Run/Submit no backend
12. Confirm SQL absent from Issue #29 module; legacy SQL hub intact
13. `npm run build`

## O. Risks before Phase 6

- Validator is heuristic — clever students can still freeze the tab (e.g. deep recursion, moderate loops under threshold).
- No worker isolation or execution timeout yet — infinite loops that pass the validator can still block the main thread.
- Pyodide WASM load still depends on CDN/network on first run.
- Output truncation does not stop runaway printing inside Pyodide — only limits displayed result size after run completes or errors.
- Phase 6 may add worker-based timeout, stronger loop detection, or optional “run anyway” for warnings.
