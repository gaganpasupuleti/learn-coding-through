# CodeQuest — Launch checklist

Living document for release readiness: inventory, environment, verification, and known gaps. Update after each polish pass.

## Release

| Field | Value |
| --- | --- |
| Target name | _e.g. v1.0.0_ |
| Target date | _TBD_ |

## Product summary

CodeQuest is a career-acceleration learning platform: students use projects, practice, typing, quizzes, and roadmap tools; admins use an operations dashboard. Auth is role-based (student / admin / demo). See [README.md](../README.md) for full feature list.

## Environment matrix

### Frontend (repo root `.env`)

| Variable | Local dev (recommended) | Production |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Web client ID (optional until Google Sign-In needed) | Same as backend `GOOGLE_OAUTH_CLIENT_ID` |
| `VITE_API_URL` / `VITE_API_BASE_URL` | **Leave empty** so the browser uses same-origin `/api/v1` and Vite proxies to the API | Full API origin, e.g. `https://api.example.com` |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:8000` (Vite dev **server** proxy only; not used as the browser API base) | N/A |
| `VITE_JOBS_API_URL` | **Leave empty** — jobs use the same Code Quest API at `/api/jobs` (same origin as `/api/v1`) | Optional override if jobs API is on a different host; otherwise leave empty |
| `VITE_JOBS_ADMIN_API_KEY` | Optional local default for admin **JobSpy Ops** | **Do not set in production frontend.** Enter `ADMIN_JOB_KEY` in JobSpy Ops UI (browser `localStorage`) |

**Job board:** Student **Jobs** page and admin **Job Refresh Dashboard** call the **Code Quest backend** at `/api/jobs` and `/api/admin/jobs/*`. No separate JobSpy service on port 8001 is required. Ingestion uses `python-jobspy` inside the main API with **India-only** location lock.

**Job Refresh Dashboard (admin):** `GET /api/admin/jobs/stats` returns DB overview, active/expired counts, source health, recent runs, and latest jobs. Manual refresh: `POST /api/admin/jobs/refresh` with `{ profile, sources, runMode }`. Link cleanup: `POST /api/admin/jobs/cleanup-links`. Profiles: `internship_india`, `fresher_india`, `entry_level_india` (auto cron), `experienced_manual_india` (manual only).

#### Railway — jobs (backend service)

| Variable | Required | Notes |
| --- | --- | --- |
| `ADMIN_JOB_KEY` | **Yes in production** | Protects scrape/email admin endpoints via `X-Admin-Key` |
| `JOBSPY_ENABLED` | No (default `true`) | Set `false` to disable scraping |
| `JOBSPY_DEFAULT_COUNTRY` / `JOBSPY_DEFAULT_LOCATION` | No | Defaults: `India` |
| `JOBSPY_HOURS_OLD` | No (default `48`) | **Fallback only** when no prior successful auto refresh exists. Auto cron derives `hours_old` from last successful auto run + 12h overlap. Manual refresh supports 1/3/7/14 day windows via the admin dashboard or `dateRangeDays` on `POST /api/admin/jobs/refresh`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | For email | Required only when sending digests |
| `JOB_MAIL_ENABLED` | No (default `false`) | Must be `true` for non-test student sends |
| `JOB_MAIL_TEST_RECIPIENT` | For cron/test | Test digest recipient |
| `JOB_MAIL_MAX_RECIPIENTS_PER_RUN` | No (default `50`) | Caps live send batch size |

**Start command:** `bash scripts/railway_start.sh` (unchanged) — runs Alembic then Uvicorn.

**Cron (Railway Cron services — create two cron jobs pointing at this backend repo, root `backend/`):**

| Schedule | Command | Purpose |
| --- | --- | --- |
| `0 */8 * * *` (every 8 hours) | `python scripts/run_job_auto_refresh.py` | Auto-refresh `internship_india`, `fresher_india`, `entry_level_india` (India only). Saves new jobs, skips duplicates, exits cleanly. |
| `0 3 * * *` (daily 03:00 UTC) | `python scripts/run_job_link_cleanup.py` | HEAD-check job URLs; mark `expired` / `link_failed` / `unknown` — never deletes rows. |

Local SQLite dev: if Alembic upgrade fails, run `python scripts/ensure_job_schema.py` once.

**Email digests (optional, not enabled by default):** `python scripts/send_job_digest.py` — sends only when `JOB_MAIL_ENABLED=true`.

**Python:** 3.10+ required (`python-jobspy`); Dockerfile uses 3.11-slim.

### Local setup

| Service | Port | Start |
| --- | --- | --- |
| CodeQuest API | **8000** | `npm run dev:all` or Uvicorn from `backend/` |
| CodeQuest frontend | **5000** | Vite (included in `dev:all`) |

Jobs scrape/email admin: set `ADMIN_JOB_KEY` in `backend/.env`, enter the same key in **JobSpy Ops** admin UI.

Smoke: `npm run qa:jobspy-smoke` (optional `JOBS_ADMIN_API_KEY` for dashboard stats).

### Backend (`backend/.env`)

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | SQLite default in dev; PostgreSQL in production |
| `SECRET_KEY` | Strong random value in production |
| `CORS_ORIGINS` | Comma-separated; must include exact browser origins (localhost vs 127.0.0.1) |
| `GOOGLE_OAUTH_CLIENT_ID` | Must match `VITE_GOOGLE_CLIENT_ID` when using Google Sign-In |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | On API startup, creates **or promotes** this user to **admin** (`is_active=true`). Use this for the first admin on a fresh database. |
| `PROMOTE_ADMIN_EMAILS` | Optional comma-separated list. On startup, **existing** users with those emails get role **admin** (no-op if the user row does not exist yet). |

### Backend Python / venv (installing `requirements.txt`)

Use a venv so `pip install` does not touch system Python—especially when an agent or script runs installs for you.

1. `cd backend`
2. Create venv: `python -m venv .venv` (Windows: `py -3 -m venv .venv`)
3. Activate: Windows PowerShell `.\.venv\Scripts\Activate.ps1` · macOS/Linux `source .venv/bin/activate`
4. `python -m pip install --upgrade pip` then `pip install -r requirements.txt`
5. Ensure `backend/.env` exists (copy from `backend/.env.example`) and start Uvicorn (or `npm run dev:all` from repo root).

The same steps are summarized as comments at the top of [backend/requirements.txt](../backend/requirements.txt).

### Admin login and “pending admin approval”

- **There is no separate “admin ID”.** Admins are normal **users** with `role=admin`. You log in with the **admin account email + password** (or Google, if that user was created as admin).
- **First admin on a new DB:** set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` in `backend/.env`, restart the API once. That account can open the **Admin** dashboard and approve the registration waitlist.
- **Why “old” logins still show registration pending:** the app stores users in **your current database** (`DATABASE_URL`, often `backend/career_portal.db` locally). A **new or reset DB** does not contain previous accounts. **New** sign-ups (email or Google) create a **student** that is **`is_active=false`** until an admin **approves** the corresponding waitlist entry (or until that email was pre-approved in the waitlist before register).
- **Approve a pending user:** sign in as admin → **Admin** → **registration waitlist** → set the entry to **approved** (this activates the linked student user).

