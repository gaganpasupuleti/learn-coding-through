# Code Quest — Frontend Redesign Rules

**Last updated:** 2026-06-27  
**Status:** Planning — no whole-app redesign execution until `phase-25b-frontend-redesign-plan` merges.  
**Scope:** Student + shared shell surfaces. Admin, practice **engines**, Jobs/email, and Progress Tracker logic are out of scope unless a phase explicitly includes them.

---

## Current status

| Item | State |
| --- | --- |
| Master redesign plan | **Not started** (25B) |
| Frontend-kit sandbox | Merged PR #63 — dashboard prototype only; not production shell |
| UI upgrade (PR #58) | Shipped on `main` — baseline for dashboard/calendar/progress/resume |
| Projects section | **LOCKED / FROZEN** — no redesign |
| Progress Tracker page | **Do not redesign** — link/reference only |
| Taste Skill guardrails | Documented in `docs/repo-reuse-reviews/taste-skill-codequest-application.md` |

---

## Locked decisions

1. **Main app (`:5000`) is production.** Frontend-kit is experimental per [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md).
2. **Projects: frozen.** No Projects page work in redesign phases until explicitly unlocked in [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md).
3. **Progress Tracker: frozen.** No layout/data model changes; dashboard may link to it.
4. **Practice execution: frozen.** `/practice/code`, `/practice/sql`, `/practice/typing`, Power BI **engines** — link only, do not refactor runners/validators.
5. **Jobs/email UI: frozen** except admin Email Station phases already scoped (24E).
6. **No new UI dependencies** without approval and `package.json` justification.
7. **One primary action per screen** — enforcer personas reject duplicate CTAs.
8. **Completion requires UI proof** — before/after captures + smoke scripts, not subjective “looks better.”

---

## Persona stack (use in order)

Each phase PR names which personas were applied. Prompts are **guidance**, not copied AGPL code.

| Persona | Role | Mandate |
| --- | --- | --- |
| **Ponytail** | Minimal safe changes | Smallest diff that achieves the design goal; no drive-by refactors; one page per PR when possible |
| **Caveman** | Concise high-signal decisions | Bullet decisions at top of PR: what changed, what was rejected, why |
| **GStack** | Product → architecture → risk → docs | Every redesign PR includes: user goal, component map, risks, doc/checklist updates |
| **Frontend Architect** | Structure & data flow | Shell ownership, route map, state boundaries; no business logic in presentational leaf components |
| **UI/UX Designer** | Hierarchy & flows | One hero block, clear secondary metrics, mobile-first nav |
| **Dashboard Specialist** | Dashboard density | Today → deadlines → progress → practice ordering; reduce card noise |
| **Design System Enforcer** | Tokens & components | Reuse shadcn/Radix/Tailwind patterns; no one-off colors; match `dashboard-styles.ts` |
| **Accessibility Reviewer** | a11y | Focus order, labels, contrast, landmarks; keyboard path for primary action |
| **Performance Reviewer** | Perf | No new heavy deps; lazy-load charts; avoid layout shift on dashboard |
| **PR Reviewer** | Gate | Scope check against this file; reject Projects/Progress/engine touches |

### GStack checklist (required in redesign PR bodies)

1. **Product** — One-sentence user goal for this page  
2. **Architecture** — Files touched; data sources (API vs localStorage vs mock)  
3. **Risk** — What could break (auth, practice links, demo limits)  
4. **Docs** — Update roadmap/tracker if status changes; screenshot proof  

### Ponytail rules

- Max one student-facing route per PR unless explicitly bundled in phase plan  
- No renaming routes without redirect plan  
- Prefer editing existing components over new folders  
- If diff > ~400 lines, split phase  

### Caveman PR header (copy)

```markdown
## Decisions
- YES: ...
- NO: ...
- DEFER: ...
```

---

## Completed phases (UI — output verified)

| Phase | Scope | Verification |
| --- | --- | --- |
| **UI upgrade PR #58** | Dashboard, calendar, progress, resume, shell polish | Merged; `npm run build` — **not re-smoked in Phase 25A cycle** |
| **Frontend sandbox PR #63** | Kit dashboard prototype | Merged; kit-only — **not production shell** |

**Not complete:** whole-app master redesign, shell integration (25C), native kit pages (21B series).

---

## Pending phases

| Phase | Scope |
| --- | --- |
| **25B** | Master redesign plan — page order, mock vs API, integration criteria |
| **25C** | Port approved kit patterns into `StudentShell` (start with Dashboard) |
| **21A** | Auth logout + session wiring |
| **21B** | Native kit pages (classes, materials, assignments prototypes) |
| **21C** | API wiring for 21B pages |
| **21D** | Demo limits + unified progress sync |

**Explicitly deferred:** Projects redesign, Progress Tracker redesign, practice workbench internals.

---

## Product design direction

Code Quest should read as a **modern student learning SaaS**:

| Aim for | Avoid |
| --- | --- |
| Clean, trustworthy, sharp | Childish gamification clutter |
| Strong spacing and type hierarchy | Generic AI gradient heroes |
| Purposeful cards, one primary CTA | Equal-weight card grids everywhere |
| Loading / empty / error states | Blank panels |
| Mobile-first `StudentShell` | Dense legacy form layouts |
| Subtle motion | Heavy scroll animations in learning tools |

**Palette:** Keep established Code Quest blue; refine neutrals/contrast rather than new gradient stacks.

---

## Page rollout order (recommended — confirm in 25B)

1. Login + `StudentShell` chrome  
2. Student Dashboard  
3. Calendar  
4. Resume builder  
5. Career Map / Flow Path (copy + hierarchy only)  
6. Jobs listing (visual only — no API changes)  
7. Admin shell (separate phase, if in scope)  

**Not in rollout until unlocked:** Projects, Progress Tracker layout, practice workbenches.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Sandbox merged as production by accident | FRONTEND_SANDBOX_CONTRACT acceptance checklist |
| Auth drift between kit and main | 25C integrates one origin only |
| Design system sprawl | Design System Enforcer blocks ad-hoc tokens |
| Accessibility regressions | Accessibility Reviewer sign-off on each page PR |
| Performance regression on dashboard | Performance Reviewer reviews chart bundles and re-renders |

---

## Next branch order

1. `phase-25a-project-roadmap-live-tracker` — this rules doc  
2. `phase-24d-ci-sandbox-smoke-stabilization` — unrelated CI; unblock merges  
3. `phase-24e-admin-email-station-client-ready-digest` — admin UI only  
4. **`phase-25b-frontend-redesign-plan`** — page map + persona sign-off  
5. **`phase-25c-frontend-shell-integration`** — first production port  

---

## Output-based testing requirements

### Required for every redesign PR

```bash
npm run build
npm run lint
```

### When student navigation or shell changes

```bash
npm run dev:all
npm run qa:practice-smoke
npm run qa:quiz-smoke
```

### Manual UI proof (attach to PR)

- [ ] Desktop screenshot — primary happy path  
- [ ] Mobile width (~375px) — nav + primary CTA reachable  
- [ ] Loading state visible (throttle network or skeleton)  
- [ ] Empty state copy present where lists exist  
- [ ] Error + retry if API-backed  
- [ ] Keyboard: Tab reaches primary action; visible focus  
- [ ] **Projects / Progress / practice engines untouched** (or list exception in PR)  

### Regression guardrails

- Demo mode still respects `demo-limits.ts`  
- Admin routes still gated  
- Jobs page still loads listings (no JobSpy contract change)  

---

## References

- [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md)  
- [docs/repo-reuse-reviews/taste-skill-codequest-application.md](./repo-reuse-reviews/taste-skill-codequest-application.md)  
- [docs/repo-reuse-reviews/prompt-guideline-map.md](./repo-reuse-reviews/prompt-guideline-map.md)  
- `.cursor/rules/codequest-ui-redesign.mdc` (when editing student UI globs)  

---

_Related: [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) · [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md)_
