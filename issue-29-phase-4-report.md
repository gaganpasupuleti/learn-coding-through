# Phase 4 Report — Issue #29

## A. Summary

Added **Pyodide browser execution** for Python in the Code Practice Ground. Pyodide loads lazily on first Run/Submit (CDN WASM), caches the instance, supports `print` and `input()` via stdin. JavaScript, React/Sandpack, and backend API unchanged.

## B. Files created

- `src/features/code-practice/python/pyodideRunner.ts`
- `issue-29-phase-4-report.md`

## C. Files modified

- `package.json`
- `package-lock.json`
- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/components/OutputPanel.tsx`
- `src/features/code-practice/utils/executionAdapter.ts`

## D. Dependency added

```bash
npm install pyodide
```

- Version: `^0.29.4`
- WASM/assets loaded from CDN on first Python run (not on app boot).

## E. Pyodide runtime behavior

- `ensurePyodideLoaded()` — singleton cache + shared load promise.
- `runPythonWithPyodide(code, stdin?)` — stdout capture, stdin via `io.StringIO`, error formatting.
- Load failure → *"Python browser runtime failed to load. Please refresh and try again."*
- No automatic backend fallback.

## F. Python Run behavior

- `language === 'python'` → Pyodide only (not `sandbox.execute`).
- First run UI: *"Starting Python runtime…"* then *"Running Python…"*.
- Output panel: **Runtime: Pyodide** label.
- Stdin from `defaultInput` / active test case.

## G. Python Submit/test-case behavior

- Each test case runs through Pyodide with its `input`.
- Results compared via existing `buildTestResultsFromCases`.
- Multi-case Submit (e.g. Add Two Numbers, Even/Odd) supported.

## H. JavaScript regression check

- JavaScript still uses `sandbox.execute` → backend.
- No changes to JS Run/Submit path.

## I. React/Sandpack regression check

- React Run/Submit still Sandpack-only (Phase 3.1).
- No JSX sent to backend.

## J. SQL boundary check

- No SQL in Issue #29 module.
- Legacy SQL hub untouched.

## K. AI/token check

- No AI, LLM, or paid API usage.
- Pyodide runs locally in browser; CDN fetch only for WASM.

## L. Build/lint result

- `npm run build`: **passed** (exit code 0)
- Vite splits Pyodide into separate chunk (~2.5MB, loads with practice route / first import)
- `npm run lint`: pre-existing repo errors only

## M. Manual test steps

1. Open `/practice/code`
2. **Python** → Run Hello World → output + Runtime: Pyodide
3. Add Two Numbers → stdin works, output `5`
4. Submit Add Two Numbers → test cases pass
5. Check Even or Odd → both cases
6. **JavaScript** Run/Submit still works
7. **React** Sandpack preview + no backend on Run/Submit
8. Java/C/C++ coming soon unchanged
9. No SQL in workbench; legacy SQL hub intact

## N. Risks before Phase 5

1. First Python run requires network for Pyodide CDN (~tens of MB).
2. Pyodide chunk increases bundle size for `/practice/code` route.
3. Long-running/infinite Python loops can freeze tab (no timeout yet).
4. Legacy PracticePage still uses backend Python — two Python runtimes coexist.
5. Judge0 for Java/C/C++ still Phase 5+.

---
*Phase 4 complete. Phase 5 not started.*
