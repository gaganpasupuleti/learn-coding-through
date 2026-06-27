# Code Quest — Live Issue Tracker

**Last updated:** 2026-06-27  
**Maintainer:** Update on every phase branch; link PRs and proof artifacts.

This is the **operational** issue list. Strategic sequencing lives in [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md).

---

## Current status

| Severity | Open | In progress | Verified fixed |
| --- | ---: | ---: | ---: |
| P0 — blocks release/CI | 0 | 0 | 1 |
| P1 — user-facing / admin | 0 | 0 | 3 |
| P2 — polish / debt | 3 | 0 | 1 |

**P1 verified fixed (Jobs/email family):** 24A ingestion, 24B safety modes, 24C Brevo transport, 24E Email Station — see proof table below.

**P0 verified fixed (CI):** ISSUE-001 Sandbox Smoke — Phase 24D merged (PR #77).

---

## Locked decisions

- Issues are **closed only with output proof** (CI log, API response, screenshot, inbox).
- **Projects section:** no new issues filed for feature requests — section frozen; only P0 production breakages.
- **Jobs/email:** no live-send issues until `JOB_MAIL_ENABLED` phase; track safety regressions as P0.
- **Progress Tracker:** no redesign tickets; bug fixes need explicit phase owner.

---

## Active issues

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
| **FIX-24D** | Sandbox Smoke CI (Java/JVM under `RLIMIT_AS`) | 24D | PR #77 merged (`e0189c8947f71470b34befabd189af5450cf297b`); Actions run `28291205306` — 13/13 `test_sandbox_smoke.py` pass on `ubuntu-latest` |
| **FIX-24E** | Admin Email Station client-ready digest | 24E | PR #78 merged (`4a18596ec8a847f59168b2effba4fe71d93dd59e`); `proof_prod_24e_output.txt` — preview + summary, dry_run 0 sent, live 403, test `sentCount=1`, student sends 0 |

### ISSUE-001 — Sandbox Smoke CI fails (Java / JDK / RLIMIT_AS) — **VERIFIED FIXED**

| Field | Value |
| --- | --- |
| **Severity** | P0 (was) |
| **Status** | **Verified fixed** |
| **Phase** | 24D |
| **PR** | #77 merged |
| **Merge commit** | `e0189c8947f71470b34befabd189af5450cf297b` |
| **Proof** | GitHub Actions run `28291205306` — `Ran 13 tests in 8.064s` → `OK` on `ubuntu-latest` |
| **Fix** | Java executor skips `RLIMIT_AS` for JVM subprocesses; workflow `JAVA_TOOL_OPTIONS`/`MALLOC_ARENA_MAX` as CI optimization |

### ISSUE-002 — Admin Email Station post-deploy smoke incomplete — **VERIFIED FIXED**

| Field | Value |
| --- | --- |
| **Severity** | P2 (was) |
| **Status** | **Verified fixed** |
| **Phase** | 24E |
| **PR** | #78 merged |
| **Merge commit** | `4a18596ec8a847f59168b2effba4fe71d93dd59e` |
| **Proof** | `proof_prod_24e_output.txt` — preview HTTP 200 + summary counts; dry_run `sentCount=0`; live HTTP 403; test `sentCount=1` to test recipient only; `student_emails_sent: 0` |
| **Unit tests** | `tests.test_job_email_flow` — 20/20 pass |
| **Admin UI** | Email Station: preview, summary cards, dry run, test send, live button blocked (`JOB_MAIL_ENABLED=false`) |

---

## Pending work (not issues — planned phases)

| Item | Tracker |
| --- | --- |
| Frontend master redesign | [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) — next: `phase-25b-frontend-redesign-plan` |
| Library module | [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |
| Aptitude module | [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |

---

## Risks

| Risk | Issue link | Notes |
| --- | --- | --- |
| Sandbox Smoke regression | FIX-24D | Re-run workflow on backend PRs; do not silence tests |
| Closing email issues without inbox proof | FIX-24C | Keep `student_emails_sent: 0` in proof scripts |
| Projects scope creep via “small fixes” | ISSUE-004 | Route to MODULE_BACKLOG or post-25c |

---

## Next branch order

1. `phase-25b-frontend-redesign-plan` — address ISSUE-003 strategy  
2. Module foundations per [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)  

---

## Output-based testing requirements

### Per-issue closure checklist

- [ ] Reproduction steps documented  
- [ ] Fix branch named `phase-XXy-short-description`  
- [ ] Proof artifact committed or pasted in PR (`.run/`, `backend/scripts/*_output.txt`, or CI URL)  
- [ ] No unrelated files (Jobs/email/Progress/Projects unless in scope)  
- [ ] Roadmap + this file updated in same PR or immediate follow-up  

### CI (Sandbox Smoke — regression guard)

```bash
python -m unittest discover -s backend/tests -p "test_sandbox_smoke.py" -v
# Expect: 13 tests, 0 failures, on ubuntu-latest (verified run 28291205306)
```

### Jobs/email regression (any backend touch near jobs)

```bash
cd backend && python -m unittest tests.test_job_email_flow -v
# Optional production: python scripts/proof_prod_24e.py (secrets via env only)
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
