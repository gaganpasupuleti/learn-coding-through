# Code Quest — Engineering Rules

**Last updated:** 2026-06-28  
**Purpose:** Cross-cutting rules for every Cursor session, phase branch, and PR. Strategic sequencing lives in [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md).

---

## PR merge safety rule (mandatory)

Before merging **any** PR into `main`:

1. **Fetch** latest `origin/main`.
2. **Confirm** whether `main` has advanced since the branch was last rebased/merged.
3. **If `main` advanced:** update the branch (`rebase` or `merge` from `origin/main`), then:
   - re-run the **exact** tests required for that phase;
   - re-check the **diff scope** (only intended files).
4. **Only then merge.**

A green PR check alone is insufficient if `main` moved underneath the branch.

### Proof in PR bodies

```markdown
## Pre-merge hygiene
- [ ] Fetched `origin/main` at: <commit sha>
- [ ] Branch up to date with `main`: yes / rebased at <sha>
- [ ] Tests re-run after rebase: <command + result>
- [ ] Diff scope: <file list or "N files, CI/docs only">
```

---

## Scope boundaries (default deny)

Unless a phase **explicitly** names the area, do **not** change:

| Area | Policy |
| --- | --- |
| **Projects section** | **LOCKED / FROZEN** — P0 production breakage only |
| **Progress Tracker** | No layout or data-model changes |
| **Jobs ingestion / scraper** | No changes without Jobs phase |
| **Jobs / email logic** | No changes without email phase; `JOB_MAIL_ENABLED=false` unless signed phase |
| **Practice engines** | `/practice/code`, `/practice/sql`, `/practice/typing`, Power BI runners |
| **Railway deploy workflows** | No changes without infra phase |
| **Secrets** | Never commit `.env`, API keys, passwords |

---

## Change discipline

| Rule | Source |
| --- | --- |
| **Smallest safe diff** — no drive-by refactors | Ponytail |
| **High-signal decisions** — YES / NO / DEFER at top of PR | Caveman |
| **Product → architecture → risk → docs** in every redesign PR | GStack |
| **No new npm/pip dependencies** without approved phase + PR justification | Roadmap locked decision |
| **Completion = verified output** — API JSON, CI green, inbox, screenshots | All phases |

Persona detail: [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md).

---

## Default test gates

### Frontend touched

```bash
npm run build
npm run lint
```

When student nav or shell changes:

```bash
npm run dev:all
npm run qa:practice-smoke
```

### Backend touched

```bash
cd backend && python -m unittest discover -s tests -v
```

### Backend + sandbox executors

```bash
cd backend && python -m unittest discover -s tests -p "test_sandbox_smoke.py" -v
```

Expect **13 tests, OK** on `ubuntu-latest` (Sandbox Smoke workflow).

### Jobs / email phases

```bash
cd backend && python -m unittest tests.test_job_email_flow -v
```

Production proof scripts (env secrets only — never commit):  
`proof_prod_brevo.py`, `proof_prod_24e.py`, `proof_prod_24f.py`, `proof_prod_24g.py`.

---

## Documentation hygiene

At phase end, update in the **same PR or immediate follow-up**:

- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) — status + completed/pending tables  
- [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md) — close issues with proof links  
- [MODULE_BACKLOG.md](./MODULE_BACKLOG.md) — if module scope changed  

---

## Main app vs sandbox kit

- **Production source of truth:** main app (`src/`, port 5000).  
- **Experimental kit:** `codequest-frontend-kit/` per [FRONTEND_SANDBOX_CONTRACT.md](./FRONTEND_SANDBOX_CONTRACT.md).  
- Do not treat kit auth/session as production-grade until integrated in a named shell phase.

---

_Related: [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) · [LIVE_ISSUE_TRACKER.md](./LIVE_ISSUE_TRACKER.md) · [FRONTEND_REDESIGN_RULES.md](./FRONTEND_REDESIGN_RULES.md) · [MODULE_BACKLOG.md](./MODULE_BACKLOG.md)_
