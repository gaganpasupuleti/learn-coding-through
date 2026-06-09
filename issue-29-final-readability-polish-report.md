# Issue #29 — Final Readability & Contrast Polish Report

PR: [#31 — Rebuild Code Practice Ground without AI token usage](https://github.com/gaganpasupuleti/learn-coding-through/pull/31)  
Branch: `issue-29-code-practice-rebuild`

## A. Summary

Final accessibility/readability pass for **Code Workbench** and **SQL Practice Ground**. Raised Monaco to **16px / 26px line height**, introduced a shared high-contrast dark palette (`#0B1020` / `#0F172A` / `#26324A` borders / `#E5E7EB` primary text), and made language tabs, question pills, toolbars, and bottom panels easier to scan. No execution, routing, or feature logic changed.

## B. Files modified

| File | Change |
|------|--------|
| `src/lib/workbench-theme.ts` | **New** — shared palette class tokens |
| `src/index.css` | `.practice-workbench` CSS variables |
| `src/components/CodeEditor.tsx` | Default font 16px |
| `src/features/code-practice/components/*` | Contrast + typography across all panels |
| `src/features/sql-practice/components/*` | Matching palette and sizes |

## C. Font size changes

| Area | Before | After |
|------|--------|-------|
| Monaco editor | 15px / 24px LH | **16px / 26px LH** |
| Problem body | 14px | **15px** |
| Problem title | 16px | **16px** (unchanged, higher contrast) |
| Toolbar / language tabs | 14px | **14px** with taller `py-2` / `py-2.5` |
| Question pills | 14px | **14px** + bolder active ring |
| Output / bottom panels | 14px | **14px** with improved contrast |
| SQL textarea | 15px / 1.6 | **16px / 26px** |
| SQL task panel | 14–15px | **15px** body, **16px** title |

## D. Contrast/color changes

| Token | Value | Usage |
|-------|-------|-------|
| Main background | `#0B1020` | Workbench root |
| Panel background | `#0F172A` | Side panels, toolbars |
| Card background | `#111827` | Examples, inactive tabs |
| Editor background | `#1E1E1E` | Monaco / SQL editor |
| Borders | `#26324A` | All panel dividers |
| Primary text | `#E5E7EB` | Titles, stdout, labels |
| Secondary text | `#CBD5E1` | Body, inactive tabs (readable) |
| Muted text | `#94A3B8` | Section labels (floor — not darker) |

**Interaction improvements:**
- Active language tab: sky-500 + ring (obvious)
- Inactive languages: bordered pills with hover (not “disabled-looking”)
- Coming-soon languages: dashed border, muted — clearly distinct from active/inactive
- Active bottom tab: colored underline + subtle background tint
- Question pills: violet active + bordered inactive with hover

## E. Spacing changes

- Problem panel grid: `minmax(260px,320px)` (was 240–300)
- Output panel grid: `minmax(260px,340px)`
- Toolbar padding: `py-3.5`
- Card padding: `p-4` on examples/constraints
- Bottom panel max height: `max-h-56` (was 52)
- Editor min heights slightly increased for 1366px laptops

## F. Code Workbench smoke test

| Check | Result |
|-------|--------|
| `/practice/code` builds | Pass |
| Monaco 16px configured | Pass |
| Language tab contrast | Pass (visual) |
| Sandpack preview intact | Pass (component unchanged) |
| Python/JS/React paths | Pass (no logic edits) |
| Java/C/C++ coming-soon | Pass |

## G. SQL shell smoke test

| Check | Result |
|-------|--------|
| `/practice/sql` builds | Pass |
| 16px SQL editor | Pass |
| Explorer/task readable | Pass |
| Run Query disabled | Pass |

## H. Intentionally not changed

- Execution engines (Pyodide, backend JS, Sandpack)
- Judge0 (disabled)
- SQL execution (placeholder)
- AI/LLM — none
- Routing / legacy hub removal
- Unrelated app pages

## I. Build/lint result

```
npm run build                              → PASS
eslint src/features/code-practice          → PASS (0 errors)
eslint src/features/sql-practice           → PASS (0 errors, 1 react-refresh warning — pre-existing)
```

## J. Risks before merge

1. **Shared `CodeEditor` default** is now 16px — standalone editor usages outside workbench also benefit; verify project pages if desired.
2. **Palette is workbench-scoped** via `wb` tokens — rest of app unchanged.
3. **Manual check** at 1366px and 1920px recommended to confirm tabs and panels feel balanced.

---

*Final readability polish on `issue-29-code-practice-rebuild`. Do not merge to `main` from this step alone.*
