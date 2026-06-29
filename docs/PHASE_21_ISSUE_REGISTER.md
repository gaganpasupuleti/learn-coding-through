# Phase 21 — Issue Register & Branch Tracking

**Repo:** [learn-coding-through](https://github.com/gaganpasupuleti/learn-coding-through)  
**Parent issue:** [#72 — Phase 21 — Frontend Sandbox Stabilization and Page Migration](https://github.com/gaganpasupuleti/learn-coding-through/issues/72)

| Branch role | Branch name |
|-------------|-------------|
| Sandbox base | `feature/codequest-legacy-feature-wiring` |
| Integration shell | `phase-21-frontend-sandbox-integration` |
| Production | `main` (**no direct merge**) |

Related: [PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md](./PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md)

---

## Parent issue

| Field | Value |
|-------|--------|
| **#** | [#72](https://github.com/gaganpasupuleti/learn-coding-through/issues/72) |
| **Title** | Phase 21 — Frontend Sandbox Stabilization and Page Migration |
| **Goal** | Stabilize frontend sandbox, prototype selected pages, prepare approved work for later integration |
| **Option A** | Frontend-kit experimental; main app source of truth |
| **Integration branch** | `phase-21-frontend-sandbox-integration` |
| **Merge to main** | Not until integration cross-check + explicit approval |

---

## Child issues register

| Phase | Issue | Title | Branch | Base | PR target | Status |
|-------|-------|-------|--------|------|-----------|--------|
| 21.1 | [#65](https://github.com/gaganpasupuleti/learn-coding-through/issues/65) | Frontend Sandbox Contract Cleanup | `feature/codequest-legacy-feature-wiring` | — | docs on base branch | **Closed (done)** |
| 21.2 | [#66](https://github.com/gaganpasupuleti/learn-coding-through/issues/66) | Auth and Logout Wiring Cleanup | `phase-21a-auth-logout-wiring` | `feature/codequest-legacy-feature-wiring` | `phase-21-frontend-sandbox-integration` | Open |
| 21.3 | [#67](https://github.com/gaganpasupuleti/learn-coding-through/issues/67) | Live Classes Page Prototype | `phase-21b-live-classes-page` | `feature/codequest-legacy-feature-wiring` | `phase-21-frontend-sandbox-integration` | Open |
| 21.4 | [#68](https://github.com/gaganpasupuleti/learn-coding-through/issues/68) | Study Materials Page Prototype | `phase-21b-study-materials-page` | `feature/codequest-legacy-feature-wiring` | `phase-21-frontend-sandbox-integration` | Open |
| 21.5 | [#69](https://github.com/gaganpasupuleti/learn-coding-through/issues/69) | Assignments Page Prototype | `phase-21b-assignments-page` | `feature/codequest-legacy-feature-wiring` | `phase-21-frontend-sandbox-integration` | Open |
| 21.6 | [#70](https://github.com/gaganpasupuleti/learn-coding-through/issues/70) | Navigation Ownership Cleanup | `phase-21b-navigation-ownership-cleanup` | `feature/codequest-legacy-feature-wiring` | `phase-21-frontend-sandbox-integration` | Open |
| 21.7 | [#71](https://github.com/gaganpasupuleti/learn-coding-through/issues/71) | Dashboard Real Data Wiring | `phase-21b-dashboard-real-data-wiring` | `feature/codequest-legacy-feature-wiring` | `phase-21-frontend-sandbox-integration` | Open |

---

## Scope & acceptance (summary)

### 21.1 — Contract cleanup ✅

**Scope:** Sandbox contract, page ownership map, known flaws, future fix register, do-not-touch list  
**Acceptance:** Option A documented; kit experimental; main app source of truth; docs only; no functional changes  
**Status:** Closed — see `docs/FRONTEND_SANDBOX_CONTRACT.md`, `docs/FRONTEND_PAGE_OWNERSHIP_MAP.md`

### 21.2 — Auth & logout

**Scope:** Auth helper cleanup, real logout, missing/invalid token UX, ConnectionStatus messaging  
**Allowed:** `auth.js`, `api.js`, `CodeQuestSidebar.jsx`, `ConnectionStatus.jsx` (kit only)  
**Acceptance:** Logout clears session; dashboard safe without token; clear auth states; no backend changes; build passes

### 21.3 — Live Classes

**Scope:** Native `/classes` prototype; mock data; today/upcoming classes; placeholders; empty state  
**Allowed:** `LiveClassesPage.jsx`, `App.jsx`, `navigation.js`  
**Acceptance:** `/classes`, `/dashboard`, `/progress` work; no backend; build passes

### 21.4 — Study Materials

**Scope:** Native `/materials` prototype; mock data; list/cards; search/filter; tags; empty state  
**Allowed:** `StudyMaterialsPage.jsx`, `App.jsx`, `navigation.js`  
**Acceptance:** `/materials`, `/dashboard`, `/progress` work; no backend; build passes

### 21.5 — Assignments

**Scope:** Native `/assignments` prototype; pending/due/completed; submit placeholder; empty state  
**Allowed:** `AssignmentsPage.jsx`, `App.jsx`, `navigation.js`  
**Acceptance:** `/assignments`, `/dashboard`, `/progress` work; no backend; build passes

### 21.6 — Navigation ownership

**Scope:** Clear native vs legacy/proxied vs not-ready; Settings handling; no dead links  
**Allowed:** `navigation.js`, `CodeQuestSidebar.jsx`, ownership map doc  
**Acceptance:** No dead Settings link; ownership clear; build passes

### 21.7 — Dashboard real data

**Scope:** Wire existing APIs where safe; mock fallback; **no visual redesign**; no new backend APIs  
**Allowed:** `DashboardPage.jsx`, `api.js`, ownership map doc  
**Acceptance:** Same look; user name works; safe fallback; no backend changes; build passes

---

## Recommended merge order (into integration branch)

Merge **only after** each child PR is reviewed. Target: `phase-21-frontend-sandbox-integration`.

| Order | Branch | Issue |
|-------|--------|-------|
| 1 | `phase-21a-auth-logout-wiring` | #66 |
| 2 | `phase-21b-navigation-ownership-cleanup` | #70 |
| 3 | `phase-21b-live-classes-page` | #67 |
| 4 | `phase-21b-study-materials-page` | #68 |
| 5 | `phase-21b-assignments-page` | #69 |
| 6 | `phase-21b-dashboard-real-data-wiring` | #71 (optional) |

**Do not merge child branches until PR review is complete.**

---

## Branch creation commands

Run from repo root. **Do not merge to `main`.** Push each branch when ready to open a child PR.

```bash
git fetch origin
```

### Auth branch (#66)

```bash
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21a-auth-logout-wiring
git push -u origin phase-21a-auth-logout-wiring
```

### Live Classes (#67)

```bash
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21b-live-classes-page
git push -u origin phase-21b-live-classes-page
```

### Study Materials (#68)

```bash
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21b-study-materials-page
git push -u origin phase-21b-study-materials-page
```

### Assignments (#69)

```bash
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21b-assignments-page
git push -u origin phase-21b-assignments-page
```

### Navigation ownership (#70)

```bash
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21b-navigation-ownership-cleanup
git push -u origin phase-21b-navigation-ownership-cleanup
```

### Dashboard real data (#71)

```bash
git checkout feature/codequest-legacy-feature-wiring
git pull origin feature/codequest-legacy-feature-wiring
git checkout -b phase-21b-dashboard-real-data-wiring
git push -u origin phase-21b-dashboard-real-data-wiring
```

---

## PR workflow

1. Implement on child branch (base: `feature/codequest-legacy-feature-wiring`)
2. Open PR: **child branch → `phase-21-frontend-sandbox-integration`**
3. Link issue (#66–#71) in PR description
4. Review against issue acceptance criteria
5. Merge into integration branch after approval
6. Repeat for each child in merge order
7. Run integration build/smoke test before any path toward `main`

---

## Issue body archive

Canonical GitHub issue bodies are stored under `docs/_issue_bodies/` for reference when updating issues.

---

## Out of scope (all Phase 21 child work)

- `backend/*`
- Jobs backend/frontend consolidation
- DSA module
- SQL / code / typing / Power BI **execution logic**
- Locked `/progress` baseline redesign
- Dashboard **visual** redesign
- Direct merge to `main`
