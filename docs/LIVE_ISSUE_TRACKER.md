# Code Quest — Live Issue Tracker

**Last updated:** 2026-06-28  
**Maintainer:** Update on every phase branch; link PRs and proof artifacts.

This is the **operational** issue list. Strategic sequencing lives in [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md).

---

## Current status

| Severity | Open | In progress | Verified fixed |
| --- | ---: | ---: | ---: |
| P0 — blocks release/CI | 0 | 0 | 1 |
| P1 — user-facing / admin | 0 | 0 | 5 |
| P2 — polish / debt | 3 | 1 | 1 |

**P0 verified fixed (CI):** ISSUE-001 Sandbox Smoke — Phase 24D PR #77 + PR #86 Java warm-up; `main` run `28299100814` green.

**P1 verified fixed (Jobs/email family):** 24A–24G ingestion, safety, transport, Email Station, premium digest, Jobs Radar digest.

**In progress:** ISSUE-003 dual-frontend drift — partial relief via 25C shell polish; full fix deferred to continued 25C / 21A.

---

## Locked decisions

- Issues are **closed only with output proof** (CI log, API response, screenshot, inbox).
- **Projects section:** no new issues filed for feature requests — section frozen; only P0 production breakages.
- **Jobs/email:** no live-send issues until `JOB_MAIL_ENABLED` phase; track safety regressions as P0.
- **Progress Tracker:** no redesign tickets; bug fixes need explicit phase owner.
- **PR merge safety rule is mandatory** — [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md).

---

## Active issues

### ISSUE-003 — Dual frontend auth/session drift

| Field | Value |
| --- | --- |
| **Severity** | P2 |
| **Status** | In progress (partial) |
| **Component** | Main app `:5000` vs frontend-kit `:3000` |
| **Symptom** | localStorage auth not shared across origins; kit logout not production-grade |
| **Progress** | 25C merged (PR #85) — `StudentShell` + dashboard polish on main app |
| **Fix phase** | Continued `phase-25c-frontend-shell-integration`, `phase-21a-auth-logout-wiring` |
| **Proof required** | Single-origin student shell; logout clears session; smoke login/logout |

---

### ISSUE-004 — Projects section frozen — enhancement requests deferred

| Field | Value |
| --- | --- |
| **Severity** | P2 (process) |
| **Status** | **LOCKED** |
| **Policy** | No new Projects features until frontend master redesign completes and Projects explicitly unlocked |
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
| **FIX-24A** | Jobs ingestion + admin refresh + student listing | 24A | PR #74 |
| **FIX-24B** | Email preview, dry_run, test-only, live 403 | 24B | PR #75 |
| **FIX-24C** | Brevo HTTPS transport | 24C | PR #76; `proof_prod_brevo_output.txt` |
| **FIX-24D** | Sandbox Smoke CI (JVM + cold-start flake) | 24D | PR #77 + PR #86; `main` run `28299100814` — 13/13 OK |
| **FIX-24E** | Admin Email Station client-ready digest | 24E | PR #78; `proof_prod_24e_output.txt` |
| **FIX-24F** | Premium digest redesign | 24F | PR #81; unit tests + local HTML preview |
| **FIX-24G** | Jobs Radar portal-style digest | 24G | PR #84; `proof_prod_24g` — 30/30 checks; test `sentCount=1`, student sends **0** |

### ISSUE-001 — Sandbox Smoke CI fails (Java cold-start / timeout flake) — **VERIFIED FIXED**

| Field | Value |
| --- | --- |
| **Severity** | P0 (was) |
| **Status** | **Verified fixed** |
| **Phase** | 24D |
| **PRs** | #77 merged (`RLIMIT_AS` JVM fix); #86 merged (Java toolchain warm-up step) |
| **Proof** | Post-merge `main` run `28299100814` on commit `4d7a4a0c` — `test_java_compile_error_is_structured … ok`, `Ran 13 tests … OK` |
| **Fix** | Executor skips `RLIMIT_AS` for JVM; workflow warm-up compiles/runs trivial Java before timed smoke tests |

### ISSUE-002 — Admin Email Station post-deploy smoke incomplete — **VERIFIED FIXED**

| Field | Value |
| --- | --- |
| **Severity** | P2 (was) |
| **Status** | **Verified fixed** |
| **Phase** | 24E → 24G |
| **PRs** | #78, #81, #84 |
| **Proof** | Production preview 200 + summary; dry_run `sentCount=0`; live 403; test `sentCount=1`; `student_emails_sent: 0` |
| **Admin UI** | Email Station: Jobs Radar KPI labels, preview, dry run, test send, live blocked |

---

## Pending work (not issues — planned phases)

| Item | Tracker |
| --- | --- |
| Docs refresh for Cursor continuity | `phase-25a-project-roadmap-live-tracker` (this phase) |
| Frontend shell rollout (continued) | [FRONTEND_REDESIGN_MASTER_PLAN.md](./FRONTEND_REDESIGN_MASTER_PLAN.md) — 25C next pages |
| Library module | [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |
| Aptitude module | [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) |

---

## Risks

| Risk | Issue link | Notes |
| --- | --- | --- |
| Sandbox Smoke regression | FIX-24D | Re-run workflow on backend PRs; do not silence tests |
| Closing email issues without inbox proof | FIX-24C–24G | Keep `student_emails_sent: 0` in proof scripts |
| Projects scope creep via “small fixes” | ISSUE-004 | Route to MODULE_BACKLOG or post-25c |
| Stale PR merge | Process | PR merge safety rule — [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md) |

---

## Next branch order

1. `phase-25a-project-roadmap-live-tracker` — docs (current)  
2. `phase-25c-frontend-shell-integration` (continued) — next master-plan pages  
3. `phase-26a-library-module-foundation`  
4. `phase-27a-aptitude-module-foundation`  

---

## Output-based testing requirements

### Per-issue closure checklist

- [ ] Reproduction steps documented  
- [ ] Fix branch named `phase-XXy-short-description`  
- [ ] Proof artifact committed or pasted in PR (`.run/`, `backend/scripts/*_output.txt`, or CI URL)  
- [ ] No unrelated files (Jobs/email/Progress/Projects unless in scope)  
- [ ] Roadmap + this file updated in same PR or immediate follow-up  
- [ ] **PR merge safety** checklist completed before merge  

### CI (Sandbox Smoke — regression guard)

```bash
python -m unittest discover -s backend/tests -p "test_sandbox_smoke.py" -v
# Expect: 13 tests, 0 failures, on ubuntu-latest
# Verified main: Actions run 28299100814
```

### Jobs/email regression (any backend touch near jobs)

```bash
cd backend && python -m unittest tests.test_job_email_flow -v
```

### Frontend (redesign)

```bash
npm run dev:all
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

_Related: [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) · [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) · [CODE_QUEST_ENGINEERING_RULES.md](./CODE_QUEST_ENGINEERING_RULES.md)_
