# Code Quest Frontend Sandbox — Integration Guide

Isolated workspace under `codequest-frontend-kit/` for the approved Code Quest theme rebuild.

## This PR scope (dashboard only)

| Route | Status |
|-------|--------|
| `/progress` | Locked baseline — `static/progress/index.html` |
| `/dashboard` | **Approved** — first React brick |
| All other routes | Future PRs |

## Run locally

```bash
cd codequest-frontend-kit
npm install
npm run dev
```

## Brick-by-brick plan (after merge)

1. **Merged** — Theme + shell + `/dashboard`
2. **Next** — Redo one page at a time (Classes, Assignments, …) matching dashboard quality
3. **Later** — Port into root `StudentShell` and wire SQL/code practice engines

## Mapping to main repo

| Sandbox | Main repo |
|---------|-----------|
| `/progress` | `StudentProgressPage` |
| `/dashboard` | `StudentDashboardPage` |
| `/sql-studio` | `src/features/sql-practice` |
| `/python-lab` | `src/features/code-practice` |

## Rules

- Do not redesign `static/progress/index.html` without approval
- Warm cream `#FAF3E0`, navy sidebar, pastel cards, Playfair + Inter
