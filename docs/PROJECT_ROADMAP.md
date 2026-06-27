# Code Quest — Project Roadmap (Live)

**Last updated:** 2026-06-27  
**Branch:** `phase-24d-roadmap-status-update`  
**Purpose:** Single source of truth for Cursor sessions, ChatGPT project chats, and human reviewers. Update this file at the end of every phase branch.

---

## Current status

| Area | Status | Notes |
| --- | --- | --- |
| **Jobs ingestion & listing** | Production-verified | Phase 24A merged (PR #74). Admin refresh, student Jobs page, India-only profiles. |
| **Job email safety** | Production-verified | Phase 24B merged (PR #75). Preview, dry_run, test, live-block while `JOB_MAIL_ENABLED=false`. |
| **Email transport** | Production-verified | Phase 24C merged (PR #76). Brevo HTTPS on Railway; SMTP fallback when `EMAIL_PROVIDER=smtp`. |
| **Live student digests** | Intentionally off | `JOB_MAIL_ENABLED=false`; student emails sent = **0**. |
| **Production test email** | Delivered | Brevo test mode `sentCount=1`, `failedCount=0` (see `backend/scripts/proof_prod_brevo_output.txt`). |
| **Projects section** | **LOCKED / FROZEN** | No new features or redesign until master frontend plan completes. |
| **Progress Tracker** | Stable baseline | Do not modify without explicit phase. |
| **Frontend shell** | Redesign planned | Master plan governed by [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md). |
| **Library module** | Not started | Backlog in [MODULE_BACKLOG.md](./MODULE_BACKLOG.md). |
| **Aptitude module** | Not started | Backlog in [MODULE_BACKLOG.md](./MODULE_BACKLOG.md). |
| **Sandbox Smoke CI** | **Green / resolved** | Phase 24D merged (PR #77). Linux CI run `28291205306` — 13/13 `test_sandbox_smoke.py` pass. |
| **Live roadmap tracker** | Merged | Phase 25A (PR #79). Phase 24D status update in this PR. |

---

## Locked decisions

1. **Projects section is frozen.** Bug fixes only if production-breaking; no UX work, no new project types, no content expansion.
2. **Jobs/email safety defaults stay conservative.** `JOB_MAIL_ENABLED=false` until a dedicated phase explicitly enables live sends with output proof.
3. **Progress Tracker is out of scope** for frontend redesign and new modules unless a phase names it.
4. **No new npm/pip dependencies** without an approved phase and PR justification.
5. **Completion = verified output.** API JSON, UI screenshots, inbox delivery, or CI green — not “merged” alone.
6. **Main app (port 5000) is product source of truth.** Frontend-kit sandbox is experimental per [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md).
7. **Whole-frontend redesign** follows persona stack in [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) — ponytail-minimal diffs, caveman decisions, GStack checklist.

---

## Completed phases (production / output verified)

Only phases with **documented output proof** at time of last update.

| Phase | Scope | Verification |
| --- | --- | --- |
| **24A** | Job ingestion, admin refresh dashboard, student Jobs listing, India profiles | Merged PR #74; `docs/LAUNCH.md` job env matrix; local/Railway refresh + listing smoke |
| **24B** | Email preview, dry_run (`sentCount=0`), test recipient only, live 403 | Merged PR #75; `tests/test_job_email_flow.py`; HTTP proof in `.run/pr-24b-body.md` |
| **24C** | Brevo HTTPS email transport for Railway | Merged PR #76; production `proof_prod_brevo_output.txt` — preview 200, dry_run 0 sent, live 403, test `sentCount=1` |
| **24D** | Sandbox Smoke CI stabilization (Java/JVM under `RLIMIT_AS`) | Merged PR #77 (`e0189c8947f71470b34befabd189af5450cf297b`); GitHub Actions run `28291205306` — 13/13 `test_sandbox_smoke.py` pass on `ubuntu-latest` |

**Explicitly not complete (merged or not):**

| Item | Why not “complete” |
| --- | --- |
| **24E** Admin Email Station digest polish | Post-deploy browser smoke unchecked; not output-verified in tracker |
| **Live student digests** | `JOB_MAIL_ENABLED=false`; zero student sends by design |

### Historical shipped work (pre–Phase 25A tracker)

SQL workbench, Code Workbench (Python/Java), typing upgrade, Power BI practice ground, UI upgrade PR #58, JobSpy wiring — shipped on `main` but **not re-verified** in this tracker cycle. Treat as baseline; re-smoke before claiming “production-verified” in future phases.

---

## Pending phases

| Priority | Branch (planned) | Scope |
| --- | --- | --- |
| **Next** | `phase-24e-admin-email-station-client-ready-digest` | Client-ready digest preview + Email Station controls — post-deploy proof pending |
| **Planned** | `phase-25b-frontend-redesign-plan` | Master redesign doc + page-by-page rollout order (no feature creep) |
| **Planned** | `phase-25c-frontend-shell-integration` | Port approved sandbox UI into `StudentShell` (one page at a time) |
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
| Accidental live email send | Student trust / compliance | Keep `JOB_MAIL_ENABLED=false`; test/dry_run only until signed phase; never commit secrets |
| Frontend redesign scope creep | Delays Library/Aptitude | Locked Projects; page-by-page phases; FRONTEND_REDESIGN_RULES enforcers |
| CI red blocks merges | Slow delivery | 24D merged — keep Sandbox Smoke green on every backend PR |
| JVM `RLIMIT_AS` on Linux | Java practice unreliable in prod executor | 24D fixed JVM subprocess cap; monitor prod Java on Linux if issues recur |
| Dual frontend (main + kit) | Auth/session drift | Main app = truth; integration phases only |
| Marking phases “done” without proof | False confidence | Output-based checklist required per phase |

---

## Next branch order (recommended)

1. **`phase-24e-admin-email-station-client-ready-digest`** — admin digest UX + post-deploy proof  
2. **`phase-25b-frontend-redesign-plan`** — rollout plan aligned with FRONTEND_REDESIGN_RULES  
3. **`phase-25c-frontend-shell-integration`** — first production page port (likely Dashboard)  
4. **`phase-26a-library-module-foundation`**  
5. **`phase-27a-aptitude-module-foundation`**  

Do **not** start Library/Aptitude before 24E post-deploy proof or explicit reprioritization in this file.

---

## Output-based testing requirements

Every phase PR must include a **Proof** section with real command output or screenshots. “Tests pass locally” alone is insufficient for production claims.

### Global gates

```bash
npm run build
npm run lint
# When backend touched:
cd backend && python -m unittest discover -s tests -v
```

### Jobs / email (24A–24E family)

| Check | Expected output |
| --- | --- |
| `GET /api/admin/jobs/stats` (admin key) | 200, job counts, source health |
| `POST /api/admin/jobs/refresh` | 200, new jobs ingested, no email side effects |
| `POST .../email-preview` | 200, `jobCount` > 0 when DB has jobs |
| `send-digest` `dry_run` | `sentCount=0`, `recipientCount` ≥ 0 |
| `send-digest` `live` | **403** while `JOB_MAIL_ENABLED=false` |
| `send-digest` `test` | `sentCount=1`, only test inbox; **0** student roster sends |
| Production Brevo | Inbox received; sender = `EMAIL_FROM_ADDRESS` |

Scripts: `backend/scripts/proof_job_refresh.py`, `proof_job_email_flow.py`, `proof_prod_brevo.py`.

### CI (24D)

```bash
python -m unittest discover -s backend/tests -p "test_sandbox_smoke.py" -v
```

All 13 tests green on `ubuntu-latest`. Verified: PR #77 merge commit `e0189c8947f71470b34befabd189af5450cf297b`, Actions run `28291205306` (`Ran 13 tests … OK`).

### Frontend redesign phases

- Before/after screenshot or screen recording for changed routes  
- `npm run qa:practice-smoke` after `npm run dev:all` when student nav touched  
- No regression on `/practice/code`, `/practice/sql`, `/practice/typing` execution  
- Accessibility spot-check: focus order, labels, contrast on changed surfaces  

### New modules (Library / Aptitude)

- API contract JSON sample or OpenAPI snippet  
- Student route loads without blank screen  
- Empty, loading, error states demonstrated  
- Admin publish path stubbed or behind feature flag until admin phase  

---

## How to update this file

1. At phase start: add row under **Pending**, link branch name.  
2. At phase end: move to **Completed** only with proof links; update **Current status**.  
3. Log blockers in [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md).  
4. Cross-link module detail in [MODULE_BACKLOG.md](./MODULE_BACKLOG.md).

---

_Related: [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md) · [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) · [LAUNCH.md](./LAUNCH.md)_
