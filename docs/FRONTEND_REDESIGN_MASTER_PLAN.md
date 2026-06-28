# Code Quest Frontend Redesign Master Plan

**Branch:** `phase-25b-frontend-redesign-plan`  
**Status:** Planning only. Do not implement UI from this branch.  
**Source of truth:** main app in repo root (`src/`), not `codequest-frontend-kit/`.

---

## Decisions

- **YES:** Plan a small, page-by-page production rollout through the existing `StudentShell` and page modules.
- **YES:** Reuse existing Code Quest tokens, shadcn/Radix UI primitives, `dashboard-styles.ts`, and working data hooks.
- **NO:** Do not replace the app with `codequest-frontend-kit/`; it remains an experimental dashboard-only sandbox.
- **NO:** Do not redesign Projects, Progress Tracker, practice engines, or Jobs/email logic.
- **DEFER:** Library, Aptitude, native kit pages, auth rewiring, and unified progress sync stay on their own future branches.

---

## Product Goal

Make Code Quest feel like a clean, trustworthy student learning SaaS while preserving the working product: auth, practice tools, jobs, admin operations, demo limits, and production data flows.

25B is a planning phase. 25C is the first implementation phase.

---

## Current Frontend Inventory

### App Shell And Routing

| Area | Current files | Notes |
| --- | --- | --- |
| Main app entry | `src/App.tsx` | Uses React state (`studentPage`) for most navigation. Also maps direct practice paths to practice pages. |
| Student shell | `src/components/shells/StudentShell.tsx` | Top nav with grouped Learn / Practice / Career menus, feedback, account menu, mobile horizontal nav. |
| Admin shell | `src/components/shells/AdminShell.tsx` | Admin topbar with section pill nav and logout. |
| Admin workspace | `src/components/pages/AdminPage.tsx` | Internal admin section state via `AdminWorkspaceProvider`; command dialog and `AdminHeroBar`. |
| Sandbox kit | `codequest-frontend-kit/` | Design reference only. Approved React page is dashboard; `/progress` is locked static baseline. |

### Route Model

The app does not currently use a full router for all pages. `App.tsx` conditionally renders pages from `studentPage`; practice routes also support URL path aliases:

| URL / page key | Current production page |
| --- | --- |
| login / unauthenticated | `LoginPage` |
| `dashboard` | `StudentDashboardPage` |
| `calendar` | `StudentCalendarPage` |
| `progress` | `StudentProgressPage` |
| `resume` | `ResumeBuilderPage` |
| `hub` | `StudentHubPage` |
| `jobspy` | `JobSpyPage` |
| `learning-planner` | `LearningPlannerPage` |
| `projects` | `ProjectsPage` |
| `learning` | `ProjectLearningPage` |
| `/practice/code` | `CodePracticePage` |
| `/practice/sql` | `SqlPracticePage` |
| `/practice/typing` | `TypingTrainerPage` |
| `/practice/powerbi`, DAX subroute | `PowerBiPracticePage` |
| `quiz` | `QuizPage` |
| `roadmapper` | `CareerMapperPage` |
| `flow-roadmap` | `FlowRoadmapPage` |
| admin role | `AdminPage` |

---

## Student-Facing Page Map

| Group | Pages | 25B decision |
| --- | --- | --- |
| Shell | `StudentShell`, mobile nav, account menu, feedback entry | **25C first target.** Improve chrome, spacing, active states, and page container rhythm without changing page keys. |
| Dashboard | `StudentDashboardPage`, `student-dashboard/*` | **25C first page.** Preserve hooks and card components; simplify density and strengthen hierarchy. |
| Calendar | `StudentCalendarPage`, `student-calendar/*` | Redesign after dashboard; preserve planner hooks and selected-date behavior. |
| Resume | `ResumeBuilderPage`, `resume/*` | Redesign after calendar; preserve ATS one-column print preview and localStorage persistence. |
| Login | `LoginPage`, auth promo components | Polish with trust and clarity; do not change auth behavior. |
| Career | `CareerMapperPage`, `FlowRoadmapPage` | Copy and hierarchy polish only; preserve roadmap data and navigation. |
| Jobs | `JobSpyPage` | Visual polish only after 24E; **no Jobs/email/API contract changes**. |
| Hub / Learning Planner | `StudentHubPage`, `LearningPlannerPage` | Layout polish only after shell/dashboard baseline. |
| Quiz | `QuizPage` | Shell/page framing polish only; preserve quiz logic and demo limits. |
| Projects | `ProjectsPage`, `ProjectLearningPage` | **LOCKED / FROZEN.** No redesign. |
| Progress Tracker | `StudentProgressPage`, `student-progress/*` | **FROZEN.** Link/reference only; no layout/data changes. |
| Practice engines | Code, SQL, typing, Power BI feature pages | **FROZEN.** No executor, validator, editor, panel, scoring, or route rewrites. |

