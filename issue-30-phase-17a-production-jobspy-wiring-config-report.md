# Phase 17A.1 — Production JobSpy API runtime wiring

## Summary

Production CodeQuest Job Board showed **“JobSpy API offline”** because the browser fell back to same-origin `/jobs-api`, which nginx does not proxy. This change injects `VITE_JOBS_API_URL` into `runtime-config.js` at container start when the Railway frontend service sets that variable.

## Root cause

1. `src/lib/jobspy-api.ts` uses `window.__RUNTIME_CONFIG__.VITE_JOBS_API_URL`, then `import.meta.env.VITE_JOBS_API_URL`, then falls back to `{origin}/jobs-api`.
2. `frontend-entrypoint.sh` wrote `runtime-config.js` with only `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` — not `VITE_JOBS_API_URL`.
3. Production nginx proxies `/api` and `/health` to the CodeQuest backend only; `/jobs-api` is not proxied.
4. With an empty jobs URL, health checks to `/jobs-api/health` fail → offline state (correct Phase 17A UX, wrong wiring).

## Files changed

| File | Change |
| --- | --- |
| `frontend-entrypoint.sh` | Read `VITE_JOBS_API_URL` from container env; write validated URL into `runtime-config.js`; always emit empty `VITE_JOBS_ADMIN_API_KEY` |
| `public/runtime-config.js` | Comment clarifying production overwrite |
| `.env.example` | Production JobSpy URL + explicit “no secrets on frontend” note |
| `docs/LAUNCH.md` | Production wiring table (CodeQuest + JobSpy CORS) |
| `issue-30-phase-17a-production-jobspy-wiring-config-report.md` | This report |

## Runtime config behavior

| Environment | `VITE_JOBS_API_URL` source | Browser calls |
| --- | --- | --- |
| Local dev (`npm run dev`) | Empty in `.env` / runtime fallback | Same-origin `/jobs-api` → Vite proxy → `:8001` |
| Production (Railway) | Railway frontend env → `frontend-entrypoint.sh` → `runtime-config.js` | Direct HTTPS to JobSpy API domain |
| Production (unset) | Empty | Same-origin `/jobs-api` (still fails until URL is set) |

`VITE_JOBS_ADMIN_API_KEY` is always written as `""` in production runtime config. Admins enter the key in JobSpy Ops UI (browser storage) or trigger scrapes on the JobSpy service.

## Railway variables needed

**CodeQuest frontend service**

```
VITE_JOBS_API_URL=https://YOUR-JOBSPY-API-DOMAIN.up.railway.app
```

Redeploy frontend after setting.

**JobSpy API service**

```
CORS_ORIGINS=https://acceptable-clarity-production-5fh7.up.railway.app,http://localhost:5000,http://127.0.0.1:5000
DATABASE_URL=<Railway Postgres — JobSpy service only>
ADMIN_API_KEY=<server secret — JobSpy service only>
```

Ensure JobSpy `/health` and `/api/v1/jobs` return data (migrations + scrape).

## Security confirmation

- No `DATABASE_URL`, Postgres password, `ADMIN_API_KEY`, or `AUTH_SECRET` added to CodeQuest frontend env or runtime config.
- Only public JobSpy API HTTPS origin is injected.
- Admin key intentionally not shipped in frontend runtime config.

## Verification result

- `npm run build` — run before commit (see PR checks).
- `npx eslint src/lib/jobspy-api.ts` — no changes to that file; sanity check only.
- End-to-end production Job Board smoke deferred until JobSpy API URL is live and Railway env is set.

## Deferred work

- Deploy or restore JobSpy API on Railway and note public domain.
- Set `VITE_JOBS_API_URL` on CodeQuest frontend and redeploy.
- Set JobSpy `CORS_ORIGINS` and confirm scrape data exists.
- Connected production smoke (Browse, Saved, Apply) after both services are wired.
- Phase 17C monorepo migration — **not started** (out of scope).

## Test plan

- [ ] Set `VITE_JOBS_API_URL` on Railway frontend; redeploy; confirm generated `runtime-config.js` contains the URL.
- [ ] Job Board shows “JobSpy API connected” when JobSpy `/health` is up.
- [ ] Local dev still works with empty `VITE_JOBS_API_URL` and JobSpy on `:8001`.
- [ ] Confirm `runtime-config.js` in production has `VITE_JOBS_ADMIN_API_KEY: ""`.
