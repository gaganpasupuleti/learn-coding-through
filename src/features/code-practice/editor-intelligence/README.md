# Code Workbench Editor Intelligence

Offline, rule-based Monaco autocomplete for beginner practice — **no AI/LLM**, **no backend**.

## Scope

| Language | Variables | Snippets | Keywords / JSX |
|----------|-----------|----------|----------------|
| Python | Assignments, `for`, `def` | print, input, if, for, while, def, … | builtins |
| JavaScript | const/let/var, functions | console.log, const, if, for, … | JS keywords |
| React | Same as JS | React component, useState, map, … | hooks, JSX tags |
| Java | int/String declarations, loops | main class, println, for, while, … | Java keywords |

## How it works

1. `variableExtractor.ts` scans editor text for declared names.
2. `snippetLibrary.ts` provides tab-stop snippets per language.
3. `completionProvider.ts` registers a Monaco `CompletionItemProvider` when `enablePracticeSuggestions` is on.
4. Context boosts variables after `+`, inside `print(`, or `console.log(`.

## Integration

```tsx
<CodeEditor
  enablePracticeSuggestions
  practiceLanguage="python"
  ...
/>
```

Press **Ctrl+Space** to open suggestions manually.

## Boundaries

- Not enabled outside Code Workbench unless props are passed explicitly.
- C/C++ coming-soon modes do not register providers.
- Java suggestions are offline only — no stdin/Scanner execution in practice backend.
- SQL is Issue #30 — not included here.
