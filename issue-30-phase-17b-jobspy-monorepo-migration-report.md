# Issue #30 — Phase 17B: JobSpy Monorepo Migration Report

Planning document only. No JobSpy code has been migrated in this phase.

Related repos:

- CodeQuest: https://github.com/gaganpasupuleti/learn-coding-through
- JobSpy (current separate service): https://github.com/gaganpasupuleti/JobSpy

---

## A. Summary

CodeQuest should **continue using the existing external JobSpy API** for now. The student Job Board (`JobSpyPage`, `src/lib/jobspy-api.ts`) and admin JobSpy Ops panel already call JobSpy on port **8001** via the Vite proxy (`/jobs-api` → `http://127.0.0.1:8001`).

Later, the **JobSpy backend should move into the CodeQuest monorepo as a separate service** under `services/jobspy/`, not as part of the main CodeQuest FastAPI app.

This migration must be **selective**:

- **Do not** copy the full JobSpy repository.
- **Do not** migrate the old JobSpy React frontend (CodeQuest already owns the student UI).
- **Do not** merge JobSpy routes, models, or scraper dependencies directly into `backend/` (CodeQuest main API on port 8000).

Phase 17A (Spicy Jobs Board frontend fixes) should merge before implementation phases 17C+ begin.

---

## B. Recommended Strategy

### Near term

**Keep JobSpy as a separate repo/service** until Phase 17A is merged and connected smoke tests pass against a running JobSpy API (PostgreSQL + port 8001).

### Long term

**Manual selective migration** into:

```
services/jobspy/backend
services/jobspy/worker
services/jobspy/scraper
```

### Do not use git subtree

Git subtree is **not recommended** because it tends to pull:

