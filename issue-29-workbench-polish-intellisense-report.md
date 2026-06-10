# Issue #29 — Workbench Polish & Editor IntelliSense Report

Branch: `issue-29-workbench-polish-intellisense`

## A. Summary

Polished Code Workbench (`/practice/code`) readability and added **offline, rule-based Monaco autocomplete** for Python, JavaScript, and React. No AI/LLM, no backend calls for suggestions, no execution changes.

## B. UI readability changes

- Editor default **16px / 26px** line height (Small 14px, Large 18px presets)
- Stronger **Run** / **Submit** buttons (brighter fill + ring)
- Active language tab: ring + slight scale
- Hints, mistakes, and attempt history panels improved for scanning
- Shared `workbench-theme` card line-height tweak

## C. Monaco autocomplete changes

- New module: `src/features/code-practice/editor-intelligence/`
- `CodeEditor` optional props: `enablePracticeSuggestions`, `practiceLanguage`
- Registers Monaco `CompletionItemProvider` on mount; disposes on unmount/language change
- `quickSuggestions`, `suggestOnTriggerCharacters`, `tabCompletion` enabled when suggestions on
- **Ctrl+Space** works via Monaco defaults

## D. Variable suggestion behavior

| Language | Detection |
|----------|-----------|
| Python | `name =`, `for x in`, `def name(` |
| JavaScript / React | `const/let/var`, `function name(params)`, arrow functions |

Context boosts variables after `+`, inside `print(`, or `console.log(`.

## E. Snippet suggestions added

**Python:** print, input, int(input), if, for, while, def, append, range loop

**JavaScript:** console.log, const, let, if, for, function, arrow, map

**React:** functional component, useState, button+onClick, list map, conditional render

Plus keyword lists (useState, useEffect, className, JSX tags, etc.)

## F. Student usability improvements

- **Suggestions enabled** badge on editor header
- **Ctrl+Space** + offline rules note
- **Font size** Small / Medium / Large (persisted in localStorage)
- Hints: prominent **Reveal next hint**, progress labels, no auto-solution
- Mistakes empty state: *"No mistakes yet. Run or submit code to start tracking."*
- Attempt history: language, duration, timestamp, Passed/Saved badge
- Retry button more visible in mistakes list

## G. Files added

```
src/features/code-practice/editor-intelligence/
  codeIntelligence.types.ts
  variableExtractor.ts
  pythonCompletions.ts
  javascriptCompletions.ts
  reactCompletions.ts
  snippetLibrary.ts
  completionProvider.ts
  README.md
issue-29-workbench-polish-intellisense-report.md
```

## H. Files modified

| File | Change |
|------|--------|
| `src/components/CodeEditor.tsx` | Practice completion integration |
| `src/features/code-practice/components/CodeEditorPanel.tsx` | Font presets, suggestions UI |
| `src/features/code-practice/components/PracticeToolbar.tsx` | Run/Submit visibility |
| `src/features/code-practice/components/HintsPanel.tsx` | Reveal UX |
| `src/features/code-practice/components/OldMistakesPanel.tsx` | Empty state, retry button |
| `src/features/code-practice/components/AttemptHistoryPanel.tsx` | Richer attempt rows |
| `src/lib/workbench-theme.ts` | Minor contrast tweaks |

## I. Intentionally not changed

- Execution engines (Pyodide, JS sandbox, Sandpack)
- Judge0 (disabled)
- SQL execution / Issue #30 full workbench
- Backend `execute.py`
- DB attempt storage (localStorage only)
- AI/LLM / paid APIs

## J. Build result

```
npm run build → PASS
eslint src/features/code-practice → PASS (0 errors)
eslint src/components/CodeEditor.tsx → PASS
```

## K. Smoke test result

| Check | Result |
|-------|--------|
| Build | Pass |
| Suggestions module wired | Pass (Code Workbench only) |
| Manual autocomplete | Verify locally (Ctrl+Space, print pri, variables after +) |
| Python/JS/React run paths | Unchanged (no logic edits) |

## L. Risks / next steps

1. Variable extraction is regex-based — complex scopes may miss names (acceptable for beginner MVP).
2. React shares Monaco `javascript` language ID — `practiceLanguage` prop distinguishes React snippets.
3. Future: optional unit tests for `variableExtractor.ts`.
4. Future: DB-backed attempt history (out of scope for this branch).

---

*Do not merge without manual smoke test on `/practice/code`.*
