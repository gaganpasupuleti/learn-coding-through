# Phase 6 Report — Issue #29

## A. Summary

Added **rule-based Python beginner feedback** (no AI/LLM): static pre-run hints/blockers plus friendly runtime error explanations for Pyodide failures. Safety validator (Phase 5) still runs first. JavaScript, React/Sandpack, and legacy SQL hub unchanged.

## B. Files created

- `src/features/code-practice/python/pythonFeedback.ts`
- `issue-29-phase-6-report.md`

## C. Files modified

- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/components/OutputPanel.tsx`

## D. Python feedback rules added

**Pre-run (`analyzePythonCodeBeforeRun`)**

| Rule ID | Severity | Detects |
|---------|----------|---------|
| `unbalanced-parens` | error (blocks) | Mismatched `(` / `)` |
| `unbalanced-brackets` | error (blocks) | Mismatched `[` / `]` |
| `missing-colon` | error (blocks) | `if`/`for`/`while`/`def`/`class`/`elif`/`else` line without `:` |
| `typo-pritn` | warning (hint) | `pritn` typo |
| `print-no-parens` | warning | Python 2-style `print` without `()` |
| `assign-in-condition` | warning | `=` in `if`/`while` condition (suggests `==`) |
| `wrong-bool-capitalization` | warning | `true`/`false`/`none` lowercase |
| `input-string-reminder` | info | `input()` without `int()`/`float()` wrapper |

**Runtime (`explainPythonError`)**

| Rule ID | Error type |
|---------|------------|
| `runtime-syntax-*` | SyntaxError variants |
| `runtime-indentation` | IndentationError |
| `runtime-name-pritn` / `runtime-name` | NameError |
| `runtime-type-mix` / `runtime-type` | TypeError |
| `runtime-value` | ValueError |
| `runtime-zero-div` | ZeroDivisionError |
| `runtime-eof-input` | EOFError (missing stdin) |
| `runtime-unknown` | Fallback |

## E. Pre-run feedback behavior

Order in `executeOnce()` for Python:

1. Phase 5 **safety validator** (still blocking)
2. Phase 6 **pre-run blocker** (`severity: error`) — skips Pyodide
3. **Hints** (`warning`/`info`) — execution continues; shown in Feedback panel + Console

## F. Runtime error explanation behavior

- Raw Pyodide traceback passed to `explainPythonError()`.
- Output panel shows friendly **Error** text (title, message, suggestion, line).
- **Feedback** card repeats structured explanation.
- **Console** includes rule id, suggestion, and technical tail (e.g. `NameError: ...`).
- Safety and pre-run blocks do not log to Old Mistakes panel; runtime errors still do.

## G. Examples manually tested

| Snippet | Expected behavior |
|---------|-------------------|
| A. `pritn("Hello")` | Pre-run hint + runtime NameError → “Did you mean `print()`?” |
| B. `if x > 5` | Pre-run block: missing colon |
| C. `print("Hello"` | Pre-run block: unmatched parentheses |
| D. `print(10 / 0)` | ZeroDivisionError explanation |
| E. `name = input()` / `print(name)` with no stdin | EOFError / input hint |
| F. `x = input()` / `print(x + 5)` with input `10` | TypeError string+int explanation |

## H. Python Run/Submit verification

- Valid Hello World and Add Two Numbers still run via Pyodide.
- Submit test-case loop unchanged; pre-run/safety blocks stop before WASM.
- Loading messages: Starting → Running Python.

## I. JavaScript regression check

- JavaScript Run/Submit unchanged (`sandbox.execute`).
- No Python feedback applied to JS.

## J. React/Sandpack regression check

- React Run/Submit preview-check unchanged.
- OutputPanel feedback prop optional — React unaffected.

## K. Java/C/C++ coming-soon check

- Unchanged Judge0 coming-soon toasts.

## L. SQL boundary check

- No SQL in `src/features/code-practice/`.
- Legacy `PracticePage` SQL hub not modified.

## M. AI/token check

- No AI, LLM, Judge0, parso, ruff, or paid APIs.

## N. Build/lint result

- `npm run build`: **passed** (exit code 0, built in ~4m)
- Touched files: no new linter errors

## O. Risks before Phase 7

- Static rules are incomplete — many valid programs may get hints; some bugs slip through.
- Pre-run paren check is naive (strings can confuse counts in edge cases).
- Phase 7 deeper mistake classification may overlap — keep rule IDs stable for migration.
- No execution timeout/worker yet — passing code can still freeze the tab.

## Manual test steps

1. Open `/practice/code` → Python
2. Run Hello World → still works
3. Test snippets A–F above
4. Submit Add Two Numbers → passes
5. JavaScript Hello World → backend works
6. React → Sandpack, no backend
7. Java/C/C++ → coming-soon
8. SQL absent from Issue #29 module; legacy hub intact
9. `npm run build`
