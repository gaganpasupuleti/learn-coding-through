# Phase 21 — Frontend Sandbox Integration Plan

**Integration branch:** `phase-21-frontend-sandbox-integration`  
**Base branch:** `feature/codequest-legacy-feature-wiring`  
**Repo:** [learn-coding-through](https://github.com/gaganpasupuleti/learn-coding-through)

Related docs:

- [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md)
- [FRONTEND_PAGE_OWNERSHIP_MAP.md](./FRONTEND_PAGE_OWNERSHIP_MAP.md)
- [CODEQUEST_FRONTEND_SANDBOX.md](./CODEQUEST_FRONTEND_SANDBOX.md)

---

## 1. Branch identity

| Property | Value |
|----------|--------|
| Branch name | `phase-21-frontend-sandbox-integration` |
| Based on | `feature/codequest-legacy-feature-wiring` |
| Type | **Final integration branch** (planning + merge target) |
| Is it a development branch? | **No** — no feature work directly on this branch |
| Is it a production branch? | **No** — must not merge to `main` until all checks pass |
| When to merge child branches | Only **after** each child branch is reviewed and approved |
| When to merge toward `main` | Only after integration cross-check, build/smoke tests, and explicit final approval |

**Purpose:**

- Receive approved Phase 21 **child branches** one by one
- Cross-check that each child branch completed its assigned issue correctly
- Resolve integration conflicts **after** child work is approved (not before)
- Run final build/smoke testing before any path toward `main`
- Stay **clean** until approved child branches are merged into it

**This branch is only an integration planning shell until child merges begin.**

---

## 2. Base model

| Layer | Role |
|-------|------|
| `feature/codequest-legacy-feature-wiring` | Frontend sandbox **base** — experimental kit + wiring docs |
| `codequest-frontend-kit/` | **Experimental only** — not production frontend |
| Main app (repo root, `:5000`) | **Real product source of truth** — auth, engines, jobs UI, APIs |
| Approved frontend-kit UI | **Later ported** into main `StudentShell` — not by accident-merge of sandbox |
| `phase-21-frontend-sandbox-integration` | **Validates** sandbox child work before deciding what may move toward `main` |

**Option A (unchanged):** sandbox experiments; main app remains authoritative for behavior.

---

## 3. Child branches to be merged later

Each child branch is developed **off the sandbox base or off a prior approved child**, then merged into `phase-21-frontend-sandbox-integration` in the [recommended order](#6-recommended-merge-order). **Do not merge child branches into this integration branch until their PR is approved.**

---

### 3.1 `phase-21a-auth-logout-wiring`

| Field | Detail |
|-------|--------|
| **Assigned issue** | Phase 21.2 — Auth and Logout Wiring Cleanup |
| **Scope** | Reliable session handoff and logout between main app (`:5000`) and frontend-kit (`:3000`); remove dev-only auth hacks where appropriate; document final auth model for integrated shell |
| **Files allowed** | `codequest-frontend-kit/src/lib/auth.js`, `codequest-frontend-kit/src/main.jsx`, `codequest-frontend-kit/src/components/layout/CodeQuestSidebar.jsx` (logout link only), `src/components/pages/SandboxDashboardRedirect.tsx` or equivalent main-app redirect (if still needed), **docs only elsewhere** |
| **Must not touch** | Backend auth APIs, practice engines, jobs, DSA, `/progress` baseline, dashboard layout/design, `backend/*` |
| **Acceptance criteria** | Login on main app reflects in kit without fragile hash hacks; logout clears session consistently; no backend API behavior changes; documented auth flow in sandbox docs |
| **Merge readiness checklist** | [ ] Linked to Phase 21.2 issue [ ] PR reviewed [ ] No files outside allowed list [ ] Manual login/logout smoke on `:5000` + `:3000` [ ] No backend diff |

---

### 3.2 `phase-21b-navigation-ownership-cleanup`

| Field | Detail |
|-------|--------|
| **Assigned issue** | Phase 21.6 — Navigation Ownership Cleanup |
| **Scope** | Sidebar/navigation clearly labels native kit routes vs legacy/proxied vs not-ready; align with [FRONTEND_PAGE_OWNERSHIP_MAP.md](./FRONTEND_PAGE_OWNERSHIP_MAP.md) |
| **Files allowed** | `codequest-frontend-kit/src/config/navigation.js`, `codequest-frontend-kit/src/components/layout/CodeQuestSidebar.jsx`, `codequest-frontend-kit/src/lib/legacyApp.js`, docs |
| **Must not touch** | New page implementations, auth logic (use 21a), backend, engines, jobs, DSA, locked `/progress`, dashboard redesign |
| **Acceptance criteria** | Every sidebar item has clear ownership (native / proxied / not ready); no broken links; ownership map updated if routes change |
| **Merge readiness checklist** | [ ] Linked to Phase 21.6 issue [ ] PR reviewed [ ] Ownership map updated [ ] Sidebar smoke test [ ] No engine/backend diff |

---

### 3.3 `phase-21b-live-classes-page`

| Field | Detail |
|-------|--------|
| **Assigned issue** | Phase 21.3 — Live Classes Page Prototype |
| **Scope** | Native frontend-kit **Live Classes / Calendar** page prototype at `/classes` (or agreed route); static/mock data OK in Phase 21b |
| **Files allowed** | `codequest-frontend-kit/src/pages/ClassesPage.jsx` (new), routing in `App.jsx`, nav entries, shared CQ components, docs |
| **Must not touch** | Main app `StudentCalendarPage` engine logic, backend schedule APIs (Phase 21c), `/progress` baseline, dashboard redesign, practice engines |
| **Acceptance criteria** | `/classes` renders in kit shell; matches Code Quest theme; sidebar marks as native; links from dashboard optional |
| **Merge readiness checklist** | [ ] Linked to Phase 21.3 issue [ ] PR reviewed [ ] `npm run build` passes in kit [ ] Route registered [ ] No backend diff |

---

### 3.4 `phase-21b-study-materials-page`

| Field | Detail |
|-------|--------|
| **Assigned issue** | Phase 21.4 — Study Materials Page Prototype |
| **Scope** | Native **Study Materials / Learning Planner** page prototype at `/materials` (or agreed route) |
| **Files allowed** | `codequest-frontend-kit/src/pages/MaterialsPage.jsx` (new), routing, nav, shared components, docs |
| **Must not touch** | Main app learning planner logic, backend APIs (Phase 21c), engines, jobs, DSA, `/progress`, dashboard redesign |
| **Acceptance criteria** | `/materials` renders in kit shell; theme-consistent; ownership map updated |
| **Merge readiness checklist** | [ ] Linked to Phase 21.4 issue [ ] PR reviewed [ ] Build passes [ ] No backend diff |

---

### 3.5 `phase-21b-assignments-page`

| Field | Detail |
|-------|--------|
| **Assigned issue** | Phase 21.5 — Assignments Page Prototype |
| **Scope** | Native **Assignments / Projects** page prototype at `/assignments` (or agreed route) |
| **Files allowed** | `codequest-frontend-kit/src/pages/AssignmentsPage.jsx` (new), routing, nav, shared components, docs |
| **Must not touch** | Main app projects engine, backend APIs (Phase 21c), practice execution, jobs, DSA, `/progress`, dashboard redesign |
| **Acceptance criteria** | `/assignments` renders in kit shell; theme-consistent; ownership map updated |
| **Merge readiness checklist** | [ ] Linked to Phase 21.5 issue [ ] PR reviewed [ ] Build passes [ ] No backend diff |

---

### 3.6 `phase-21b-dashboard-real-data-wiring` *(if created later)*

| Field | Detail |
|-------|--------|
| **Assigned issue** | Phase 21.7 — Dashboard Real Data Wiring (if needed) |
| **Scope** | Replace static dashboard stat cards with API-driven data where endpoints already exist; **no dashboard redesign** |
| **Files allowed** | `codequest-frontend-kit/src/pages/DashboardPage.jsx`, `codequest-frontend-kit/src/lib/api.js` (read-only client calls only), docs |
| **Must not touch** | Dashboard layout/visual design, backend API contracts (no new endpoints here), `/progress` baseline, engines |
| **Acceptance criteria** | Dashboard shows real user name and available metrics; graceful fallback when API unavailable; approved visual design unchanged |
| **Merge readiness checklist** | [ ] Linked to Phase 21.7 issue [ ] PR reviewed [ ] Build passes [ ] No backend diff unless separate approved phase [ ] Manual dashboard smoke |

---

## 4. Issue tracking model

### Parent tracking issue

**Phase 21 — Frontend Sandbox Stabilization and Page Migration**

Tracks overall sandbox stabilization, child branch integration into `phase-21-frontend-sandbox-integration`, and readiness review before any merge toward `main`.

### Child issues

| Issue | Title | Typical branch |
|-------|--------|----------------|
| Phase 21.1 | Frontend Sandbox Contract Cleanup | `feature/codequest-legacy-feature-wiring` (docs) |
| Phase 21.2 | Auth and Logout Wiring Cleanup | `phase-21a-auth-logout-wiring` |
| Phase 21.3 | Live Classes Page Prototype | `phase-21b-live-classes-page` |
| Phase 21.4 | Study Materials Page Prototype | `phase-21b-study-materials-page` |
| Phase 21.5 | Assignments Page Prototype | `phase-21b-assignments-page` |
| Phase 21.6 | Navigation Ownership Cleanup | `phase-21b-navigation-ownership-cleanup` |
| Phase 21.7 | Dashboard Real Data Wiring (if needed) | `phase-21b-dashboard-real-data-wiring` |

**Rules:**

- Every child branch PR must **link** its GitHub issue
- Integration branch PRs reference which child merges are included
- Close or explicitly **defer** each child issue before integration is “done”

---

## 5. End-goal cross-check

Before `phase-21-frontend-sandbox-integration` is considered **successful** (and before any merge toward `main`):

### Issue & PR hygiene

- [ ] Every child branch has a **linked issue**
- [ ] Every child issue is **closed** or **explicitly deferred**
- [ ] Every child branch PR has been **reviewed**
- [ ] No child branch touched files **outside its allowed scope** without documented explanation

### Frontend-kit routes & baselines

- [ ] **`/dashboard`** still works (approved design unchanged)
- [ ] **`/progress`** locked baseline is **unchanged**
- [ ] **`/classes`** works if Live Classes branch is merged
- [ ] **`/materials`** works if Materials branch is merged
- [ ] **`/assignments`** works if Assignments branch is merged
- [ ] **Auth/logout** works if auth branch is merged

### Navigation clarity

- [ ] Sidebar/navigation clearly separates **native**, **sandbox**, **legacy/proxied**, and **not-ready** pages

### Out-of-scope guardrails (Phase 21)

- [ ] **No backend files** changed unless explicitly planned in a **later** phase
- [ ] **No jobs** backend/frontend consolidation in Phase 21
- [ ] **No DSA** feature work in Phase 21
- [ ] **No SQL/code/typing/Power BI execution logic** changed

### Build & test

- [ ] `npm run build` passes in **`codequest-frontend-kit`**
- [ ] **Main app build** checked if any `src/` main-app files were changed by child branches
- [ ] **Manual smoke test** completed (login, dashboard, merged native pages, proxied practice links)

### Release governance

- [ ] Integration branch PR **clearly explains** what was merged from each child
- [ ] **Final approval** received before any merge toward **`main`**

---

## 6. Recommended merge order

Merge into `phase-21-frontend-sandbox-integration` in this order:

1. `phase-21a-auth-logout-wiring`
2. `phase-21b-navigation-ownership-cleanup`
3. `phase-21b-live-classes-page`
4. `phase-21b-study-materials-page`
5. `phase-21b-assignments-page`
6. `phase-21b-dashboard-real-data-wiring` *(if created)*

**Do not merge child branches until each PR is approved.** Resolve conflicts on the integration branch after merges, not by mixing unapproved work.

---

## 7. Do-not-touch list (this integration planning branch)

**On `phase-21-frontend-sandbox-integration` itself** — only **docs** are allowed until child merges begin.

Must **not** directly modify on the initial planning commit:

| Path / area | Reason |
|-------------|--------|
| `codequest-frontend-kit/src/pages/*` | Feature pages belong on child branches |
| `codequest-frontend-kit/src/lib/auth.js` | Auth → `phase-21a-auth-logout-wiring` |
| `codequest-frontend-kit/src/lib/api.js` | API wiring → child branches / Phase 21.7 |
| `codequest-frontend-kit/src/components/*` | UI work → child branches |
| `backend/*` | Out of Phase 21 sandbox scope |
| `src/features/sql-practice/*` | Do not change SQL engine |
| `src/features/code-practice/*` | Do not change code engine |
| `src/features/typing/*` / typing pages | Do not change typing engine |
| Power BI practice feature paths | Do not change Power BI engine |
| Jobs-related files | Phase 23+ |
| DSA-related app files | Phase 22+ |
| `static/progress/index.html` | Locked baseline |

**Allowed on planning shell:** `docs/PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md` and related **documentation-only** updates.

---

## 8. Final branch lifecycle

```text
1. Create from feature/codequest-legacy-feature-wiring
2. Add planning doc only (this file)
3. Push branch; open draft PR if useful
4. Keep branch clean — no direct feature development
5. Merge approved child branches one by one (merge order above)
6. Resolve conflicts only after child branches are approved
7. Run build + manual smoke tests on integration branch
8. Review final integrated behavior against Section 5 checklist
9. Only after explicit approval — prepare path toward main (separate decision)
```

**Commands used to create this branch:**

```bash
git fetch origin
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21-frontend-sandbox-integration
```

**Planning commit (docs only):**

```bash
git add docs/PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md
git commit -m "docs: add phase 21 frontend sandbox integration plan"
git push -u origin phase-21-frontend-sandbox-integration
```

---

## 9. What this branch is not

- Not a place to **fix auth** ad hoc
- Not a place to **build pages** without a child branch
- Not a place to **merge to main** without Section 5 complete
- Not a substitute for **production StudentShell** integration (that remains a later, explicit step)
