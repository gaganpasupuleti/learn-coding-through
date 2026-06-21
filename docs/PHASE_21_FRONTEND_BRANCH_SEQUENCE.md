# Phase 21 — Frontend Branch Sequence

**Planning branch:** `phase-21c-frontend-system-redesign-plan`  
**Integration target for all child PRs:** `phase-21-frontend-sandbox-integration`  
**Production `main`:** no merges from this sequence until explicit cutover approval

Related:

- [FRONTEND_SYSTEM_REDESIGN_PLAN.md](./FRONTEND_SYSTEM_REDESIGN_PLAN.md)
- [FRONTEND_PAGE_REPLACEMENT_MAP.md](./FRONTEND_PAGE_REPLACEMENT_MAP.md)
- [PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md](./PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md)

---

## Program overview

```text
feature/codequest-legacy-feature-wiring     (historical sandbox base)
         │
         ▼
phase-21-frontend-sandbox-integration       (integration shell — merge target)
         │
         ├── phase-21a … phase-21b-*       (in-flight child work — auth, pages, nav)
         │
         ├── phase-21c-frontend-system-redesign-plan   ← YOU ARE HERE (docs)
         ├── phase-21d-new-shell-navigation
         ├── phase-21e-dashboard-redesign
         ├── phase-21f-learning-pages-redesign
         ├── phase-21g-practice-pages-redesign
         ├── phase-21h-career-pages-redesign
         ├── phase-21i-responsive-polish
         └── phase-21j-strip-old-frontend-cleanup
```

**Rule:** Each branch opens **one PR → `phase-21-frontend-sandbox-integration`**. Never PR directly to `main` in this program.

---

## Branch 1 — `phase-21c-frontend-system-redesign-plan` (current)

| Field | Detail |
|-------|--------|
| **Purpose** | Full frontend redesign strategy — docs only |
| **Deliverables** | `FRONTEND_SYSTEM_REDESIGN_PLAN.md`, `FRONTEND_PAGE_REPLACEMENT_MAP.md`, this file |
| **UI** | None |
| **Deletes** | None |
| **Merge when** | Docs reviewed |

### QA checklist

- [ ] Only three new docs changed
- [ ] No `codequest-frontend-kit/src/**` code changes
- [ ] No `backend/**` changes
- [ ] No root `src/**` changes

### PR checklist

- [ ] Title: `Phase 21C: Plan full frontend redesign and replacement map`
- [ ] Target: `phase-21-frontend-sandbox-integration`
- [ ] Note: planning only, no UI

---

## Branch 2 — `phase-21d-new-shell-navigation`

| Field | Detail |
|-------|--------|
| **Purpose** | New app shell foundation |
| **Scope** | Route registry, sidebar, top bar, mobile nav skeleton |
| **Pages** | **No page redesign yet** — placeholder outlets only |
| **Allowed** | `codequest-frontend-kit/src/components/layout/*`, `config/navigation.js`, `config/routes.js` (new), shell CSS tokens |
| **Must not touch** | Practice engines, backend, auth logic, page content |
| **Merge when** | All routes registered; nav renders; build passes |

### Implementation prompt (future)

> Add unified route registry and CodeQuest shell v2 with desktop sidebar, top bar, and mobile drawer. Wire stub pages (`/dashboard`, `/classes`, …) as empty outlets. Do not redesign page interiors.

### QA checklist

- [ ] `npm run build` passes
- [ ] Every nav item resolves (stub or not-ready badge)
- [ ] Mobile drawer opens/closes
- [ ] `/progress` baseline untouched

---

## Branch 3 — `phase-21e-dashboard-redesign`

| Field | Detail |
|-------|--------|
| **Purpose** | Dashboard aligned to system plan |
| **Scope** | `DashboardPage.jsx` only (+ shared components if needed) |
| **Must not touch** | Locked progress baseline; engines; backend |
| **Merge when** | Matches design direction; mock/real data fallback safe |

---

## Branch 4 — `phase-21f-learning-pages-redesign`

| Field | Detail |
|-------|--------|
| **Purpose** | Learn pillar pages |
| **Pages** | `/classes`, `/materials`, `/assignments`, calendar/schedule views |
| **Data** | Mock/static first |
| **Includes** | Live Classes work from #67 / `phase-21b-live-classes-page` if not already merged |
| **Must not touch** | Backend APIs; auth |

