# Hotfix report: JavaScript Run OOM on Railway

## A. Summary

JavaScript **Run** failed on Railway production with `Fatal process OOM in Failed to reserve virtual memory for CodeRange` while Python (Pyodide in-browser) still worked. This hotfix removes the POSIX virtual-memory cap (`RLIMIT_AS`) for Node.js subprocesses and relies on a bounded V8 heap (`--max-old-space-size=128`) plus existing timeout and validation guards. Frontend feedback now explains server OOM/CodeRange failures clearly.

**Branch:** `hotfix-javascript-run-railway-oom`  
**Scope:** Backend JS executor + optional workbench error copy only. No SQL, Judge0, Java/C/C++, AI, or workbench UI changes.

## B. Root cause

`run_guarded_subprocess` applied `RLIMIT_AS` at **256MB** for all executors. Node/V8 must reserve a large virtual address range for its JIT **CodeRange** at startup. On Railway’s small containers, that cap caused Node to abort before user code ran — even for `console.log("Hello World")`.

Python in Code Workbench uses **Pyodide in the browser**, so it never hit this backend path.

## C. Files changed

| File | Change |
|------|--------|
| `backend/executors/javascript_executor.py` | `max_memory_mb=0`, `--max-old-space-size=128` |
| `backend/executors/common.py` | Skip `RLIMIT_AS` when `max_memory_mb <= 0` |
| `src/features/code-practice/javascript/javascriptFeedback.ts` | Friendly OOM / CodeRange message |
| `backend/tests/test_sandbox_smoke.py` | Hello World, variables, JS timeout regression tests |

## D. Backend executor change

- **Before:** `node --max-old-space-size=128` with `max_memory_mb=256` → V8 OOM on Railway.
- **After:** `node --max-old-space-size=128` with `max_memory_mb=0` → no `RLIMIT_AS` for Node; Python/Java/SQL keep default 256MB cap.
- **Still active:** subprocess timeout, isolated temp workspace, `stdin=DEVNULL`, `start_new_session`, code validation, output truncation.

## E. Frontend feedback change

`explainJavaScriptError` detects `fatal process oom`, `failed to reserve virtual memory`, and `javascript heap out of memory` and shows **“Sandbox could not start”** with guidance to retry / contact instructor if persistent. No workbench layout or run-flow changes.

## F. Safety controls still active

- Pre-run `validate_code` / JavaScript safety validator (unchanged)
- 5s default execution timeout (unchanged)
- 10k output character cap (unchanged)
- Subprocess isolation in temp directory (unchanged)
- Python executor still uses `max_memory_mb=256` (unchanged)
- Java/C/C++ remain **coming soon** in UI (unchanged)
- React Sandpack preview path untouched (unchanged)
- No Judge0, no SQL execution changes, no DB attempt storage

## G. Smoke test results

| Test | Result |
|------|--------|
| `console.log("Hello World")` → `Hello World` | **PASS** (`test_javascript_hello_world`) |
| `const x=10; const y=20; console.log(x+y)` → `30` | **PASS** (`test_javascript_variables_sum`) |
| `while (true) {}` timeout | **PASS** (`test_javascript_infinite_loop_times_out`) |
| Full `test_sandbox_smoke.py` (13 tests) | **PASS** |
| `npm run build` | **PASS** |
| ESLint `javascriptFeedback.ts` | **PASS** |
| Python Pyodide path | **Not modified** — verified by scope |
| React Sandpack | **Not modified** — verified by scope |
| Java/C/C++ coming soon | **Not modified** — verified by scope |

## H. Railway deploy note

1. Merge PR after review.
2. **Redeploy the backend API service** on Railway (frontend redeploy optional — only copy change).
3. Verify: `POST /api/v1/execute` with `{"code":"console.log(\"Hello World\")","language":"javascript"}` returns `success: true` and `output: "Hello World"`.
4. In app: Code Workbench → JavaScript → Run on Hello World question.

## I. Risks

| Risk | Mitigation |
|------|------------|
| Node without `RLIMIT_AS` could use more RAM on abuse | Timeout + validation + 128MB heap flag; monitor Railway memory |
| Other executors still use 256MB cap | Only JS opts out; Python/Java unchanged |
| Very memory-heavy student JS could still fail | Bounded heap; clearer error message |
| Production needs backend redeploy | Frontend-only deploy will **not** fix Run |
