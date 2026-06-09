# Code Practice Ground (Issue #29)

Multi-language coding workbench for beginner practice — **no AI/LLM**, **no SQL** in this module.

## Purpose

Provide a dedicated dark-themed **Code Workbench** where students run sample problems in Python, JavaScript, and React with safety checks, beginner-friendly feedback, and local mistake tracking.

## Route

| Path | App key | Nav |
|------|---------|-----|
| `/practice/code` | `practice-code` | Learning → **Code Workbench** |

SQL practice: `/practice/sql` — see `src/features/sql-practice/` (Issue #30).

## Supported MVP modes

| Language | Status | Engine |
|----------|--------|--------|
| Python | Active | **Pyodide** (browser WASM) |
| JavaScript | Active | **Backend sandbox** (`sandbox.execute`) |
| React | Active | **Sandpack** live preview |
| Java | Coming soon | Judge0 scaffold only |
| C | Coming soon | Judge0 scaffold only |
| C++ | Coming soon | Judge0 scaffold only |

## Execution engines

- **Python** — `python/pyodideRunner.ts` + safety (`pythonSafetyValidator.ts`) + feedback (`pythonFeedback.ts`). Does **not** call backend for Run/Submit in this workbench.
- **JavaScript** — existing `sandboxInstance` backend + safety (`javascriptSafetyValidator.ts`) + feedback (`javascriptFeedback.ts`).
- **React** — `@codesandbox/sandpack-react` via `LivePreviewPanel` / `sandpackReact.ts`. Run/Submit are preview-guidance + preview-check only; **no backend**, no JSX execution server-side.
- **Java/C/C++** — `judge0/` types and placeholder client; **no execution** until backend Judge0 adapter is deployed.

## What is intentionally not included

- SQL (Issue #30 — separate track)
- AI/LLM hints or code generation
- Judge0 live execution
- Paid model/API usage
- Hidden test cases for compiled languages (future)
## Module layout

```
src/features/code-practice/
├── components/     # Workbench UI (page, panels, toolbar)
├── data/           # Questions and starter templates
├── javascript/     # JS safety + feedback
├── judge0/         # Judge0 architecture (Phase 9, not enabled)
├── python/         # Pyodide runner, safety, feedback
├── types/          # Shared types incl. CodePracticeFeedback
└── utils/          # Mistakes, comparators, timers, adapters
```

## Mistake tracking

- Storage key: `codequest-code-practice-mistakes` (localStorage)
- Separate from legacy `codequest-practice-mistakes`
- Records Run/Submit failures, safety blocks, and failed test cases
- **Old Mistakes** panel supports retry, clear item, clear all, repeated-mistake summary

## Phase history (Issue #29 branch)

| Phase | Focus |
|-------|-------|
| 0 | CodeEditor controlled prop; SQL boundary freeze |
| 1 | Workbench shell + sample questions |
| 2 | Execution wiring, test cases, theme |
| 3 / 3.1 | Sandpack React preview; Run/Submit boundary |
| 4 / 4.1 | Pyodide Python; Run path fix |
| 5 | Python safety + output truncation |
| 6 | Python beginner feedback |
| 7 | Mistake tracking + Old Mistakes panel |
| 8 | JavaScript safety + feedback |
| 9 | Judge0 architecture scaffold |
| 10 | Final cleanup + PR readiness |

## Future work

- Deploy Judge0 + backend adapter (`POST /api/code/judge0/*`) — see `judge0/judge0Readme.md`
- Enable Java/C/C++ Run/Submit after language IDs verified
- React Sandpack compile-error → mistake tracking
- Optional: worker timeout for Pyodide; browser JS runner (not planned in #29 MVP)
- Issue #30: SQL Practice Ground (do not add SQL here)

## Issue #30 SQL separation

SQL practice lives at `/practice/sql` in `src/features/sql-practice/`. This module must not add SQL tabs, schema UI, or SQL execution.

## Judge0 note

Frontend must **never** call Judge0 directly or store API keys. Use `submitToJudge0Backend()` stub until a server-side adapter exists.