---

## Branch 5 — `phase-21g-practice-pages-redesign`

| Field | Detail |
|-------|--------|
| **Purpose** | Practice hub + engine entry chrome |
| **Pages** | Practice hub, Python, SQL, aptitude/quiz, mock tests, typing, Power BI placeholder |
| **Critical** | **protected-engine** — embed or link to existing engines only |
| **Must not touch** | `src/features/code-practice`, `sql-practice`, typing, powerbi execution logic |

### QA checklist

- [ ] Each practice link opens working engine (main embed or proxy)
- [ ] No execution code copied into kit
- [ ] Hub matches design system

---

## Branch 6 — `phase-21h-career-pages-redesign`

| Field | Detail |
|-------|--------|
| **Purpose** | Career pillar |
| **Pages** | Resume lab, jobs portal, interview prep placeholder, roadmap generator placeholder |
| **Must not touch** | Jobs backend (Phase 23); JobSpy API behavior |

---

## Branch 7 — `phase-21i-responsive-polish`

| Field | Detail |
|-------|--------|
| **Purpose** | Cross-cutting UX quality |
| **Scope** | Mobile, tablet, a11y, empty states, loading skeletons |
| **Must not touch** | Engine internals; backend |

---

## Branch 8 — `phase-21j-strip-old-frontend-cleanup`

| Field | Detail |
|-------|--------|
| **Purpose** | Remove superseded frontend **only after** replacement map confirms safe |
| **Scope** | Delete unused kit prototypes, documented legacy chrome files |
| **Must not touch** | Protected engines; backend; anything marked **keep-for-now** |
| **Gate** | Integration branch full smoke test + explicit approval |

---

## Relationship to existing Phase 21a–21b branches

These may merge **before or in parallel** with 21d–21j per [PHASE_21_ISSUE_REGISTER.md](./PHASE_21_ISSUE_REGISTER.md):

| Branch | Fits in sequence |
|--------|------------------|
| `phase-21a-auth-logout-wiring` | Before or during 21d (auth for shell) |
| `phase-21b-navigation-ownership-cleanup` | Superseded by or merged into 21d |
| `phase-21b-live-classes-page` | Merged into 21f scope |
| `phase-21b-study-materials-page` | 21f |
| `phase-21b-assignments-page` | 21f |
| `phase-21b-dashboard-real-data-wiring` | 21e (data only, no redesign) |

**Recommended order for remaining 21a–21b work:**

1. `phase-21a-auth-logout-wiring`
2. `phase-21c-frontend-system-redesign-plan` (this doc branch)
3. `phase-21d-new-shell-navigation`
4. Merge 21b page branches into 21f as appropriate
5. `phase-21e` → `phase-21f` → `phase-21g` → `phase-21h` → `phase-21i` → `phase-21j`

---

## Branch creation commands

Base for **21c** (already created from integration):

```bash
git fetch origin
git checkout phase-21-frontend-sandbox-integration
git pull origin phase-21-frontend-sandbox-integration
git checkout -b phase-21c-frontend-system-redesign-plan
```

Future branches (from latest integration after prior merges):

```bash
git fetch origin
git checkout phase-21-frontend-sandbox-integration
git pull origin phase-21-frontend-sandbox-integration
git checkout -b phase-21d-new-shell-navigation
git push -u origin phase-21d-new-shell-navigation
```

Repeat for `phase-21e-*` through `phase-21j-*`.

---

## PR policy (all branches)

| Rule | Value |
|------|--------|
| **Source** | Feature branch |
| **Target** | `phase-21-frontend-sandbox-integration` |
| **Never target** | `main` |
| **Review** | Scope vs replacement map + protected-engine list |
| **Build** | `cd codequest-frontend-kit && npm run build` |
| **Smoke** | Native routes + engine embeds |

---

## Cutover to production (future — not this sequence)

When integration branch is complete:

1. Executive review of full student app on `:3000`
2. Auth production model finalized
3. Engine embed strategy validated on staging
4. **Separate approved program** to port kit → `StudentShell` / `main`
5. `phase-21j` cleanup in kit; then production cleanup branch

**This sequence does not include merging to `main`.**