---

## Admin-Facing Page Map

| Section | Current files | 25B decision |
| --- | --- | --- |
| Admin shell | `AdminShell`, `AdminPage`, `AdminHeroBar` | Defer broad redesign. Keep stable while student frontend plan lands. |
| Dashboard | `DashboardView` | Defer. |
| Workflow Board | `BoardView` | Defer. |
| Students | `StudentsView` | Defer. |
| Classes | `ClassesView` | Defer. |
| JobSpy Ops / Email Station | `JobSpyOpsView` | **Frozen after 24E proof.** No Jobs/email logic or API changes. |
| Quizzes | `QuizzesView` | Defer. |
| Activity | `ActivityView` | Defer. |
| Feedback | `FeedbackView` | Defer. |
| Access Control | `AccessView` | Defer. |

Admin redesign should be a later branch after student shell and dashboard prove the system.

---

## Frozen Surfaces

These are hard scope locks for 25C and all near-term frontend redesign PRs:

| Surface | Rule |
| --- | --- |
| Projects | No redesign, no content expansion, no project flow changes. P0 breakage only. |
| Progress Tracker | No layout, state, data, or card changes. Dashboard may link to it. |
| Practice engines | Do not change Code Workbench, SQL Practice, Typing, Power BI, DAX execution or validation internals. |
| Jobs/email logic | No endpoint, mode, digest safety, transport, or `JOB_MAIL_ENABLED` changes. |
| Backend | No backend changes in frontend redesign branches. |
| Dependencies | No new UI packages. |
| Routes | No page key or practice path renames without a separate redirect plan. |

---

## Reuse These Components And Patterns

| Reuse | Why |
| --- | --- |
| `StudentShell` | Production auth/session/nav boundary. 25C should improve this, not replace it wholesale. |
| `AdminShell` | Stable admin boundary; not a 25C target. |
| `components/ui/*` | Existing shadcn/Radix primitives: `Button`, `Card`, `Badge`, `DropdownMenu`, `Dialog`, `Tabs`, `Skeleton`, `Alert`. |
| `student-dashboard/dashboard-styles.ts` | Existing spacing/background/section tokens for student pages. |
| `student-dashboard/*` cards | Working dashboard data contracts; refactor only where needed for hierarchy. |
| `useStudentDashboardSnapshot` | Existing dashboard/calendar/progress data source. |
| `useLearningPlanner` | Existing calendar/planner source. |
| `demo-limits.ts` | Demo constraints must remain intact. |
| `ErrorBoundary` practice wrappers | Keep practice tools isolated from shell failures. |

---

## Avoid Rewriting

| Avoid | Reason |
| --- | --- |
| `src/features/*` practice workbench internals | High regression risk; engines are out of scope. |
| `ProjectsPage` / `ProjectLearningPage` | Projects are locked. |
| `StudentProgressPage` / `student-progress/*` | Progress Tracker is frozen. |
| `JobSpyPage`, `JobSpyOpsView`, `jobspy-api.ts` | 24E just proved Jobs/email safety; no contract churn. |
| Auth token/session flow | Belongs to `phase-21a-auth-logout-wiring`. |
| Replacing state navigation with a router | Too much blast radius for 25C. |
| Importing codequest-frontend-kit directly | Sandbox is reference only; production code must remain main app native. |

---

## Rollout Order

### 25C: Shell + Dashboard Production Port

**Product:** Make the first logged-in screen feel coherent and modern.  
**Architecture:** Edit `StudentShell`, `StudentDashboardPage`, and narrowly scoped `student-dashboard/*` components only.  
**Risk:** Navigation, demo mode, practice links, dashboard data loading.  
**Docs:** Update this plan only if scope changes; attach screenshot proof.

Allowed:

- Improve `StudentShell` spacing, mobile nav, active states, and account/feedback placement.
- Improve dashboard hierarchy: welcome/today first, deadlines second, practice/readiness secondary.
- Reuse existing dashboard cards and hooks.
- Add or improve loading/empty/error copy inside changed dashboard components.
- Keep dashboard links to frozen surfaces as links only.

Must not do:

- Do not touch Projects, Progress Tracker, practice engines, Jobs/email, backend, or dependencies.
- Do not introduce new routes or router migration.
- Do not copy sandbox files into production wholesale.
- Do not redesign calendar/resume/login in the same PR unless 25C is explicitly split.

### 25D: Calendar Page Polish

Scope: `StudentCalendarPage`, `student-calendar/*`, maybe planner preview alignment if needed. Preserve `useLearningPlanner`.

### 25E: Resume Builder Polish

