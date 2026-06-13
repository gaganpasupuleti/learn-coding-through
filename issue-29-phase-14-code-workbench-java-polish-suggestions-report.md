# Issue #29 — Phase 14: Code Workbench Java Polish & Suggestions Report

## A. Summary

Phase 14 adds offline Monaco suggestions and snippets for Java in Code Workbench, polishes rule-based Java feedback, adds three beginner Java questions (6 total), and improves JDK-unavailable messaging. No backend execution, SQL Practice, or other language runners were changed.

## B. Files added

| File | Purpose |
|------|---------|
| `src/features/code-practice/editor-intelligence/javaCompletions.ts` | Java keyword completions |
| `src/features/code-practice/editor-intelligence/javaCompletions.test.ts` | Suggestion/variable tests |
| `src/features/code-practice/data/codeQuestions.test.ts` | Java question metadata tests |
| `issue-29-phase-14-code-workbench-java-polish-suggestions-report.md` | This report |

## C. Files modified

| File | Change |
|------|--------|
| `editor-intelligence/codeIntelligence.types.ts` | Added `java` to intelligence languages |
| `editor-intelligence/completionProvider.ts` | Java provider registration |
| `editor-intelligence/snippetLibrary.ts` | Nine Java snippets |
| `editor-intelligence/variableExtractor.ts` | Java variables + println context |
| `editor-intelligence/README.md` | Java row in scope table |
| `components/CodeEditorPanel.tsx` | Suggestions badge for Java |
| `java/javaFeedback.ts` | Feedback polish + JDK copy |
| `java/javaFeedback.test.ts` | Four new feedback tests |
| `data/codeQuestions.ts` | Three new Java questions |

## D. Java suggestions added

Offline keywords include: `public class Main`, `main(String[] args)`, `System.out.println/print`, control flow, primitives, `String`, `ArrayList`, `Math.max/min/pow`, `Integer.parseInt`, `Scanner` (with stdin note), comments.

Monaco provider triggers on `.`, `(`, space, operators — same pattern as Python/JS.

## E. Java snippets added

1. main class  
2. print line (`sys` filterText)  
3. if else  
4. for loop  
5. while loop  
6. method  
7. array loop (enhanced for)  
8. even odd  
9. sum two numbers  

All use class name `Main`; no packages; no stdin-heavy examples.

## F. Java feedback polish

| Rule | Purpose |
|------|---------|
| `main-missing-void` | `public static main` without `void` |
| `lowercase-string-args` | `string[]` → `String[]` |
| `lowercase-system-out` | `system.out` typo |
| `scanner-stdin-unsupported` | Scanner / stdin warning |
| `unbalanced-braces` | Simple `{` / `}` count hint |
| Runtime unavailable | Clear OpenJDK + restart backend message |

## G. Java question additions

Added (6 Java questions total):

| ID | Title |
|----|-------|
| `java-max-two` | Max of Two Numbers |
| `java-print-one-to-five` | Print Numbers 1 to 5 |
| `java-sum-array` | Sum Array Values |

All use in-code variables; no stdin. Until Java stdin/per-case injection exists, each Java question has **one executable test case** (`java-add-two`, `java-even-odd`, and `java-max-two` trimmed to a single case after PR review).

## H. Safety confirmation

| Constraint | Status |
|------------|--------|
| SQL Practice unchanged | Confirmed |
| sql.js / SQL questions unchanged | Confirmed |
| Backend Java execution unchanged | Confirmed |
| Python / JS / React runners unchanged | Confirmed |
| C/C++ still coming soon | Confirmed |
| No AI/LLM / paid APIs | Confirmed |
| Frontend-only suggestions | Confirmed |

## I. Tests added/updated

```
npx vitest run src/features/code-practice/java/javaFeedback.test.ts
npx vitest run src/features/code-practice/editor-intelligence/javaCompletions.test.ts
npx vitest run src/features/code-practice/data/codeQuestions.test.ts
```

**18 tests passed** (9 feedback + 6 completions + 3 questions metadata)

## J. What was intentionally not changed

- `backend/executors/java_executor.py`
- SQL Practice Ground
- Judge0 scaffold
- C/C++ tabs
- Code Workbench layout
- Pyodide / Sandpack / JS sandbox

## K. Build result

```
npm run build
✓ built successfully
```

## L. Lint result

```
npx eslint src/features/code-practice
Exit code: 0
```

## M. Backend test result

```
python -m unittest backend/tests/test_java_executor.py backend/tests/test_sandbox_smoke.py
Ran 19 tests — OK
```

## N. Typecheck result

`npx tsc --noEmit` not re-run; build uses `tsc -b --noCheck`. Pre-existing unrelated repo errors remain (career-mapper, monaco `ITextModel`, etc.).

## O. Manual smoke result

Not run in this session (dev server was unstable in prior session). Recommended checklist:

1. `/practice/code` — Python, JS, React, Java Run  
2. Java tab — Ctrl+Space after `sys`, `main`, `for`, `if`  
3. Insert snippets — main class, print line  
4. Compile error feedback + mistakes localStorage  
5. C/C++ coming soon; `/practice/sql` opens  

## P. Risks / limitations

- Java suggestions do not include full `java.util` import insertion.
- Scanner appears in keywords but stdin is not supported — feedback warns users.
- Java Submit runs the same source for every case; in-code-variable questions are limited to one executable test case (enforced in `codeQuestions.test.ts`).
- Multi-line Java output questions depend on exact newline matching in Submit.
- Suggestions are prefix-based, not semantic.

## Q. Phase 15 recommendation

1. **Merge Phase 14** after review + quick manual suggestion smoke.
2. **Optional:** Java stdin in backend for input-based drills.
3. **Optional:** `code-intelligence-smoke.mjs` Java checks (sys/main/for).
4. **Phase 15+:** C/C++ via Judge0 or native executors (separate issue).
5. **CI:** Run Java vitest files when `code-practice/**` changes.