## Health and logs

| Check | Command / location |
| --- | --- |
| API process | Backend listens on port **8000** by default (`uvicorn`) |
| Liveness | `GET /health` → JSON status |
| Public auth config | `GET /api/v1/auth/config` → `google_auth_enabled`, `google_client_id` |
| Local combined dev logs | [.run/logs/](../.run/logs/) when using `scripts/dev-all.ps1` |
| Production | Platform logs (Railway, Docker, etc.) for Uvicorn stderr/stdout |

## Smoke test script

**Environment requirements**

- **CodeQuest:** run `npm run dev:all` so the frontend (`:5000`) and API (`:8000`) are available before UI smoke tests.
- **JobSpy:** `npm run qa:jobspy-smoke` requires the JobSpy API on `http://127.0.0.1:8001`. Failure is environmental when JobSpy is not running.
- **Practice nav labels:** smoke scripts accept **Code Workbench** (current shell) or legacy **Code Practice Ground** via `scripts/smoke-nav-helpers.mjs`.

Run before each release candidate:

1. Start API and frontend (`npm run dev:all`).
2. Open student app URL (e.g. `http://127.0.0.1:5000`).
3. **Login:** email/password or Google (if configured) or **Demo mode**.
4. **Home:** landing loads; navigate via shell (Dashboard, Calendar, Progress, Resume).
5. **Dashboard:** today’s class, deadlines, practice cards, resume readiness visible.
6. **Calendar / Progress / Resume:** each page loads without blank screen; resume print dialog opens.
7. **Projects:** list loads; open one project; learning view loads; back returns to list.
8. **Quiz / Typing / Code / SQL practice:** open each route; no unhandled blank screen (`npm run qa:practice-smoke` after `dev:all`).
9. **Career Map** vs **Flow Path:** both open; content visible.
10. **Job Board:** with JobSpy on `:8001`, listings load; external apply opens in new tab (`npm run qa:jobspy-smoke`).
11. **Admin:** log in as admin; dashboard loads; **JobSpy Ops** accepts admin key and shows stats.
12. **Logout:** session clears; login screen returns.

