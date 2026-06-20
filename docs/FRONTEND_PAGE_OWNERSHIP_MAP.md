# Frontend Page Ownership Map

**Branch:** `feature/codequest-legacy-feature-wiring`  
**Policy:** [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md)

Legend for **Status**:

| Status | Meaning |
|--------|---------|
| **frontend-kit prototype** | Native UI built (or being built) in `codequest-frontend-kit/` |
| **locked baseline** | Frozen design reference — do not redesign |
| **main app source of truth** | Real feature lives in repo root app (`:5000`) |
| **legacy/proxied** | Sidebar link opens main app URL — not a native kit page |
| **not ready** | Placeholder or missing |
| **future rebuild** | Planned native kit page, then port to `StudentShell` |

---

## Page / area ownership

| Page / Area | Current owner | Status | Future plan |
|-------------|---------------|--------|-------------|
| **Dashboard** | `codequest-frontend-kit/src/pages/DashboardPage.jsx` | frontend-kit prototype | Port approved shell/cards into `StudentShell`; wire real data (`phase-21d-unified-progress-sync`) |
| **Progress** | `codequest-frontend-kit/static/progress/index.html` | locked baseline | Keep as design reference; rebuild in kit only after explicit approval; sync data later |
| **Live Classes / Calendar** | `codequest-frontend-kit/src/pages/LiveClassesPage.jsx` | frontend-kit prototype | API wiring later: `phase-21c-classes-api`; port to `StudentShell` after approval |
| **Study Materials / Learning Planner** | Main app `LearningPlannerPage` | legacy/proxied | Native prototype: `phase-21b-study-materials-page`; API: `phase-21c-materials-api` |
| **Assignments / Projects** | Main app `ProjectsPage` | legacy/proxied | Native prototype: `phase-21b-assignments-page`; API: `phase-21c-assignments-api` |
| **Resume Lab** | Main app `ResumeBuilderPage` | legacy/proxied | Future rebuild in kit, then port to main shell |
| **Jobs** | Main app `JobSpyPage` | main app source of truth | No jobs backend work on sandbox branch; see `phase-23a-jobs-backend-consolidation-plan` |
| **Career Map** | Main app `CareerMapperPage` | legacy/proxied | Future kit page + main app integration |
| **Practice Studio / Hub** | Main app `StudentHubPage` | legacy/proxied | Future kit page; engines stay in main app |
| **Code Workbench** | Main app `src/features/code-practice/` | main app source of truth | Do not change engine; kit may link only |
| **SQL Practice** | Main app `src/features/sql-practice/` | main app source of truth | Do not change execution logic; kit may link only |
| **Typing Practice** | Main app `TypingTrainerPage` | main app source of truth | Do not change engine; kit may link only |
| **Power BI Practice** | Main app `src/features/powerbi-practice/` | main app source of truth | Do not change engine; kit may link only |
| **Quiz** | Main app `QuizPage` | legacy/proxied | Future kit chrome; assessment logic stays in main app |
| **Flow Path** | Main app `FlowRoadmapPage` | legacy/proxied | Future kit page |
| **Settings** | None (placeholder `#` in kit sidebar) | not ready | Define scope on future branch; not in sandbox scope today |

---

## Native routes in frontend-kit today

| Route | Owner | Status |
|-------|-------|--------|
| `/dashboard` | Frontend-kit React | frontend-kit prototype (approved layout — do not redesign) |
| `/classes` | Frontend-kit React (`LiveClassesPage.jsx`) | frontend-kit prototype (mock data) |
| `/progress` | Frontend-kit static HTML | locked baseline |
| `/` | Redirect → `/dashboard` | frontend-kit dev convenience |

All other sidebar targets → **main app on `:5000`** (legacy/proxied).

---

## Main app pages (production source of truth)

These remain authoritative for behavior until a page is explicitly ported:

- `src/components/pages/StudentDashboardPage.tsx` — old dashboard UI (replaced in prod only after kit port)
- `src/components/shells/StudentShell.tsx` — production navigation shell
- `src/features/*` — practice engines
- `src/App.tsx` — student routing and `?page=` deep links

---

## Related docs

- [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md)
- [CODEQUEST_FRONTEND_SANDBOX.md](./CODEQUEST_FRONTEND_SANDBOX.md)
- [codequest-frontend-kit/README.md](../codequest-frontend-kit/README.md)
