# Frontend Page Replacement Map

**Planning branch:** `phase-21c-frontend-system-redesign-plan`  
**Integration track:** `phase-21-frontend-sandbox-integration`  
**Related:** [FRONTEND_SYSTEM_REDESIGN_PLAN.md](./FRONTEND_SYSTEM_REDESIGN_PLAN.md) · [PHASE_21_FRONTEND_BRANCH_SEQUENCE.md](./PHASE_21_FRONTEND_BRANCH_SEQUENCE.md)

## Status legend

| Status | Meaning |
|--------|---------|
| **keep-for-now** | Keep current implementation until kit replacement exists |
| **replace-in-kit** | Build new page in `codequest-frontend-kit/` on integration track |
| **redesign-needed** | Exists but must be rebuilt to match new system direction |
| **protected-engine** | Core logic/engine stays; only surrounding chrome/routing may change |
| **delete-later** | Remove after kit replacement verified (phase-21j only) |
| **needs-review** | Ownership or scope not final — decide before implementation |

---

## Page / area replacement map

| Current area | Current file or route | New target page | Status | Action | Risk | Notes |
|--------------|----------------------|-----------------|--------|--------|------|-------|
| **Dashboard** | Main: `src/components/pages/StudentDashboardPage.tsx` · Kit: `/dashboard` → `DashboardPage.jsx` | Kit `/dashboard` (approved layout, real data later) | replace-in-kit | Rebuild in phase-21e; keep approved visual language | Medium — data wiring vs mock | Main dashboard **keep-for-now** until cutover |
| **Live Classes** | Main: `StudentCalendarPage` · `?page=calendar` · Kit: `/classes` → `LiveClassesPage.jsx` | Kit `/classes` | replace-in-kit | Extend prototype (21f); API later | Low in mock phase | #67 prototype may merge from 21b branch |
| **Study Materials** | Main: `LearningPlannerPage` · `?page=learning-planner` | Kit `/materials` | replace-in-kit | New page phase-21f | Medium — content model TBD | Mock/static first |
| **Assignments** | Main: `ProjectsPage` · `?page=projects` | Kit `/assignments` | replace-in-kit | New page phase-21f | Medium — links to projects engine | Submit flows stay protected |
| **Progress** | Kit: `static/progress/index.html` `/progress` · Main: `StudentProgressPage` | Kit `/progress` (new React when approved) OR evolve baseline | needs-review | **Locked baseline** — new React route separate | High — baseline is design reference | Static HTML **keep-for-now**; React version **replace-in-kit** after approval |
| **Practice Hub** | Main: `StudentHubPage` · `?page=hub` | Kit `/practice` or `/hub` | replace-in-kit | Practice hub chrome phase-21g | Low | Entry point to engines |
| **Python Lab** | Main: `src/features/code-practice/` · `/practice/code` | Kit `/practice/code` embed | protected-engine | Engine embed frame only phase-21g | **High** if engine rewritten | **protected-engine** |
| **SQL Studio** | Main: `src/features/sql-practice/` · `/practice/sql` | Kit `/practice/sql` embed | protected-engine | Engine embed frame only phase-21g | **High** | **protected-engine** |
| **Aptitude** | Main: `QuizPage` · `?page=quiz` | Kit `/practice/aptitude` or `/quiz` embed | protected-engine | Quiz chrome + embed phase-21g | Medium — assessment guards | **protected-engine** |
| **Mock Tests** | Main: quiz / assessment flows | Kit `/practice/mock-tests` | protected-engine | Alias or section under quiz | Medium | May share quiz engine |
| **Typing Practice** | Main: `TypingTrainerPage` · `/practice/typing` | Kit `/practice/typing` embed | protected-engine | Embed frame phase-21g | **High** | **protected-engine** |
| **Power BI Practice** | Main: `src/features/powerbi-practice/` · `/practice/powerbi` | Kit `/practice/powerbi` embed | protected-engine | Embed + placeholder polish phase-21g | **High** | **protected-engine** |
| **Resume Lab** | Main: `ResumeBuilderPage` · `?page=resume` | Kit `/career/resume` or `/resume` | replace-in-kit | Career page phase-21h | Medium — builder logic in main today | Chrome first; builder embed later |
| **Jobs Portal** | Main: `JobSpyPage` · `?page=jobspy` | Kit `/career/jobs` | replace-in-kit | Jobs portal chrome phase-21h | Medium — jobs backend Phase 23 | No jobs backend work in 21H |
| **Career Map / Flow** | Main: `CareerMapperPage`, `FlowRoadmapPage` | Kit `/career/map`, `/career/flow` | replace-in-kit | Placeholder + embed phase-21h | Low for placeholder | Interview prep TBD |
| **Settings** | Kit: `#` placeholder · Main: scattered | Kit `/settings` | redesign-needed | Define scope in 21d/21a | Low | Auth-adjacent — after auth branch |
| **Login / Auth** | Main: `LoginPage.tsx` · `src/lib/auth.ts` | Kit `/login` (future) | keep-for-now | Auth UI phase after 21a wiring | **High** | **Do not change auth logic** in redesign plan branch |
| **Student Shell** | Main: `src/components/shells/StudentShell.tsx` | Kit `CodeQuestShell` + new route registry | replace-in-kit | New shell phase-21d | High — nav regression | Production shell **keep-for-now** until cutover |
| **Admin Shell** | Main: `AdminPage.tsx` (full viewport admin) | Unchanged in student redesign | keep-for-now | No student redesign scope | Low | Admin is separate product surface |

