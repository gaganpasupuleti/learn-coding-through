# Code Quest Frontend Sandbox — Integration Guide

This folder is the **brick-by-brick frontend rebuild** workspace, copied from the local Code Quest kit.

## Why this exists

The main app (`src/` at repo root) has working features (SQL workbench, code practice, auth, admin) but a **different visual system**. This sandbox adopts the **approved Code Quest theme** locked in `static/progress/index.html`.

**Strategy:** rebuild student UI here page by page, approve each brick, then wire into the main `StudentShell` — not a big-bang redesign.

## Approved baseline (do not redesign)

| Asset | Path |
|-------|------|
| Locked progress dashboard | `codequest-frontend-kit/static/progress/index.html` |
| Theme tokens | `codequest-frontend-kit/tailwind.config.js` |
| Shared shell + CQ components | `codequest-frontend-kit/src/components/` |

## Run the sandbox locally

```bash
cd codequest-frontend-kit
npm install
npm run dev
```

| URL | Status |
|-----|--------|
| `/progress` | **Locked baseline** (static HTML) |
| `/dashboard` | **Approved** — first React brick |
| `/classes`, `/assignments`, `/materials`, `/practice-studio` | WIP — to be redone to match dashboard quality |

## Brick-by-brick plan

1. **Done** — Theme + shell + `/dashboard`
2. **Redo** — Classes, Assignments, Materials, Practice Studio (match dashboard + progress)
3. **Next** — Resume Lab, Settings, tool pages (Python Lab, SQL Studio, …)
4. **Merge** — Port approved components into root `src/components/codequest/` and replace `StudentShell` chrome
5. **Wire** — Connect existing practice engines (`src/features/sql-practice`, `code-practice`, …) inside new shells

## Mapping to main repo

| Sandbox route | Main repo equivalent |
|---------------|---------------------|
| `/progress` | `StudentProgressPage` |
| `/dashboard` | `StudentDashboardPage` / `LandingPageV2` |
| `/classes` | `StudentCalendarPage` |
| `/practice-studio` | Practice feature hub |
| `/sql-studio` | `src/features/sql-practice` |
| `/python-lab` | `src/features/code-practice` |
| `/resume-lab` | `ResumeBuilderPage` |

## Rules

- No emojis, no lorem ipsum
- Warm cream `#FAF3E0`, navy sidebar `#0A1020`, pastel cards
- Playfair headings, Inter body, JetBrains Mono for code only
- Do not redesign `static/progress/index.html` structure without approval
