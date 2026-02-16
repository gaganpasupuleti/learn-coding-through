# Pending Tasks Roadmap (Target: Sunday Demo)

## Objective
Ship a testable, secure MVP by Sunday with:
- Auth + credits backend flow
- Hosted backend + temporary frontend URL wiring
- Core security hardening
- Resume Analyzer + Builder integration
- Job Portal frontend mapped to your jobs API schema

---

## Priority Order (Most Important First)

### Stage 1 — Demo-Critical Foundation (P0)
**Goal:** Get stable login, credits storage, and deployable backend/frontend connectivity.

- [x] Finalize auth data model (users, sessions/tokens, credit ledger)
- [x] Add DB schema + migrations for login + credit storage
- [x] Implement/verify auth APIs (register, login; refresh/logout pending)
- [x] Implement credit APIs (balance, debit/credit event history)
- [x] Add role-safe backend config for prod/staging env vars
- [ ] Deploy backend (temporary host URL)
- [ ] Wire frontend env to backend temp URL and verify all API calls
- [x] End-to-end smoke tests: auth + credits API (roadmap progress + SQL practice execute pending)

**Progress Notes (latest)**
- Added `credit_balance` on users + transaction ledger model with debit/credit types.
- Added credits endpoints: `/api/v1/credits/balance`, `/history`, `/consume`, `/add` (admin).
- Wired credits router in backend app and validated route registration.
- Added Alembic migration scaffold + credit ledger migration for DB-managed rollout.
- Backend changed files compile successfully (`py_compile` exit code `0`).
- Supabase DB migrations applied successfully (`alembic upgrade head`) and DB preflight passed.
- Auth/Credits smoke tests passed: register/login, balance read, consume success, history persistence.
- Negative-path verified: over-consume request returns `400` with `Insufficient credits`.
- Added production safety guards: non-default secret enforcement, no wildcard CORS in production, and `AUTO_CREATE_TABLES=false` requirement.
- Added Railway deployment scaffolding (`railway.toml` + startup script + env checklist in backend README).
- Railway deploy + frontend hosted wiring intentionally deferred to tomorrow (kept pending).

**Definition of Done**
- User can sign up/login, credits persist in DB, and frontend works against hosted backend URL.

---

### Stage 2 — Security Hardening (P0)
**Goal:** Reduce demo and production risk.

- [ ] JWT expiry + refresh policy finalized
- [ ] Password policy + secure hashing verified
- [ ] Input validation + API error normalization across modules
- [ ] CORS restricted for known frontend domains (no wildcard in production)
- [ ] Basic rate limiting on auth + execute endpoints
- [ ] Secrets moved to env (no hardcoded tokens/keys)
- [ ] Security headers and logging hygiene (no sensitive data logs)

**Definition of Done**
- Security checklist passes for auth, execute, and public APIs.

---

### Stage 3 — Resume Analyzer + Builder (P1)
**Goal:** Integrate your existing resume code and expose usable UI/API.

- [ ] Review and import your resume analyzer/builder code
- [ ] Define DB schema for resumes, versions, analysis results
- [ ] Build backend endpoints (upload/parse/analyze/build/export)
- [ ] Build frontend pages/components for:
  - [ ] Upload/parse
  - [ ] Analysis feedback
  - [ ] Builder/editor
  - [ ] Download/export
- [ ] Add basic usage tracking/credits deduction if needed

**Definition of Done**
- User can upload resume, get analysis feedback, edit/build, and export output.

---

### Stage 4 — Job Portal Module (P1)
**Goal:** Display real jobs from your API with clear, filterable UX.

- [ ] Map job API response schema to frontend model
- [ ] Define backend pass-through/cache schema (if needed)
- [ ] Create frontend Job Portal view:
  - [ ] Job list cards/table
  - [ ] Job details panel/page
  - [ ] Basic search/filter/sort
  - [ ] Source + posted date + apply link
- [ ] Add pagination/infinite loading strategy
- [ ] Add fallback/error states + empty states

**Definition of Done**
- Jobs are visible and usable for testing/demo from your API.

---

### Stage 5 — Admin Portal (Faculty) (P1)
**Goal:** Provide faculty/admin workflows to manage students and learning data.

- [ ] Define admin roles/permissions and faculty-only access rules
- [ ] Build backend admin endpoints for:
  - [ ] Student create/update/deactivate
  - [ ] Student profile + cohort/batch assignment
  - [ ] Progress/credits visibility and manual adjustments
  - [ ] Role/roadmap assignment controls
- [ ] Build frontend Admin Portal pages:
  - [ ] Student list and search
  - [ ] Student detail/edit view
  - [ ] Faculty dashboard for key metrics
  - [ ] Basic audit trail/activity log view
- [ ] Add validation and guardrails for admin actions

**Definition of Done**
- Faculty can add/manage students and update essential learning/account details through secured admin flows.

---

### Stage 6 — Final Demo Readiness (P0)
**Goal:** Make Sunday demo stable and clean.

- [ ] Seed demo users + sample data
- [ ] Confirm all critical flows on hosted env:
  - [ ] Login + credits
  - [ ] Career Mapper progression
  - [ ] SQL practice schema + output table
  - [ ] Admin portal (faculty/student management)
  - [ ] Resume module
  - [ ] Job portal
- [ ] Prepare short demo script (3–5 minute walkthrough)
- [ ] Add final README deployment/testing notes

**Definition of Done**
- Demo runs end-to-end without manual fixes during presentation.

---

## Suggested Timeline (Now → Sunday)

### Day 1
- Complete Stage 1 data model + backend hosting URL wiring
- Start Stage 2 security essentials

### Day 2
- Finish Stage 2
- Begin Stage 3 resume module integration

### Day 3
- Complete Stage 3
- Build Stage 4 job portal base UI + API mapping

### Day 4
- Build Stage 5 admin portal base workflows

### Day 5 (Sunday)
- Stage 6 final verification, bug fixes, and demo prep

---

## Required Inputs From You
- Resume analyzer/builder code package/repo
- Job API contract/sample payload + auth details
- Preferred hosting targets (backend + frontend)
- Domain/CORS whitelist for production-like testing

---

## Notes on Importance (My Recommendation)
1. **Auth + credits + hosting + security first** (non-negotiable for demo trust)
2. **Resume module second** (high perceived product value)
3. **Job portal third** (powerful for demo, depends on API mapping quality)

This ordering gives the best chance to finish by Sunday with a stable demo.