- The old **frontend/** SPA (duplicate of CodeQuest Job Board)
- **Generated CSV exports** and one-off scrape artifacts
- **Old deployment files** (Dockerfile stages that bundle frontend + API, Railway configs)
- **Standalone auth/UI baggage** (JobSpy login page, test student accounts)
- Large history that is **harder to trim safely** without subtree maintenance pain

Manual copy lets us drop SPA mounting, rename env vars to `JOBSPY_*`, and keep Alembic isolated.

---

## C. Future Target Structure

```
services/
  jobspy/
    backend/          # FastAPI app (port 8001)
    worker/           # run_worker.py CLI + scheduled scrape jobs
    scraper/          # python-jobspy library (indeed, linkedin, naukri, …)
    README.md         # Setup, env, ports, smoke commands
```

**Division of responsibility:**

| Layer | Owner |
|---|---|
| Student Job Board UI | CodeQuest frontend only (`src/components/jobspy/`, `JobSpyPage.tsx`) |
| Scraping, PostgreSQL, job APIs, worker, tagging | JobSpy service under `services/jobspy/` |
| Integration | CodeQuest calls JobSpy through **API + Vite proxy** (`/jobs-api`) or `VITE_JOBS_API_URL` in production |

CodeQuest **main backend** (`backend/` on port 8000) remains separate. It has its own native `job_posts` / `job_applications` tables for a future batch job portal — that is **not** the same as JobSpy scraped `jobs`.

---

## D. Files To Migrate Later

| JobSpy Path | Purpose | Future CodeQuest Target | Notes |
|---|---|---|---|
| `backend/app/main.py` | FastAPI entry | `services/jobspy/backend/app/main.py` | Remove SPA/static mount |
| `backend/app/api/jobs.py` | List, detail, apply, save | same | Preserve API contract for `jobspy-api.ts` |
| `backend/app/api/meta.py` | Roles, locations, bands, sites | same | Filter metadata |
| `backend/app/api/dashboard.py` | Stats, background scrape | same | JobSpy Ops |
| `backend/app/api/admin.py` | Scrape runs, profiles | same | Admin key required |
| `backend/app/api/admin_jobs.py` | Retag, verify-links, backfill | same | Ops/maintenance |
| `backend/app/api/tagging.py` | Manual tagging queue | same | Future admin UI in CodeQuest |
| `backend/app/api/deps.py` | Admin key, optional student | same | Trim standalone auth later |
| `backend/app/db/models.py` | Job board schema (UUID jobs) | same | PostgreSQL |
| `backend/app/db/session.py` | SQLAlchemy session | same | |
| `backend/app/schemas/*` | Pydantic DTOs | same | jobs, meta, dashboard, tagging, admin |
| `backend/app/services/*` | Scraper, ingest, tagger, worker, etc. | same | Keep isolated deps |
| `backend/app/seed/*` | Roles, locations, 1080 search profiles | same | Dev seed only |
| `backend/alembic/*` | Migrations 001–005 | `services/jobspy/backend/alembic/` | **Separate from CodeQuest Alembic** |
| `backend/requirements.txt` | Python dependencies | same | pandas, tls-client, etc. |
| `jobspy/` | Scraper library package | `services/jobspy/scraper/jobspy/` | `from jobspy import scrape_jobs` |
| `run_worker.py` | Worker CLI | `services/jobspy/worker/run_worker.py` | Update PYTHONPATH |

**Rewrite / trim during migration (not blind copy):**

- `backend/app/api/auth.py` — CodeQuest 17A uses `session_id`; standalone JWT login likely retired
- `backend/app/main.py` — drop `_mount_frontend()` and static SPA serving
- `backend/Dockerfile` — new image: API + worker only, no Node frontend stage

---

## E. Files To Not Migrate

| JobSpy Path | Reason |
|---|---|
| `frontend/` | CodeQuest is the only student UI |
| `backend/.env` | Secrets — never copy |
| `backend/static/` | Built SPA tied to old frontend |
| `hyd_data_analytics_*.csv`, `scripts/source_jobs_*.csv`, `exports/` | Generated scrape dumps, not runtime |
| `run_hyd_fresher_scrape.py` | One-off script; document as sample only if needed |
| `frontend/Dockerfile`, `frontend/railway.toml` | Frontend retired |
| `RAILWAY.md`, `railway.toml`, `backend/railway*.toml` | Revisit in deployment phase 17I |
| `.github/workflows/publish-to-pypi.yml` | Only if still publishing package separately |
| Standalone auth UI / login page | Not used by CodeQuest |
| Production `DATABASE_URL` values | Never copy into repo |

---

## F. Backend/API Migration Plan

| Phase | Scope |
|---|---|
| **17B** | This report (planning only) |
| **17C** | Create `services/jobspy/` skeleton + README |
| **17D** | Move JobSpy backend API (preserve `/api/v1/*` paths) |
| **17E** | Move scraper library and worker CLI |
| **17F** | Move Alembic, seed data, dev Postgres compose |
| **17G** | Update `dev-all.ps1`, docs, `qa:jobspy-smoke` |
| **17H** | Confirm CodeQuest is the only frontend; retire JobSpy SPA concept |
| **17I** | Deploy monorepo JobSpy service; archive old repo after stability |

**Rules for 17D:**

- Do **not** register JobSpy routes in CodeQuest `backend/app/main.py`.
- Keep **separate process** on port **8001**.
- Preserve existing endpoints so `src/lib/jobspy-api.ts` needs minimal changes.
- Admin ops continue to use `X-Admin-Key` header.

---

## G. Scraper/Worker Migration Plan

1. Move the **`jobspy/`** Python package into `services/jobspy/scraper/`.
2. Move **`run_worker.py`** into `services/jobspy/worker/` and fix import paths.
3. Keep **heavy dependencies** (pandas, numpy, tls-client, beautifulsoup4) in `services/jobspy/backend/requirements.txt` only — **not** in CodeQuest main `backend/requirements.txt` or frontend.
4. Worker commands (document in README):
   - `python services/jobspy/worker/run_worker.py --once --limit 5`
   - `python ... --verify-links --verify-limit 200`
5. Scraping stays **backend-only**; no scrape triggers from the student frontend without admin key.
6. Respect job-board **ToS and rate limits** (429 handling, optional proxies later).

---

## H. Database / Migration Plan

- JobSpy keeps **PostgreSQL** (UUID primary keys, JSON columns).
- **Do not** merge JobSpy tables into CodeQuest SQLite `career_portal.db` or native `job_posts`.
- Keep JobSpy **Alembic migrations separate** from CodeQuest `backend/alembic/`.
- Use **`JOBSPY_DATABASE_URL`** (backend-only) — never expose to frontend.
- Production: separate Postgres instance (e.g. Railway plugin) for JobSpy only.
- If migrating from old JobSpy deployment: `pg_dump` / restore to new JobSpy Postgres — not into CodeQuest main DB.

**JobSpy tables (representative):** `jobs`, `role_categories`, `locations`, `experience_bands`, `search_profiles`, `scrape_runs`, `saved_jobs`, `applications`, optional `students`.

**CodeQuest tables (separate product):** `job_posts`, `job_applications` — batch/eligibility portal, unfinished student UI.

---

## I. Config / Env Plan

### Backend-only (JobSpy service)

| Variable | Purpose |
|---|---|
| `JOBSPY_DATABASE_URL` | PostgreSQL connection |
| `JOBSPY_ADMIN_API_KEY` | Scrape ops, tagging, dashboard refresh |
| `JOBSPY_CORS_ORIGINS` | CodeQuest frontend origins |
| `JOBSPY_DEFAULT_SITES` | e.g. `indeed,linkedin,naukri,foundit` |
| `JOBSPY_SCRAPE_SLEEP_SECONDS` | Rate limiting between profiles |
| `JOBSPY_DEFAULT_RESULTS_WANTED` | Jobs per profile scrape |
| `JOBSPY_DEFAULT_HOURS_OLD` | Freshness filter |
| `JOBSPY_LINK_VERIFY_*` | Link verification tuning (optional) |

Optional / likely retired: `JOBSPY_AUTH_SECRET` (only if keeping standalone JWT student auth).

### CodeQuest frontend (existing)

| Variable | Purpose |
|---|---|
| `VITE_JOBS_API_URL` | Production JobSpy API origin |
| `VITE_JOBS_API_PROXY_TARGET` | Dev proxy target (`http://127.0.0.1:8001`) |
| `VITE_JOBS_ADMIN_API_KEY` | Optional local default for JobSpy Ops (prefer browser-stored key) |

### Warning

**Never** expose in frontend build or runtime config:

- `DATABASE_URL` / Postgres credentials
- `JOBSPY_ADMIN_API_KEY` in production builds (use admin UI + session storage or server-side proxy later)
- `AUTH_SECRET` or production secrets

---

## J. Dev Workflow Plan

### Before migration (current)

1. Start **JobSpy backend** separately on port **8001** (requires PostgreSQL).
2. Start **CodeQuest** frontend (`npm run dev`, port 5000) and main API (port 8000).
3. Vite proxies **`/jobs-api`** → `http://127.0.0.1:8001`.
4. Smoke: `npm run qa:jobspy-smoke`.

### After migration (target)

1. `services/jobspy/backend` → uvicorn on **8001**.
2. Optional `docker compose` under `services/jobspy/` for dev Postgres.
3. `services/jobspy/worker` → manual or scheduled scrape runs.
4. CodeQuest frontend and main backend unchanged.
5. Update `scripts/dev-all.ps1` (17G) to optionally start JobSpy service.

**Note:** CodeQuest `backend/app/core/config.py` still references `resume_backend_port: 8001` from a removed resume module — rename or remove during 17G to avoid port confusion.

---

## K. Deployment Plan

Future deployment (phase **17I**):

| Component | Deployment |
|---|---|
| CodeQuest frontend | Existing host; `VITE_JOBS_API_URL` points to JobSpy service |
| CodeQuest API (`backend/`) | Port 8000 service — **no JobSpy secrets** |
| JobSpy API | Separate service built from `services/jobspy/backend/Dockerfile` (no frontend stage) |
| JobSpy worker | Railway cron or worker service running `run_worker.py` |
| JobSpy Postgres | Separate database; `JOBSPY_DATABASE_URL` on JobSpy service only |

Secrets live **only** in the JobSpy service environment. After production stability, **archive** the old JobSpy repo with a README pointer to `services/jobspy/` in CodeQuest.

---

## L. Risks

| Risk | Mitigation |
|---|---|
| **Two job systems confusion** (`job_posts` vs scraped `jobs`) | Document clearly; separate APIs and UI surfaces |
| **PostgreSQL required for local dev** | Add dev `docker-compose.yml` under `services/jobspy/` |
| **Scraper ToS / rate limits (429)** | Backend-only worker; admin-triggered scrapes; optional proxies later |
| **Secret leakage** | `JOBSPY_*` backend-only; never in `VITE_*` or committed `.env` |
| **Alembic collision** | Never merge JobSpy migrations into CodeQuest `backend/alembic/` |
| **API contract break** | Preserve `/api/v1/*`; run `npm run qa:jobspy-smoke` after each phase |
| **Heavy Python dependencies** | Isolate in `services/jobspy/backend/requirements.txt` |
| **Phase 17A not merged** | Complete 17A PR before starting 17C |

---

## M. Final Recommendation

**Do not start phase 17C** until:

1. Phase **17A** Job Board frontend fixes are **committed** and **PR is opened/merged**.
2. JobSpy API integration strategy is **confirmed** (external service → monorepo service, same API contract).
3. **Connected smoke** is completed using an active JobSpy API (local PostgreSQL + port 8001, or deployed JobSpy URL).

This report is **planning only**. No JobSpy code, secrets, frontend, or `services/jobspy/` directory has been created in Phase 17B.
