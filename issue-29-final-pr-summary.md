# Issue #29 — Final PR Summary

## A. Overview

Rebuilds the **Code Practice Ground** as a multi-language workbench at `/practice/code` with Python (Pyodide), JavaScript (backend sandbox), React (Sandpack), safety validators, rule-based beginner feedback, and local mistake tracking — **without AI tokens or SQL**.

## B. What changed

- New feature module: `src/features/code-practice/`
- Route + nav: Learning → **Code Workbench** (`practice-code`)
- Legacy **Practice Hub (Legacy)** retained (includes SQL for Issue #30)
- `CodeEditor` controlled `code` prop fix (Phase 0)
- 10 phased commits on branch `issue-29-code-practice-rebuild`

## C. Files/modules added

**Core**

- `src/features/code-practice/components/*` — workbench layout, panels, page
- `src/features/code-practice/data/*` — questions, starters
- `src/features/code-practice/types/codePractice.types.ts`

**Python**

- `python/pyodideRunner.ts`, `pythonSafetyValidator.ts`, `pythonFeedback.ts`

**JavaScript**

- `javascript/javascriptSafetyValidator.ts`, `javascriptFeedback.ts`

**React**

- `utils/sandpackReact.ts`, `LivePreviewPanel.tsx`

**Mistakes & utils**

- `utils/codePracticeMistakes.ts`, `feedbackDisplay.ts`, `executionAdapter.ts`, etc.

**Judge0 (scaffold only)**

- `judge0/judge0Types.ts`, `judge0LanguageMap.ts`, `judge0Client.ts`, `judge0Readme.md`

**Docs**

- `src/features/code-practice/README.md`
- `issue-29-phase-0-report.md` … `issue-29-phase-10-report.md`

## D. Execution behavior by language

| Language | Run | Submit |
|----------|-----|--------|
| Python | Pyodide + stdin | Pyodide per test case |
| JavaScript | Backend sandbox | Backend per test case |
| React | Sandpack guidance | Preview-check only |
| Java/C/C++ | Coming soon toast | Coming soon toast |
| SQL | **Not in module** | **Not in module** |

## E. Safety/feedback behavior

- **Python:** pre-run safety (infinite loops, large range, dangerous imports) + static feedback + runtime `explainPythonError`
- **JavaScript:** pre-run safety (infinite loops, fetch, storage, eval) + static feedback + runtime `explainJavaScriptError`
- **React:** no backend safety layer; Sandpack handles preview
- Warnings treated as blocked where no confirmation UI exists

## F. Mistake tracking behavior

- LocalStorage: `codequest-code-practice-mistakes`
- Types: safety-block, prerun-block, runtime, failed-test-case
- Old Mistakes panel: retry (loads language/question/code/input), clear item, clear all, top repeated insight
- Legacy `practice-mistakes.ts` unchanged

## G. Dependencies added

- `@codesandbox/sandpack-react` — React live preview
- `pyodide` — browser Python execution (CDN WASM on first run)

## H. What was intentionally not included

- SQL practice (Issue #30)
- AI/LLM features or paid APIs
- Judge0 live execution or API keys
- Java/C/C++ compiler runs
- Legacy hub removal
- Hidden test cases for compiled languages

## I. SQL boundary confirmation

- No SQL in `src/features/code-practice/`
- Boundary comments in types, OldMistakesPanel, legacy practice-ground types
- `PracticePage` SQL tab unchanged

## J. AI/token confirmation

- No OpenAI, Anthropic, or other LLM integration
- Feedback is rule-based static analysis only
- Pyodide loads from CDN (no paid inference)

## K. Manual QA checklist

**Navigation**

- [ ] Learning → Code Workbench loads `/practice/code`

**Python**

- [ ] Hello World via Pyodide
- [ ] Add Two Numbers + stdin
- [ ] Submit passes sample cases
- [ ] `while True` blocked
- [ ] `pritn("Hello")` friendly feedback + mistake saved
- [ ] Retry from Old Mistakes

**JavaScript**

- [ ] `console.log("Hello")` via backend
- [ ] `consle.log` feedback
- [ ] `while(true)` blocked
- [ ] Wrong submit → failed-test-case mistake
- [ ] Retry works

**React**

- [ ] Create a Button — Sandpack preview
- [ ] Edit updates preview
- [ ] Run/Submit no backend calls

**Java/C/C++**

- [ ] Coming-soon Judge0 message; no execution

**SQL**

- [ ] No SQL on `/practice/code`
- [ ] Legacy hub SQL still present

## L. Known limitations

- Java/C/C++ not enabled; Judge0 needs separate deployment/backend work
- Pyodide is beginner browser execution — not full security; no worker timeout yet
- JavaScript still uses existing backend sandbox (not in-browser worker)
- React Submit is preview-check only — no DOM assertion
- Sandpack compile errors not saved as mistakes yet
- Repo `npm run lint` has many **pre-existing** errors outside this module
- Judge0 language IDs are `null` until deployment verified

## M. Recommended next issues after merge

1. **Judge0 deployment + backend adapter** — enable Java/C/C++
2. **Issue #30** — SQL Practice Ground (separate from this module)
3. **React mistake tracking** — wire Sandpack errors to mistake store
4. **Pyodide hardening** — worker timeout / stronger isolation (optional)
5. **Legacy hub migration** — gradually move users to Code Workbench
