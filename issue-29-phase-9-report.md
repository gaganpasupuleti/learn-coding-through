# Phase 9 Report — Issue #29

## A. Summary

Prepared **Judge0 integration architecture** for Java, C, and C++ without enabling execution. Added types, language map (IDs TODO), placeholder client stub, and planning docs. Python, JavaScript, React, and coming-soon compiled languages behave unchanged. No frontend Judge0 calls, API keys, or secrets.

## B. Files created

- `src/features/code-practice/judge0/judge0Types.ts`
- `src/features/code-practice/judge0/judge0LanguageMap.ts`
- `src/features/code-practice/judge0/judge0Client.ts`
- `src/features/code-practice/judge0/judge0Readme.md`
- `issue-29-phase-9-report.md`

## C. Files modified

- `src/features/code-practice/components/CodePracticePage.tsx` — coming-soon toast copy only
- `src/features/code-practice/components/LanguageSelector.tsx` — tooltip copy only

## D. Judge0 architecture added

| Module | Purpose |
|--------|---------|
| `judge0Types.ts` | `Judge0LanguageKey`, `Judge0SubmissionRequest`, `Judge0SubmissionResult`, `Judge0Status` |
| `judge0LanguageMap.ts` | Java/C/C++ config; `judge0LanguageId: null` until deployment verified |
| `judge0Client.ts` | `submitToJudge0Backend()` throws; `isJudge0BackendEnabled()` → `false` |
| `judge0Readme.md` | Purpose, boundaries, backend plan, rollout, Railway caution |

## E. Why execution was not enabled

- Judge0 requires separate infrastructure (workers, DB, Redis, resource limits).
- Untrusted compile/run code must not execute in browser or main app backend.
- Language IDs and deployment must be validated on a real Judge0 instance first.
- Phase 9 scope is **architecture only** per Issue #29 plan.

## F. Frontend/backend boundary

- **Frontend:** must call future `POST /api/code/judge0/*` on our backend.
- **Frontend:** must NOT call Judge0 URLs or hold API keys.
- **Phase 9 client:** `submitToJudge0Backend()` throws `JUDGE0_NOT_ENABLED_MESSAGE`.
- Not wired into `CodePracticePage` Run/Submit — no network calls.

## G. Language map status

| Language | Monaco | Judge0 ID |
|----------|--------|-----------|
| Java | `java` | `null` (TODO) |
| C | `c` | `null` (TODO) |
| C++ | `cpp` | `null` (TODO) |

Comments reference common CE examples (62/50/54) as **unconfirmed** placeholders.

## H. Future backend endpoint plan

Documented in `judge0Readme.md`:

- `POST /api/code/judge0/execute` — single run + stdin
- `POST /api/code/judge0/submit` — test cases (hidden cases later)

Not implemented in Phase 9.

## I. Railway/deployment caution

- Judge0 is memory/CPU heavy; hobby Railway tiers may OOM under compile load.
- Requires queue monitoring, autoscaling or dedicated VM, strict per-submission limits.
- Wrong language IDs cause misleading compile errors — verify `/languages` per environment.

## J. Python regression check

- Pyodide Run/Submit unchanged.
- Python safety, feedback, mistakes unchanged.
- No Judge0 imports in Python path.

## K. JavaScript regression check

- Backend `sandbox.execute` unchanged.
- JS safety, feedback, mistakes unchanged.

## L. React/Sandpack regression check

- Sandpack preview unchanged.
- React Run/Submit does not call backend or Judge0.

## M. Java/C/C++ coming-soon check

- `status: 'coming-soon'` unchanged in `codePractice.types.ts`.
- Toasts/tooltips now mention **Judge0-backed service**.
- Buttons remain non-runnable; no `submitToJudge0Backend` calls.

## N. SQL boundary check

- No SQL in Issue #29 module.
- Legacy SQL hub not modified.

## O. AI/token check

- No AI, LLM, paid APIs, API keys, or secrets added.

## P. Build/lint result

- `npm run build`: **passed** (exit code 0, built in ~3m 14s)
- New files: types/docs only; no runtime wiring

## Q. Manual test steps

1. `/practice/code` → Python Hello World (Pyodide)
2. JavaScript `console.log("Hello")` (backend)
3. React Sandpack preview
4. Click Java / C / C++ → coming-soon toast, no execution
5. DevTools Network → no Judge0 requests
6. SQL absent from Issue #29; legacy hub intact
7. `npm run build`

## R. Risks before Phase 10

- Language IDs still null — must be filled before any live integration.
- Backend adapter, auth, rate limits, and output sanitization still required.
- Judge0 hosting cost/complexity (Railway vs VM) undecided.
- Enabling Run without limits could overload shared infrastructure.
- Hidden test cases and memory/time enforcement belong in backend Phase 10+.
