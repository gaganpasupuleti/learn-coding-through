# Frontend System Redesign Plan

**Repo:** [learn-coding-through](https://github.com/gaganpasupuleti/learn-coding-through)  
**Planning branch:** `phase-21c-frontend-system-redesign-plan`  
**Integration track:** `phase-21-frontend-sandbox-integration`  
**Parent tracking:** [#72 — Phase 21](https://github.com/gaganpasupuleti/learn-coding-through/issues/72)

Related docs:

- [FRONTEND_PAGE_REPLACEMENT_MAP.md](./FRONTEND_PAGE_REPLACEMENT_MAP.md)
- [PHASE_21_FRONTEND_BRANCH_SEQUENCE.md](./PHASE_21_FRONTEND_BRANCH_SEQUENCE.md)
- [PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md](./PHASE_21_FRONTEND_SANDBOX_INTEGRATION_PLAN.md)
- [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md)

---

## Strategy change (locked)

| Before | Now |
|--------|-----|
| `codequest-frontend-kit` = page prototype sandbox | **Full student frontend rebuild** inside Phase 21 branch track |
| Merge approved pages to `main` soon | **Do not merge to `main` now** |
| Main app UI stays primary during Phase 21 | **Sandbox/integration track becomes the redesign workspace** |
| Production `StudentShell` updated ad hoc | **Replace student experience in kit first**, validate, then plan production cutover later |

**Production `main` remains the live product** until an explicit, approved cutover phase — but **design and rebuild work happens on the integration branch track**, not on `main`.

---

## 1. Current frontend problem

### Production main app (`:5000`, repo root)

- **Split visual systems:** old `StudentShell` (top nav, Plus Jakarta) vs approved CodeQuest kit (cream/navy, Playfair + Inter).
- **Inconsistent information architecture:** dashboard, progress, practice, and career areas feel like separate products.
- **Navigation confusion:** student shell uses in-app page state + practice paths; kit uses React Router + legacy proxies.
- **Mobile gaps:** production shell is desktop-first; many surfaces lack cohesive mobile nav.
- **Prototype debt:** early dashboard cards and progress layouts do not match the approved CodeQuest direction.
- **Engine coupling:** practice UIs are embedded in feature folders — good for behavior, bad for unified chrome.

### Sandbox kit (`codequest-frontend-kit`, `:3000`)

- **Partial coverage:** only native `/dashboard`, `/classes` (when merged), `/progress` baseline.
- **Legacy escape hatches:** most sidebar items still jump to main app on `:5000`.
- **Auth/session friction:** cross-origin localStorage is unreliable in dev.
- **No unified route registry** for a full student app yet.

### Organizational

- Risk of **accidental production merge** of experimental UI.
- No single **replacement map** for what gets rebuilt vs protected vs deleted later.

---

## 2. New frontend direction

Rebuild the **entire CodeQuest student experience** as a cohesive product inside the Phase 21 integration track:

| Pillar | Direction |
|--------|-----------|
| **Feel** | Premium, clean, student-friendly, modern SaaS — slightly playful, not childish |
| **Domains** | Python, SQL, Data Analytics, Resume, Jobs, Classes, Assignments, Progress, Practice |
| **Workspace** | `codequest-frontend-kit/` grows into the **full student app shell + pages** on `:3000` |
| **Validation** | Merge child branches into `phase-21-frontend-sandbox-integration`; smoke-test the whole app |
| **Production** | Cutover to `main` / `StudentShell` is a **later explicit decision** — not Phase 21C–21I default |

### Design personality

- **Warm cream workspace** (`#FAF3E0`) with **navy structure** (`#0A1020`)
- **Pastel functional cards** for learning state (plan, mastery, skills, practice)
- **Clear hierarchy:** greeting → focus today → actions → depth panels
- **Friendly micro-copy** for students; avoid enterprise jargon
- **Confident CTAs** for practice, classes, assignments, jobs

---

## 3. What stays protected

Do **not** redesign or reimplement in frontend redesign branches:

| Area | Location | Rule |
|------|----------|------|
| **Backend APIs** | `backend/*` | No API behavior changes in Phase 21 frontend branches |
| **Practice execution engines** | `src/features/code-practice/`, `sql-practice/`, `powerbi-practice/`, typing pages | **Protected-engine** — re-chrome only, never rewrite execution |
| **Assessment logic** | Quiz flow, typing assessment guards | Behavior stays in main app until explicit port |
| **Jobs backend** | JobSpy services, jobs API consolidation | Phase 23+; UI shell only in Phase 21H |
| **DSA architecture** | DSA module / future phase-22 track | Out of Phase 21 frontend scope |
| **Locked progress baseline** | `codequest-frontend-kit/static/progress/index.html` | Reference baseline — no redesign without explicit approval |
| **Admin operations** | `AdminPage`, admin shell | Separate track; student redesign first |
| **Database / auth server** | Login API, token issuance | Auth **UI** may be redesigned later; **logic** not in early phases |

---

## 4. What can be replaced (sandbox/integration track)

Inside `codequest-frontend-kit/` and future kit routing:

| Replaceable | Notes |
|-------------|-------|
| **Student shell** | New sidebar, top bar, mobile nav, route registry |
| **All student pages** | Dashboard, classes, materials, assignments, progress (new React version when approved), practice hub chrome |
| **Career surfaces** | Resume lab, jobs portal chrome, roadmap placeholders |
| **Navigation model** | Single route map; end legacy `:5000` proxy links when kit page exists |
| **Design system** | CQ tokens, cards, pills, empty/loading states |
| **Responsive layouts** | Tablet/mobile shells |
| **Old kit prototypes** | Superseded pages after replacement map marks safe |

**Not replaced in Phase 21:** production `src/components/shells/StudentShell.tsx` on `main` until cutover phase.

---

## 5. Target student app experience

### Primary jobs-to-be-done

1. **Start my day** — see plan, live class, next assignment, streak/progress snapshot.
2. **Attend & learn** — classes, materials, planner, calendar.
3. **Practice** — Python, SQL, typing, aptitude/quiz, Power BI entry points.
4. **Track progress** — skills, mastery, assignments, study plan.
5. **Career** — resume, jobs, roadmap/interview prep placeholders.
6. **Account** — login, settings, logout (later phase).

### Experience principles

- **One shell, many modules** — student never feels they left CodeQuest.
- **Progressive disclosure** — dashboard summarizes; detail pages go deep.
- **Safe empty states** — new students see guidance, not blank screens.
- **Engine boundaries** — practice opens trusted engines with consistent entry chrome.

---

## 6. Target navigation model

### Primary nav (sidebar — desktop)

| Section | Items |
|---------|--------|
| **Home** | Dashboard |
| **Learn** | Live Classes, Study Materials, Assignments, Progress |
| **Practice** | Practice Hub, Python Lab, SQL Studio, Typing, Aptitude, Mock Tests, Power BI |
| **Career** | Resume Lab, Jobs, Career Map (placeholder) |
| **Account** | Settings |

### Secondary nav

- **Top bar:** search (future), notifications (future), profile menu, logout.
- **Mobile:** collapsible drawer + bottom quick actions (Dashboard, Classes, Practice, Progress).
- **Route registry:** single `navigation.js` / route config — every item declares `native | engine-embed | external | not-ready`.

### Deprecate over time

- `?page=` deep links on `:5000` for areas with native kit routes.
- Proxy `/open?page=` hops once kit routes are stable.

---

## 7. Target layout model

```
┌─────────────────────────────────────────────────────────────┐
│  Shell (rounded container, cream-soft, border, shadow)      │
├──────────┬──────────────────────────────┬─────────────────┤
│ Sidebar  │ Main column                  │ Right panel       │
│ 240px    │ Header + filters + content   │ 310px optional    │
│ navy     │ cream                        │ calendar / tasks  │
│          │                              │                   │
└──────────┴──────────────────────────────┴─────────────────┘
```

| Breakpoint | Layout |
|------------|--------|
| **Desktop (≥1024px)** | 3-column shell (sidebar | main | optional right panel) |
| **Tablet (768–1023px)** | Sidebar collapsible; right panel stacks below main |
| **Mobile (<768px)** | Icon bar or drawer; single column; right panel as sections |

**Page types:**

- **Hub pages** — dashboard, practice hub, progress (cards + summaries)
- **List + detail pages** — classes, materials, assignments
- **Engine embed pages** — full-width content frame around protected engines
- **Marketing/auth pages** — login (later), minimal shell

---

## 8. Design system direction

Extend existing CodeQuest kit tokens (do not invent a third system):

| Token | Value / usage |
|-------|----------------|
| Background | `cream` `#FAF3E0`, `cream-soft` |
| Structure | `navy` `#0A1020`, sidebar, primary pills |
| Text | `charcoal`, `slate` |
| Accent | `cta` blue, `progress` teal |
| Cards | `card-yellow`, `pink`, `sage`, `blue`, `lavender` |
| Typography | Playfair display headings, Inter body, JetBrains Mono code |
| Radius | `rounded-shell` 20px, `rounded-card` 18px |
| Components | `CQCard`, `CQStatCard`, `CQSectionTitle`, `CQActionButton`, `CQProgressBar`, list rows, timeline, calendar mini |

**New components to add (future branches):** `CQEmptyState`, `CQBadge`, `CQPageHeader`, `CQEngineFrame`, skeleton loaders, toast patterns.

---

## 9. Responsive / mobile direction

- **Touch targets** ≥ 44px for primary actions.
- **Sticky mobile header** with page title + back where needed.
- **Bottom nav** for 4 highest-frequency destinations.
- **Cards stack** single column; stat grids become 1×N scroll or 2×2.
- **Engine pages:** full viewport; shell chrome minimal.
- **Accessibility:** focus rings, aria labels on icon nav, reduced motion respect.

---

## 10. Risk notes

| Risk | Mitigation |
|------|------------|
| Accidental merge to `main` | Branch rules, PR targets to integration only, docs locked |
| Rewriting practice engines | `protected-engine` status in replacement map; embed-only |
| Two apps diverge forever | Branch sequence ends with cutover plan + strip-old cleanup |
| Auth/session breaks in kit | Dedicated auth branch before full rollout |
| Progress baseline drift | Locked file; new React progress is separate route when approved |
| Scope explosion | One branch = one slice (see branch sequence) |
| Backend pressure to add APIs | UI uses mock fallbacks until Phase 21C+ API phases |

---

## 11. Do-not-touch rules (all Phase 21C–21I frontend branches)

- `backend/*`
- Practice **execution** logic in `src/features/*`
- Jobs backend consolidation
- DSA module architecture
- SQL/code/typing/Power BI engine internals
- Locked `/progress` static baseline (without approval)
- Direct commits to `main`
- Deleting old frontend files before `phase-21j-strip-old-frontend-cleanup`

---

## 12. Success criteria (program level)

- [ ] Full student route map exists in kit
- [ ] Every nav item is native or explicitly engine-embed — no dead links
- [ ] Dashboard + learn + practice + career pages match design direction
- [ ] Responsive pass on mobile/tablet
- [ ] Integration branch smoke-tested end-to-end
- [ ] Replacement map marks all legacy files safe to delete
- [ ] Explicit approval before any production cutover

---

## Process (gstack-style, docs only here)

| Stage | This program |
|-------|----------------|
| **Plan** | This doc + replacement map + branch sequence (**phase-21c**, current) |
| **Design check** | Per-branch PR: compare to shell baseline + locked tokens |
| **Implementation** | phase-21d through phase-21i |
| **QA checklist** | Build + route smoke + responsive spot check per branch |
| **PR checklist** | Scope, protected files, integration target, no `main` |
