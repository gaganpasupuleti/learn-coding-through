# Code Quest — Live Issue Tracker

**Last updated:** 2026-06-27  
**Maintainer:** Update on every phase branch; link PRs and proof artifacts.

This is the **operational** issue list. Strategic sequencing lives in [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md).

---

## Current status

| Severity | Open | In progress | Verified fixed |
| --- | ---: | ---: | ---: |
| P0 — blocks release/CI | 1 | 0 | 0 |
| P1 — user-facing / admin | 0 | 0 | 3 |
| P2 — polish / debt | 4 | 1 | 0 |

**P1 verified fixed (Jobs/email family):** 24A ingestion, 24B safety modes, 24C Brevo transport — see proof table below.

---

## Locked decisions

- Issues are **closed only with output proof** (CI log, API response, screenshot, inbox).
- **Projects section:** no new issues filed for feature requests — section frozen; only P0 production breakages.
- **Jobs/email:** no live-send issues until `JOB_MAIL_ENABLED` phase; track safety regressions as P0.
- **Progress Tracker:** no redesign tickets; bug fixes need explicit phase owner.

---

## Active issues

### ISSUE-001 — Sandbox Smoke CI fails (Java / JDK / RLIMIT_AS)

| Field | Value |
| --- | --- |
| **Severity** | P0 |
| **Status** | Open |
| **Branch** | `phase-24d-ci-sandbox-smoke-stabilization` |
| **Component** | `.github/workflows/sandbox-smoke.yml`, `backend/executors/common.py` (context) |
| **Symptom** | `Sandbox Smoke` workflow red on `main` when Java tests run on `ubuntu-latest` |
| **Root cause** | JVM reserves >1GB virtual address space; executor `RLIMIT_AS=384MB` prevents `javac` start on Linux CI |
| **Unrelated to** | Jobs, email, Progress Tracker, Projects |
| **Fix approach** | Workflow env: `JAVA_TOOL_OPTIONS` + `MALLOC_ARENA_MAX` (see `.run/pr-24d-body.md`) |
| **Proof required** | GitHub Actions run: all 13 `test_sandbox_smoke.py` tests pass |

**Not verified fixed** until merged to `main` and workflow green.

---

### ISSUE-002 — Admin Email Station post-deploy smoke incomplete

| Field | Value |
| --- | --- |
| **Severity** | P2 |
| **Status** | Open |
| **Branch** | `phase-24e-admin-email-station-client-ready-digest` |
| **Component** | Admin Job Refresh Dashboard / Email Station UI |
| **Symptom** | PR checklist items for browser smoke and post-deploy Brevo test unchecked |
| **Proof required** | Admin UI: preview, summary cards, dry run, test send, live button blocked; production test `sentCount=1` |

---

### ISSUE-003 — Dual frontend auth/session drift

| Field | Value |
| --- | --- |
| **Severity** | P2 |
| **Status** | Documented / deferred |
| **Component** | Main app `:5000` vs frontend-kit `:3000` |
| **Symptom** | localStorage auth not shared across origins; kit logout not production-grade |
| **Fix phase** | `phase-21a-auth-logout-wiring`, `phase-25c-frontend-shell-integration` |
| **Proof required** | Single-origin student shell; logout clears session; smoke login/logout |

---

### ISSUE-004 — Projects section frozen — enhancement requests deferred

| Field | Value |
| --- | --- |
| **Severity** | P2 (process) |
| **Status** | **LOCKED** |
| **Policy** | No new Projects features until frontend master redesign completes |
| **Allowed** | P0 production breakage fixes only, with minimal diff |
| **Proof required** | Regression smoke: Projects list + ProjectLearningPage load |

---

### ISSUE-005 — Historical phases lack Phase 25A re-verification

| Field | Value |
| --- | --- |
| **Severity** | P2 |
| **Status** | Open (meta) |
| **Symptom** | SQL, Code Workbench, typing, Power BI, etc. shipped pre-tracker without fresh prod proof |
| **Mitigation** | Re-run `npm run qa:practice-smoke` before claiming “verified” in roadmap |
| **Owner phase** | TBD — optional `phase-25x-baseline-smoke-audit` |

---

## Completed / verified (with proof)

| ID | Title | Phase | Proof |
| --- | --- | --- | --- |
| **FIX-24A** | Jobs ingestion + admin refresh + student listing | 24A | PR #74; Railway/local refresh; student Jobs page loads |
| **FIX-24B** | Email preview, dry_run, test-only, live 403 | 24B | PR #75; `.run/pr-24b-body.md` HTTP table; unit tests |
| **FIX-24C** | Brevo HTTPS transport | 24C | PR #76; `proof_prod_brevo_output.txt` — test delivered, live blocked, 0 student sends |

---

## Pending work (not issues — planned phases)

| Item | Tracker |
| --- | --- |
| Live roadmap docs | Phase 25A (this PR) |
| Frontend master redesign | [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) |
| Library module | [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |
| Aptitude module | [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |

---

## Risks

| Risk | Issue link | Notes |
| --- | --- | --- |
| Merging with red CI | ISSUE-001 | Masks future backend regressions |
| Closing email issues without inbox proof | FIX-24C | Keep `student_emails_sent: 0` in proof scripts |
| Projects scope creep via “small fixes” | ISSUE-004 | Route to MODULE_BACKLOG or post-25c |

---

## Next branch order

1. `phase-25a-project-roadmap-live-tracker` — establishes this tracker  
2. `phase-24d-ci-sandbox-smoke-stabilization` — close ISSUE-001  
3. `phase-24e-admin-email-station-client-ready-digest` — close ISSUE-002  
4. `phase-25b-frontend-redesign-plan` — address ISSUE-003 strategy  
5. Module foundations per [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)  

---

## Output-based testing requirements

### Per-issue closure checklist

- [ ] Reproduction steps documented  
- [ ] Fix branch named `phase-XXy-short-description`  
- [ ] Proof artifact committed or pasted in PR (`.run/`, `backend/scripts/*_output.txt`, or CI URL)  
- [ ] No unrelated files (Jobs/email/Progress/Projects unless in scope)  
- [ ] Roadmap + this file updated in same PR or immediate follow-up  

### CI (ISSUE-001)

```bash
python -m unittest discover -s backend/tests -p "test_sandbox_smoke.py" -v
# Expect: 13 tests, 0 failures, on Linux with 24D env vars
```

### Jobs/email regression (any backend touch near jobs)

```bash
cd backend && python -m unittest tests.test_job_email_flow -v
# Optional production: python scripts/proof_prod_brevo.py (secrets via env only)
```

### Frontend (ISSUE-002, redesign)

```bash
npm run dev:all
# Manual: Admin → Job Refresh → Email Station — preview, dry run, test, live blocked
npm run qa:practice-smoke   # when student routes touched
```

---

## Issue template (copy for new entries)

```markdown
### ISSUE-NNN — Title

| Field | Value |
| --- | --- |
| **Severity** | P0 / P1 / P2 |
| **Status** | Open / In progress / Verified fixed |
| **Branch** | phase-XXy-... |
| **Component** | path or feature |
| **Symptom** | what users/CI see |
| **Proof required** | exact command or screenshot |
```

---

_Related: [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) · [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md)_
