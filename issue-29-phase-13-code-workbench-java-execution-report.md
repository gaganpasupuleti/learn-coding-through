# Issue #29 — Phase 13: Code Workbench Java Execution Report

## A. Summary

Phase 13 enables Java practice execution in Code Workbench by wiring the existing native backend executor (`javac` + `java`) into `/practice/code`. The Java tab is now active with starter code, three beginner questions, rule-based feedback, localStorage mistake tracking, and a graceful fallback when the backend JDK is unavailable. Python (Pyodide), JavaScript (backend), React (Sandpack), and SQL Practice were not changed.

## B. Current Java audit findings

| Finding | Detail |
|---------|--------|
| Backend executor | Already implemented in `backend/executors/java_executor.py` via `POST /api/v1/execute` |
| Frontend client | `sandbox.execute(code, 'java')` existed but was unused by workbench |
| Workbench gate | Java was `coming-soon` with Judge0 toast — no crash on tab click, but not runnable |
| Judge0 scaffold | Present but disabled; Phase 13 uses native executor (faster, already tested) |
| Java stdin | Backend does not support stdin — Java questions use hardcoded variables like JS drills |
| Runtime probe | `/health/capabilities` exposes `java.ready` for frontend fallback |
| Crash risk | Enabling Java without questions/runtime check could confuse users; addressed with questions + fallback |

## C. Files added

| File | Purpose |
|------|---------|
| `src/features/code-practice/java/javaFeedback.ts` | Rule-based pre-run and runtime Java feedback |
| `src/features/code-practice/java/javaSafetyValidator.ts` | Client-side safety blocks before backend run |
| `src/features/code-practice/java/javaRuntime.ts` | Probes `/health/capabilities` for JDK readiness |
| `src/features/code-practice/java/javaFeedback.test.ts` | Vitest unit tests (6) |
| `backend/tests/test_java_executor.py` | Focused Java executor tests (6) |
| `issue-29-phase-13-code-workbench-java-execution-report.md` | This report |

## D. Files modified

| File | Change |
|------|--------|
| `src/features/code-practice/types/codePractice.types.ts` | Java `status: 'active'` |
| `src/features/code-practice/data/starterTemplates.ts` | `Main` class + `Hello, Java!` starter |
| `src/features/code-practice/data/codeQuestions.ts` | 3 Java questions (hello, add, even/odd) |
| `src/features/code-practice/components/CodePracticePage.tsx` | Java run/submit, feedback, mistakes, runtime fallback |
| `src/features/code-practice/components/LanguageSelector.tsx` | Java tab tooltip |
| `src/features/code-practice/components/ProblemPanel.tsx` | Empty-state copy mentions Java |
| `src/features/code-practice/utils/codePracticeMistakes.ts` | `recordJava*` helpers |
| `src/lib/api.ts` | `fetchHealthCapabilities()` export |
| `scripts/code-workbench-smoke.mjs` | Java tab run or unavailable message check |

## E. Java execution behavior

When backend JDK is ready:

1. User selects **Java** tab → loads `Print Hello World` question + `Main` starter
2. **Run** / **Submit** → pre-run feedback → safety check → `sandbox.execute(code, 'java')`
3. Backend compiles with `javac`, runs `java Main` in temp dir with timeout
4. stdout shown in Output panel; mistakes saved to localStorage on failure
5. Beginner feedback from `javaFeedback.ts` (compile/runtime/timeout hints)

## F. Java unavailable fallback behavior

When `/health/capabilities` reports `java.ready: false` or execute returns `runtime_unavailable`:

- Output panel shows: **"Java execution is not available in this environment yet. Backend Java runtime/JDK is required."**
- Run does not crash; user sees clear message + toast
- No fake success; mistakes recorded with `runtime-unavailable` feedback

## G. Java feedback rules

| Rule | Trigger |
|------|---------|
| `missing-public-class` | No `public class Main` |
| `class-name-mismatch` | Class not named `Main` |
| `missing-main-method` | No `public static void main` |
| `python-style-print` / `javascript-style-console` | Wrong print API |
| `missing-semicolon` | Statement may need `;` |
| `compile-missing-semicolon` | javac expected `;` |
| `runtime-timeout` | Infinite loop / timeout |
| `runtime-unavailable` | Missing JDK on backend |

No AI/LLM.

## H. Safety confirmation

| Constraint | Status |
|------------|--------|
| SQL Practice unchanged | Confirmed |
| sql.js unchanged | Confirmed |
| SQL questions unchanged | Confirmed |
| No production DB | Confirmed |
| No AI/LLM / paid APIs | Confirmed |
| C/C++ still coming soon | Confirmed |
| React Sandpack unchanged | Confirmed |
| Python Pyodide unchanged | Confirmed |
| JavaScript runner unchanged | Confirmed |
| Backend Java executor hardened only via tests (no logic change) | Confirmed |

## I. Tests added

**Frontend:** `javaFeedback.test.ts` — 6 tests passed

**Backend:** `test_java_executor.py` — 6 tests passed

- Hello World stdout
- Arithmetic stdout
- Compile error structured
- Timeout handled
- Missing public class validation
- Missing JDK → `runtime_unavailable` (mocked)

**Existing:** `test_sandbox_smoke.py` — 13 tests passed (unchanged Java coverage)

## J. What was intentionally not changed

- `backend/executors/java_executor.py` execution logic
- `backend/executors/javascript_executor.py`
- SQL Practice Ground (`src/features/sql-practice/**`)
- Judge0 scaffold (still disabled)
- C/C++ tabs (still coming soon)
- React Sandpack preview flow
- Python Pyodide runner

## K. Build result

```
npm run build
✓ built successfully
```

## L. Frontend lint result

```
npx eslint src/features/code-practice
Exit code: 0
```

## M. Backend test result

```
python -m unittest backend/tests/test_java_executor.py -v
Ran 6 tests — OK

python -m unittest backend/tests/test_sandbox_smoke.py -v
Ran 13 tests — OK
```

## N. Typecheck result

`npx tsc --noEmit` reports pre-existing unrelated errors (career-mapper, code-practice `undefined` types, sql-practice, monaco `ITextModel`, etc.). Not introduced by Phase 13. Build uses `tsc -b --noCheck`.

## O. Manual smoke result

Automated browser smoke not run in this session (requires dev servers). Use:

1. `/practice/code` — Python, JS, React still work
2. Java tab — loads questions, Run Hello World or shows unavailable message
3. Java compile error — useful feedback
4. C/C++ — still coming soon toast
5. `/practice/sql` — unchanged

`scripts/code-workbench-smoke.mjs` updated for Java run path.

## P. Risks / limitations

- Java has **no stdin** in backend — questions use in-code variables (same pattern as JS add-two)
- Railway memory: Java compile still uses `RLIMIT_AS` 384MB (unlike JS OOM hotfix)
- Runtime probe caches capabilities response — may be stale until tab switch refresh
- Judge0 docs in older reports still mention Java deferral — native path is now canonical for workbench

## Q. Phase 14 recommendation

1. **Merge Phase 13** after review + manual smoke with backend running
2. **Optional:** Java stdin support in `java_executor.py` for input-based drills
3. **Optional:** Java Monaco completions (mirror Python/JS editor-intelligence)
4. **Phase 14+:** C/C++ via Judge0 or native executors (separate phase)
5. **CI:** Add `test_java_executor.py` to backend PR checks when executor changes
