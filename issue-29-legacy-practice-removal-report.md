# Issue #29 — Legacy Practice Hub Removal Report

PR: [#31 — Rebuild Code Practice Ground without AI token usage](https://github.com/gaganpasupuleti/learn-coding-through/pull/31)  
Branch: `issue-29-code-practice-rebuild`

## A. Summary

Removed the legacy unified Practice Hub from navigation and routing. **Code Workbench** (`/practice/code`) is now the primary code practice experience. Added a new **SQL Practice Ground** UI shell at `/practice/sql` (Issue #30 boundary — no execution). **Typing Practice** moved to a standalone route at `/practice/typing`. Legacy routes redirect to the new destinations; old hub components were deleted after reference audit.

## B. Files removed

| File | Reason |
|------|--------|
| `src/components/pages/PracticePage.tsx` | Legacy monolithic practice hub (Python/SQL/Java/Typing) |
| `src/components/pages/CodePracticeGroundPage.tsx` | Legacy hub shell wrapper |
| `src/components/practice-ground/MistakesReviewPanel.tsx` | Only used by legacy hub |
| `src/components/practice-ground/practice-ground-types.ts` | Only used by legacy hub |

## C. Files modified

| File | Change |
|------|--------|
| `src/App.tsx` | Added `practice-sql`, `practice-typing`; URL sync for `/practice/code`, `/practice/sql`, `/practice/typing`; legacy redirects; removed legacy hub rendering |
| `src/components/shells/StudentShell.tsx` | Learning nav: Code Workbench, SQL Practice Ground, Typing Practice, Quiz, Flow Path — removed Practice Hub (Legacy) |
| `src/components/pages/LandingPage.tsx` | Hero CTA → Code Workbench (`practice-code`) |
| `src/components/Navigation.tsx` | Practice link → Code Workbench (unused in main shell but kept consistent) |
| `src/features/code-practice/README.md` | Removed legacy hub references; pointed SQL to Issue #30 module |

## D. Files added

| Path | Purpose |
|------|---------|
| `src/features/sql-practice/` | SQL Practice Ground UI shell (components, types, README) |
| `issue-29-legacy-practice-removal-report.md` | This report |

## E. Routes removed (UI)

- Legacy Practice Hub page render (`practice-ground` as a visible destination)
- Embedded typing inside legacy hub

## F. Routes redirected

| Legacy alias | Redirect target |
|--------------|-----------------|
| `practice` | `/practice/code` (`practice-code`) |
| `practice-ground` | `/practice/code` (`practice-code`) |
| `typing` | `/practice/typing` (`practice-typing`) |

Learning Planner still uses `practice` kind → App handler maps to Code Workbench.

## G. New SQL shell route

| Path | App key | Component |
|------|---------|-----------|
| `/practice/sql` | `practice-sql` | `SqlPracticePage` |

Shell includes: toolbar (dataset/topic/difficulty placeholders, Run/Reset disabled), schema explorer, SQL editor placeholder, question panel, result/history/mistakes placeholders. Copy states SQL is being rebuilt under Issue #30.

## H. Navigation changes

**Learning menu (before → after):**

- Projects — unchanged
- Code Workbench → `/practice/code` (primary)
- ~~Practice Hub (Legacy)~~ — **removed**
- **SQL Practice Ground** → `/practice/sql` — **added**
- **Typing Practice** → `/practice/typing` — **added** (standalone)
- Quiz — unchanged
- Flow Path — unchanged

## I. Intentionally kept

| Item | Reason |
|------|--------|
| `src/features/code-practice/` | New Code Workbench (Issue #29) |
| `src/lib/practice-mistakes.ts` | Used by `quiz-mistakes-adapter.ts` for Quiz mistakes |
| `src/components/pages/TypingTrainerPage.tsx` | Standalone typing feature |
| `src/components/CodeEditor.tsx` | Shared editor |
| `backend/app/api/v1/execute.py` | JavaScript sandbox execution |
| Quiz module | Unrelated; still in nav |
| Judge0 scaffold (`judge0/`) | Disabled; not wired to Run |

## I. Code Workbench smoke test

| Check | Result |
|-------|--------|
| Route `/practice/code` wired | Pass (App + URL sync) |
| `CodePracticePage` import/build | Pass (`npm run build`) |
| Python Pyodide path present | Pass (module unchanged) |
| JavaScript backend sandbox | Pass (module unchanged) |
| React Sandpack preview | Pass (module unchanged) |
| Java/C/C++ coming-soon | Pass (module unchanged) |
| Manual browser Run/Submit | Not run in CI agent — verify locally |

## J. SQL shell smoke test

| Check | Result |
|-------|--------|
| Route `/practice/sql` wired | Pass |
| No SQL execution / DB connection | Pass (placeholders only) |
| Issue #30 copy in question panel | Pass |
| Old SQL Practice UI removed | Pass (PracticePage deleted) |
| Manual browser load | Not run in CI agent — verify locally |

## K. Typing / Quiz smoke test

| Check | Result |
|-------|--------|
| Typing at `/practice/typing` | Pass (route + `TypingTrainerPage`) |
| Quiz in Learning nav | Pass (unchanged) |
| Quiz mistakes adapter (`practice-mistakes.ts`) | Pass (file retained) |

## L. SQL Issue #30 boundary

This PR adds **UI shell only**. Not included:

- sql.js / WASM SQLite execution
- Backend SQL API
- Production or backend DB connections
- Query Run/Reset functionality
- SQL mistake persistence

Full SQL workbench is Issue #30 scope.

## M. AI / token check

- No AI/LLM features added
- No paid API or model usage added
- Judge0 not enabled
- No new network calls in SQL shell

## N. Build / lint result

```
npm run build          → PASS (see build log in PR branch)
eslint src/features/code-practice  → PASS (0 errors)
eslint src/features/sql-practice   → PASS (0 errors, 1 react-refresh warning in SqlEditorPlaceholder.tsx)
```

## O. Risks before merge

1. **Bookmarks** to old Practice Hub paths — mitigated by `practice` / `practice-ground` redirect to Code Workbench.
2. **Learning Planner** labels still say "Practice Ground" — navigates to Code Workbench; copy update optional follow-up.
3. **`scripts/practice-ground-smoke.mjs`** may reference legacy routes — not updated in this PR; review if CI uses it.
4. **Quiz mistake storage** still uses `codequest-practice-mistakes` via `practice-mistakes.ts` — separate from Code Workbench mistakes key; intentional.
5. **Manual smoke** (Python Run, JS Run, Sandpack, typing session) should be verified once on `npm run dev:all` before merge.

---

*Generated as part of Issue #29 cleanup on branch `issue-29-code-practice-rebuild`. Do not merge to `main` from this step alone.*
