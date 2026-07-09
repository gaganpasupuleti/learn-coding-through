# Railway pre-push cleanup checklist

**Project:** `nurturing-empathy`  
**Audit date:** 2026-07-09  
**Method:** Ponytail ladder (YAGNI → reuse → delete waste → smallest correct diff)

Ponytail for Cursor is already installed at `.cursor/rules/ponytail.mdc` and matches upstream [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) — no extra plugin install needed.

---

## Executive summary

| Keep | Remove (after checks) | Fix before push |
|------|----------------------|-----------------|
| `learn-coding-through` (API) | `JobSpy` (legacy repo) | Admin session validation (`src/App.tsx`) |
| `Postgres` (main DB) | `Postgres---1t` (orphan DB) | Job batch `job_id` bug (`job_store.py`) |
| `acceptable-clarity` (frontend) | — | Deploy only scoped commits |

**Cost:** Each running Railway service + volume bills on Hobby. Two Postgres instances ≈ **2× DB cost**. `REMOVED` deployments do **not** bill — no manual deployment cleanup needed.

---

## 1. Current production map

```
acceptable-clarity          learn-coding-through           JobSpy (legacy)
(frontend, this repo)  -->  (backend/, Dockerfile)   X    (gaganpasupuleti/JobSpy)
        |                            |
        |                            v
        +-------------------->  Postgres  (main)
                                     ^
Postgres---1t  <--- only JobSpy -----+
```

| Service | Repo / root | Last active deploy | Traffic (7d) | Verdict |
|---------|-------------|-------------------|--------------|---------|
| `learn-coding-through` | `learn-coding-through` / `backend/` | 2026-07-06 `946b6b8e` | `/api/jobs` 200s, `/health` | **KEEP** |
| `acceptable-clarity` | `learn-coding-through` / frontend | 2026-07-06 `946b6b8e` | SPA + proxied API | **KEEP** (canonical UI URL) |
| `Postgres` | Railway plugin | — | wired to main API | **KEEP** |
| `JobSpy` | `gaganpasupuleti/JobSpy` | 2026-06-16 (stale) | Last hit 2026-07-08; **none in 24h** | **REMOVE** |
| `Postgres---1t` | Railway plugin | — | only `JobSpy` | **REMOVE** after JobSpy |

**Jobs today:** Integrated in main backend (`python-jobspy`, `/api/jobs`). `VITE_JOBS_API_URL` is empty on `acceptable-clarity` — browser uses same-origin `/api/jobs`, not `jobspy-production`.

---

## 2. Ponytail cleanup ladder (Railway)

Run top to bottom. Stop when the rung holds.

1. **Does this service need to exist?**  
   - `JobSpy` + `Postgres---1t` → **No** (superseded by main API).
2. **Already in codebase?**  
   - Jobs, admin, auth → all on `learn-coding-through`. Reuse one API + one DB.
3. **Deletion over addition**  
   - Remove legacy services before adding cron, caches, or second frontends.
4. **Smallest correct diff**  
   - Push code fixes first; delete Railway services only after deploy + smoke.

---

## 3. Pre-push code checklist (local)

Only these files belong in the push:

- [ ] `src/App.tsx` — validate session via `/auth/me` before admin load; `clearAuth()` on logout
- [ ] `backend/app/services/job_store.py` — unique `job_id` per batch insert
- [ ] `backend/tests/test_job_store_job_id.py` — regression test

**Verify locally:**

```bash
cd backend && python -m unittest tests.test_job_store_job_id -v
npm run build
```

**Do not include** unrelated dirty files (kit sandbox, docs drafts, `.cursor/settings.json`, etc.).

---

## 4. Railway env audit

### Main API (`learn-coding-through`) — OK to keep

| Variable | Status |
|----------|--------|
| `DATABASE_URL` → `postgres.railway.internal` | OK |
| `JOBSPY_ENABLED=true` | OK (in-process scrape) |
| `JOB_MAIL_ENABLED=false` | OK (intentional off) |
| `GOOGLE_OAUTH_CLIENT_ID` | OK |
| `ADMIN_JOB_KEY` | Set — **rotate if ever exposed in logs/chat** |