Optional automation:

```bash
npm run build && npm run lint
npm run qa:practice-smoke
npm run qa:quiz-smoke
npm run qa:jobspy-smoke
```

## Page inventory and polish status

Use: `[ ]` not started · `[~]` in progress · `[x]` done

### Shells and auth

- `[x]` **StudentShell** — nav, active states, mobile scroll, account dropdown (name, email, demo badge, log out)
- `[x]` **AdminShell** — top bar, current section indicator, responsive truncation
- `[x]` **LoginPage** — main landmark, troubleshooting line pointing to this doc and demo mode

### Student pages

- `[x]` **StudentDashboardPage** — daily cards: class, deadlines, streak, practice progress, readiness
- `[x]` **StudentCalendarPage** — month view, notes, assignments, resources (demo where API pending)
- `[x]` **StudentProgressPage** — course/quiz/project overview + mistakes summary
- `[x]` **ResumeBuilderPage** — form + ATS preview, localStorage, print export
- `[x]` **LandingPage** — Career Map vs Flow Path CTAs and footnote
- `[x]` **ProjectsPage** / **ProjectLearningPage** — load error + retry; skeleton + not-found with back
- `[x]` **PracticePage** — API note for runners / SQL schema
- `[x]` **TypingTrainerPage** — page container + API note for saved attempts
- `[x]` **QuizPage** — list error, empty, and retry paths
- `[x]` **CareerMapperPage** — short explainer vs Flow Path
- `[x]` **FlowRoadmapPage** — title aligned with nav; distinction from Career Map
- `[x]` **JobSpyPage** — Job Board powered by external JobSpy API; filters + external apply

### Admin

- `[x]` **AdminPage** — student list empty state; confirm before student deactivation
- `[x]` **JobSpyOpsView** — scrape controls and live/inactive counts via JobSpy API

### Per-page checklist (copy into notes)

- Visual: spacing, typography, one clear primary action
- Copy: headings, helper text, user-facing errors only
- States: loading, empty, error + retry where applicable
- Accessibility: focus, labels, contrast spot-check
- API: happy path + failure; local proxy vs direct URL documented above

## Telemetry and privacy

- **Route dwell:** `recordRouteVisit` in [src/lib/activity.ts](../src/lib/activity.ts) may send anonymous time-on-route data when authenticated; confirm backend behavior before claiming “no analytics.”
- **Not collected by default:** document any third-party analytics if you add them later.

## Known limitations (keep honest)

- **Demo mode:** limited projects/quizzes (see [src/lib/demo-limits.ts](../src/lib/demo-limits.ts)).
- **AssessmentGuard:** present in [App.tsx](../src/App.tsx) but **disabled** (`assessmentGuardEnabled = false`); enable only when flow is tested.
- **Resume / legacy modules:** removed per recent refactors; README may mention features that are gone—align docs when noticed.
- **In-app Settings page:** not required for v1; use **Account** menu in the student shell for profile summary and logout; deployment/env documented in this file.

## Rollback and support

- **Deploy rollback:** revert to previous image/commit on host; restore DB from backup if migrations ran.
- **Support:** _add contact / runbook link._

## Post-launch backlog

- SQL deep-dive / report viewer (NotebookLM-style narrative + charts)
- Richer in-app user settings (theme, notifications)
- Expanded admin audit logs UI

---

_Last updated: launch polish pass (shells, auth, core pages, roadmaps, admin, account menu, README link)._
