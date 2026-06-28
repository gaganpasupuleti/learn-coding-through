# Code Quest — Project Roadmap (Live)

**Last updated:** 2026-06-28  
**Branch:** `phase-25a-project-roadmap-live-tracker`  
**Purpose:** Single source of truth for Cursor sessions, ChatGPT project chats, and human reviewers. Update this file at the end of every phase branch.

---

## Current status

| Area | Status | Notes |
| --- | --- | --- |
| **Jobs ingestion & listing** | Production-verified | Phase 24A merged (PR #74). Admin refresh, student Jobs page, India-only profiles. |
| **Job email safety** | Production-verified | Phase 24B merged (PR #75). Preview, dry_run, test, live-block while `JOB_MAIL_ENABLED=false`. |
| **Email transport** | Production-verified | Phase 24C merged (PR #76). Brevo HTTPS on Railway; SMTP fallback when `EMAIL_PROVIDER=smtp`. |
| **Admin Email Station** | Production-verified | Phase 24E merged (PR #78). Client-ready digest preview, summary cards, safe test/dry-run; live blocked. |
| **Premium digest (24F)** | Production-verified | Phase 24F merged (PR #81). Premium KPI cards, insight sections, 2-column featured roles. |
| **Jobs Radar digest (24G)** | Production-verified | Phase 24G merged (PR #84). Portal-style “Code Quest Jobs Radar” email + admin preview labels. |
| **Live student digests** | Intentionally off | `JOB_MAIL_ENABLED=false`; student emails sent = **0**. |
| **Production test email** | Delivered | Brevo test mode `sentCount=1`, `failedCount=0`; 24G proof on `main` after merge. |
| **Sandbox Smoke CI** | **Green** | Phase 24D merged (PR #77 JVM `RLIMIT_AS` fix; PR #86 Java cold-start warm-up). Post-merge run `28299100814` — 13/13 OK. |
| **Frontend master plan** | Merged | Phase 25B (PR #83). [FRONTEND_REDESIGN_MASTER_PLAN.md](./FRONTEND_REDESIGN_MASTER_PLAN.md). |
| **Frontend shell (partial)** | In progress | Phase 25C partial (PR #85). `StudentShell` chrome + `StudentDashboardPage` hierarchy polish. More pages per master plan. |
| **Projects section** | **LOCKED / FROZEN** | No new features or redesign until explicitly unlocked in this file. |
| **Progress Tracker** | Stable baseline | Do not modify without explicit phase. |
| **Library module** | Not started | Backlog in [MODULE_BACKLOG.md](./MODULE_BACKLOG.md). |
| **Aptitude module** | Not started | Backlog in [MODULE_BACKLOG.md](./MODULE_BACKLOG.md). |
| **Live roadmap tracker** | This phase (25A) | Docs refresh for Cursor continuity. |

---

## Locked decisions

1. **Projects section is frozen.** Bug fixes only if production-breaking; no UX work, no new project types, no content expansion.
2. **Jobs/email safety defaults stay conservative.** `JOB_MAIL_ENABLED=false` until a dedicated phase explicitly enables live sends with output proof.
3. **Progress Tracker is out of scope** for frontend redesign and new modules unless a phase names it.
4. **No new npm/pip dependencies** without an approved phase and PR justification.
5. **Completion = verified output.** API JSON, UI screenshots, inbox delivery, or CI green — not “merged” alone.
6. **Main app (port 5000) is product source of truth.** Frontend-kit sandbox is experimental per [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md).
7. **Whole-frontend redesign** follows persona stack in [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md).
8. **PR merge safety rule is mandatory** — see [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md).

---

## Completed phases (production / output verified)

Only phases with **documented output proof** at time of last update.

| Phase | Scope | Verification |
| --- | --- | --- |
| **24A** | Job ingestion, admin refresh dashboard, student Jobs listing, India profiles | Merged PR #74 |
| **24B** | Email preview, dry_run (`sentCount=0`), test recipient only, live 403 | Merged PR #75; `tests/test_job_email_flow.py` |
| **24C** | Brevo HTTPS email transport for Railway | Merged PR #76; `proof_prod_brevo_output.txt` |
| **24D** | Sandbox Smoke CI stabilization | Merged PR #77 (`RLIMIT_AS` JVM fix) + PR #86 (Java toolchain warm-up). Actions run `28299100814` on merge `4d7a4a0c` — 13/13 OK |
| **24E** | Admin Email Station client-ready digest + controls | Merged PR #78; `proof_prod_24e_output.txt` |
| **24F** | Premium job digest redesign | Merged PR #81; KPI cards, insights, 2-column featured, sources hidden |
| **24G** | Jobs Radar portal-style digest | Merged PR #84; production proof 30/30 checks; test send `sentCount=1`, student sends **0** |
| **25B** | Frontend redesign master plan (docs only) | Merged PR #83; [FRONTEND_REDESIGN_MASTER_PLAN.md](./FRONTEND_REDESIGN_MASTER_PLAN.md) |
| **25C** | StudentShell + Dashboard polish (partial) | Merged PR #85; first production port per master plan |

**Explicitly not complete (by design):**

| Item | Why not “complete” |
| --- | --- |
| **Live student digests** | `JOB_MAIL_ENABLED=false`; zero student sends |
| **Whole-frontend redesign** | 25C started; Calendar, Resume, Jobs visual, remaining shell pages pending |
| **Library / Aptitude** | Not started — see [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |

### Historical shipped work (pre–Phase 25A tracker)

SQL workbench, Code Workbench (Python/Java), typing upgrade, Power BI practice ground, UI upgrade PR #58, JobSpy wiring — shipped on `main` but **not re-verified** in this tracker cycle. Treat as baseline; re-smoke before claiming “production-verified” in future phases.

---

## Pending phases

| Priority | Branch (planned) | Scope |
| --- | --- | --- |
| **Now** | `phase-25a-project-roadmap-live-tracker` | Refresh roadmap, tracker, module backlog, engineering rules (docs only) |
| **Next** | `phase-25c-frontend-shell-integration` (continued) | Next pages per master plan: Calendar, Resume, Career Map, Jobs visual |
| **Planned** | `phase-26a-library-module-foundation` | Library read-only student surface + content model |
| **Planned** | `phase-27a-aptitude-module-foundation` | Aptitude question bank + practice loop MVP |
| **Backlog** | `phase-21a`–`21d` | Auth logout wiring, native kit pages, APIs, progress sync — see [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md) |
| **Backlog** | `phase-22a-dsa-practice-architecture` | DSA module architecture |
| **Backlog** | `phase-23a-jobs-backend-consolidation-plan` | Jobs consolidation (planning) |

Detail for Library and Aptitude: [MODULE_BACKLOG.md](./MODULE_BACKLOG.md).  
Active bugs and CI: [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md).

---

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Accidental live email send | Student trust / compliance | Keep `JOB_MAIL_ENABLED=false`; test/dry_run only until signed phase |
| Frontend redesign scope creep | Delays Library/Aptitude | Locked Projects; page-by-page phases; FRONTEND_REDESIGN_RULES enforcers |
| CI red blocks merges | Slow delivery | 24D/86 merged — keep Sandbox Smoke green on every backend PR |
| Merging stale branches | Wrong diff lands on `main` | PR merge safety rule in [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md) |
| Dual frontend (main + kit) | Auth/session drift | Main app = truth; integration phases only |
| Marking phases “done” without proof | False confidence | Output-based checklist required per phase |

---

## Next branch order (recommended)

1. **`phase-25a-project-roadmap-live-tracker`** — this docs refresh (current)  
2. **`phase-25c-frontend-shell-integration`** (continued) — next page(s) from master plan  
3. **`phase-26a-library-module-foundation`**  
4. **`phase-27a-aptitude-module-foundation`**  

Do **not** start Library/Aptitude before explicit reprioritization in this file.

---

## Output-based testing requirements

Every phase PR must include a **Proof** section with real command output or screenshots.

### Global gates

```bash
npm run build
npm run lint
# When backend touched:
cd backend && python -m unittest discover -s tests -v
```

### PR merge safety (all phases)

See [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md) — fetch `origin/main`, rebase if advanced, re-run tests, re-check diff scope, then merge.

### Jobs / email (24A–24G family)

| Check | Expected output |
| --- | --- |
| `POST .../email-preview` | 200, summary + Jobs Radar HTML markers (24G) |
| `send-digest` `dry_run` | `sentCount=0` |
| `send-digest` `live` | **403** while `JOB_MAIL_ENABLED=false` |
| `send-digest` `test` | `sentCount=1`; **0** student roster sends |

Scripts: `proof_job_refresh.py`, `proof_job_email_flow.py`, `proof_prod_brevo.py`, `proof_prod_24e.py`, `proof_prod_24g.py`.

### CI (24D)

```bash
python -m unittest discover -s backend/tests -p "test_sandbox_smoke.py" -v
```

Verified on `main`: Actions run `28299100814` (`Ran 13 tests … OK`).

### Frontend redesign phases

- Before/after screenshot for changed routes  
- `npm run qa:practice-smoke` when student nav touched  
- No regression on practice execution routes  

---

## How to update this file

1. At phase start: add row under **Pending**, link branch name.  
2. At phase end: move to **Completed** only with proof links; update **Current status**.  
3. Log blockers in [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md).  
4. Cross-link module detail in [MODULE_BACKLOG.md](./MODULE_BACKLOG.md).

---

_Related: [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md) · [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) · [FRONTEND_REDESIGN_MASTER_PLAN.md](./FRONTEND_REDESIGN_MASTER_PLAN.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) · [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md) · [LAUNCH.md](./LAUNCH.md)_