Scope: `ResumeBuilderPage`, `resume/*`. Preserve localStorage autosave and print/PDF layout.

### 25F: Login And Public Entry Polish

Scope: `LoginPage`, auth promo, landing entry copy. Preserve auth, Google config, demo mode.

### 25G: Career Map / Flow Path Clarity

Scope: `CareerMapperPage`, `FlowRoadmapPage`. Copy, hierarchy, and navigation clarity only.

### 25H: Jobs Listing Visual Polish

Scope: `JobSpyPage` visual states only. No API, email, admin, or backend changes.

### Later: Admin Redesign Planning

Admin shell/views need a separate plan after student shell proves the design system.

---

## 25C Entry Criteria

25C can start only when all are true:

- 25B is merged.
- `main` is current and clean for frontend work.
- PR states one page group: **StudentShell + Dashboard only**.
- Reviewer agrees Projects, Progress Tracker, practice engines, Jobs/email, backend, and dependencies are out of scope.
- Baseline screenshots are captured for desktop and mobile dashboard.
- `npm run build` is known before changes or failure is documented as pre-existing.

---

## Future PR Template

```markdown
## Decisions
- YES:
- NO:
- DEFER:

## GStack
- Product:
- Architecture:
- Risk:
- Docs:

## Frozen Surface Check
- Projects untouched:
- Progress Tracker untouched:
- Practice engines untouched:
- Jobs/email untouched:
- Backend untouched:

## Proof
- Desktop screenshot:
- Mobile screenshot:
- Loading/empty/error state:
- Keyboard/focus check:
- Commands:
```

---

## Testing And Output Proof

Every frontend redesign PR must include real output proof, not only a prose summary.

| Change type | Required proof |
| --- | --- |
| Any frontend PR | `npm run build`; `npm run lint` or documented pre-existing failures |
| Shell/nav changes | Desktop + mobile screenshots; keyboard tab path to primary nav/account/logout |
| Student route changes | Happy path screenshot; loading, empty, and error state proof if API-backed |
| Dashboard changes | Cards render from existing hooks; practice links still open Code/SQL/Typing; no blank page |
| Calendar changes | Selected date changes summary; notes/assignments/resources states visible |
| Resume changes | Form edits persist; print preview still one-column ATS-friendly |
| Login changes | Email/password flow still works; demo mode still starts; error copy visible |
| Jobs visual changes | Listings load; no JobSpy API/email contract change |
| Practice-adjacent links | `npm run qa:practice-smoke` after `npm run dev:all` |
| Quiz nav touched | `npm run qa:quiz-smoke` |

Accessibility checks:

- Visible focus on nav, CTAs, forms, dropdowns.
- `aria-current` or selected state on active nav.
- Labels on form controls.
- Contrast spot-check on text, badges, and disabled states.
- Mobile touch targets usable around 375px width.

Performance checks:

- No new dependencies.
- No large charts/animations added to initial dashboard load.
- Keep derived dashboard data memoized where already memoized.
- Do not move expensive feature workbenches into shell-level render paths.

---

## Merge Safety Rule

Before marking any future frontend PR ready to merge:

1. Fetch latest `origin/main`.
2. Confirm whether `origin/main` has new commits after the branch point.
3. If `origin/main` moved, update the branch with latest main.
4. Re-run the required checks after updating.
5. Re-check changed files against latest main.
6. Do not merge stale branches.

For 25C specifically, this means re-running build/lint, route smoke checks, screenshot proof, and frozen-surface file checks after any branch update.

---

## Persona Checklist

| Persona | 25B rule |
| --- | --- |
| Ponytail | One route group per PR; prefer small edits over rewrites. |
| Caveman | Put `YES / NO / DEFER` decisions at the top of every redesign PR. |
| GStack | Include product, architecture, risk, and docs checklist. |
| Frontend Architect | Preserve current shell/page boundaries; no router migration in 25C. |
| UI/UX Designer | One primary action per screen; clear hierarchy; intentional empty states. |
| Design System Enforcer | Use existing components/tokens; no one-off palette or dependency. |
| Accessibility Reviewer | Verify keyboard, labels, contrast, landmarks. |
| Performance Reviewer | Avoid heavy deps, unnecessary rerenders, and decorative motion. |
| PR Reviewer | Reject scope creep into frozen surfaces. |

---

## Open Questions For Later Phases

- Should `StudentShell` eventually move from state navigation to URL routes? Defer until after 25C.
- When should Library and Aptitude enter nav? After shell integration, before their own foundation branches.
- Should admin redesign get its own master plan? Yes, after student shell/dashboard are stable.
- Should Progress Tracker be unlocked? Not until the roadmap explicitly changes; it remains frozen.

---

_Related: [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) · [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) · [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md)_