### Frontend (`acceptable-clarity`) — OK

| Variable | Status |
|----------|--------|
| `VITE_API_URL` → `learn-coding-through-production` | OK |
| `VITE_JOBS_API_URL` | Empty — OK (same-origin jobs) |

### Legacy (`JobSpy`) — stale / wrong

| Issue | Action |
|-------|--------|
| `CORS_ORIGINS` references `acceptable-clarity-production-5fh7` | Stale subdomain (`5fb2` is live) — moot after service delete |
| Separate `ADMIN_API_KEY` | Legacy — delete with service |
| `DATABASE_URL` → `postgres---1t` | Delete with service |

### `railway.toml` (repo)

| Setting | Note |
|---------|------|
| `ENVIRONMENT=development` | Railway dashboard vars should override for production; confirm `SECRET_KEY`, `CORS_ORIGINS` are production-safe in dashboard |

---

## 5. Log findings (no action on REMOVED deploys)

| Signal | Finding |
|--------|---------|
| HTTP 5xx (main API, 7d) | None |
| Admin 401 toast | Stale/invalid JWT — fixed in `App.tsx` (pending deploy) |
| Job refresh crash (Jul 7) | `UniqueViolation` on `job_id` — fixed in `job_store.py` (pending deploy) |
| `REMOVED` deployments | Normal Railway history — **no cost, no manual purge** |

---

## 6. Removal order (Railway dashboard)

Do **after** code push + successful deploy on `learn-coding-through` and `acceptable-clarity`.

### Phase A — safe deletes (recommended before next billing cycle)

1. [ ] Confirm `acceptable-clarity` → `VITE_JOBS_API_URL` is empty
2. [ ] Confirm no docs/scripts require `jobspy-production-76c6.up.railway.app`
3. [x] Optional: `pg_dump` from `Postgres---1t` if you want a backup — **done** → `pre-deleted-files/postgres---1t-2026-07-09/` (gitignored locally)
4. [ ] **Delete service:** `JobSpy`
5. [ ] **Delete service:** `Postgres---1t`
6. [ ] Verify student Jobs page + admin JobSpy Ops still work on main URLs

**Expected savings:** 2 fewer billable services (1 app + 1 Postgres volume).

### Phase B — optional later (not required for push)

| Idea | Ponytail take |
|------|----------------|
| Merge frontend into one service (monolith) | Only if you want one URL + one deploy; current split works — **don't merge unless it solves a real problem** |
| Enable `JOB_MAIL_ENABLED` | Only when digest email is ready |
| Railway CLI upgrade (`4.66.0` → `5.26.0`) | `railway login` then upgrade when convenient |

---

## 7. Post-deploy smoke (5 min)

On **production** URL (`acceptable-clarity-production-5fb2.up.railway.app` or your canonical domain):

- [ ] Login as admin — no “Admin data partially failed (10)” toast
- [ ] Admin → Students loads rows
- [ ] Student → Jobs loads `/api/jobs`
- [ ] `GET /health` on API host returns 200
- [ ] Admin → JobSpy Ops → Refresh (or stats) — no `UniqueViolation` in Railway logs

---

## 8. What NOT to do

- Do **not** delete main `Postgres` — all student/admin data lives there
- Do **not** merge DBs by hand unless you have a migration plan — deleting the orphan is enough
- Do **not** pay time cleaning `REMOVED` deployment rows — Railway already ignores them for runtime
- Do **not** push secrets rotation in the same commit as feature fixes unless planned

---

## 9. Sign-off

| Step | Owner | Done |
|------|-------|------|
| Scoped code commit | Dev | [ ] |
| `npm run build` + job_id test | Dev | [ ] |
| Push + deploy main API + frontend | Dev | [ ] |
| Post-deploy smoke | Dev | [ ] |
| Delete `JobSpy` + `Postgres---1t` | Dev | [ ] |
| Update canonical URL in docs/bookmarks | Dev | [ ] |
