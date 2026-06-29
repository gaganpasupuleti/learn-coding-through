## Goal

Stabilize the **frontend sandbox**, prototype selected pages in `codequest-frontend-kit/`, and prepare **approved work** for later integration into the main app — **without** merging experimental UI directly to `main`.

## Option A (locked)

- **`codequest-frontend-kit/`** is **experimental only**
- **Main app** (repo root, port 5000) remains **source of truth** for auth, practice engines, jobs UI, and APIs
- Approved frontend-kit UI will **later be ported** into main `StudentShell`

## Branch model

| Branch | Role |
|--------|------|
| `feature/codequest-legacy-feature-wiring` | Frontend sandbox **base** |
| `phase-21-frontend-sandbox-integration` | Final **integration shell** — merge target for child PRs |
| `main` | Production — **no direct merge** from sandbox without explicit approval |

## Rules

- **Do not push directly to `main`**
- **Every child branch** gets its own PR
- Child PRs merge into **`phase-21-frontend-sandbox-integration` only after review**
- Integration branch is **build/smoke tested** before anything moves toward `main`

## Child issues

| Issue | Title | Branch |
|-------|--------|--------|
| #65 | Phase 21.1 — Frontend Sandbox Contract Cleanup | `feature/codequest-legacy-feature-wiring` |
| #66 | Phase 21.2 — Auth and Logout Wiring Cleanup | `phase-21a-auth-logout-wiring` |
| #67 | Phase 21.3 — Live Classes Page Prototype | `phase-21b-live-classes-page` |
| #68 | Phase 21.4 — Study Materials Page Prototype | `phase-21b-study-materials-page` |
| #69 | Phase 21.5 — Assignments Page Prototype | `phase-21b-assignments-page` |
| #70 | Phase 21.6 — Navigation Ownership Cleanup | `phase-21b-navigation-ownership-cleanup` |
| #71 | Phase 21.7 — Dashboard Real Data Wiring | `phase-21b-dashboard-real-data-wiring` |

## Related docs

- [PHASE_21_ISSUE_REGISTER.md](https://github.com/gaganpasupuleti/learn-coding-through/blob/phase-21-frontend-sandbox-integration/docs/PHASE_21_ISSUE_REGISTER.md)
- [PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md](https://github.com/gaganpasupuleti/learn-coding-through/blob/phase-21-frontend-sandbox-integration/docs/PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md)
- [FRONTEND_SANDBOX_CONTRACT.md](https://github.com/gaganpasupuleti/learn-coding-through/blob/feature/codequest-legacy-feature-wiring/docs/FRONTEND_SANDBOX_CONTRACT.md)

## Recommended merge order into integration branch

1. `phase-21a-auth-logout-wiring` (#66)
2. `phase-21b-navigation-ownership-cleanup` (#70)
3. `phase-21b-live-classes-page` (#67)
4. `phase-21b-study-materials-page` (#68)
5. `phase-21b-assignments-page` (#69)
6. `phase-21b-dashboard-real-data-wiring` (#71, if created)