---

## Native kit routes (target end state)

| Route | Target page | Phase |
|-------|-------------|-------|
| `/dashboard` | Dashboard | 21e |
| `/classes` | Live Classes | 21f |
| `/materials` | Study Materials | 21f |
| `/assignments` | Assignments | 21f |
| `/progress` | Progress (baseline → React when approved) | needs-review |
| `/practice` | Practice Hub | 21g |
| `/practice/code` | Python embed | 21g |
| `/practice/sql` | SQL embed | 21g |
| `/practice/typing` | Typing embed | 21g |
| `/practice/quiz` | Aptitude / quiz embed | 21g |
| `/practice/powerbi` | Power BI embed | 21g |
| `/career/resume` | Resume Lab | 21h |
| `/career/jobs` | Jobs Portal | 21h |
| `/settings` | Settings | 21d / 21a |
| `/login` | Login (future) | post-21a |

---

## Cleanup candidates (`delete-later` — phase-21j only)

**Do not delete until replacement map row is verified in integration branch.**

| File / area | Condition for deletion |
|-------------|------------------------|
| `src/components/pages/StudentDashboardPage.tsx` | Kit dashboard + cutover approved |
| Old `StudentShell.tsx` student nav sections | New shell live in production |
| Proxy-only `legacyApp.js` hops | All routes native or engine-embed |
| Duplicate progress HTML (if React progress approved) | New progress route signed off |
| WIP prototype pages superseded by 21f–21h | Replacement merged + tested |

---

## Main app files — keep until cutover

These stay **keep-for-now** on `main` throughout Phase 21 integration work:

- `src/App.tsx` (production routing)
- `src/features/*` practice engines
- `src/components/pages/*` (except when explicitly ported)
- `backend/*`

---

## Related GitHub issues

| Area | Issue |
|------|-------|
| Parent | [#72](https://github.com/gaganpasupuleti/learn-coding-through/issues/72) |
| Live Classes | [#67](https://github.com/gaganpasupuleti/learn-coding-through/issues/67) |
| Auth | [#66](https://github.com/gaganpasupuleti/learn-coding-through/issues/66) |
| Navigation | [#70](https://github.com/gaganpasupuleti/learn-coding-through/issues/70) |

Update this map when each phase branch merges into `phase-21-frontend-sandbox-integration`.
