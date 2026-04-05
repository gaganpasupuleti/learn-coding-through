# Deployment Checklist

Use this checklist whenever deploying frontend/backend to avoid CORS and routing regressions.

## 1) Backend First

- Deploy backend service before frontend.
- Confirm backend root and health:
  - `GET /`
  - `GET /health`
- Ensure backend CORS allows your frontend origin(s):
  - `CORS_ORIGINS` includes local dev URLs.
  - Railway domain origins are allowed by regex in backend middleware.

## 2) Frontend Runtime Config

- Confirm frontend serves runtime config:
  - `GET /runtime-config.js`
- Confirm runtime config points to backend public URL:
  - `VITE_API_URL: "https://<backend-domain>"`
- Never use browser-inaccessible domains such as `.railway.internal` for frontend API calls.

## 3) Smoke Test (One Command)

Run:

```bash
npm run health:check -- --frontend-url https://<frontend-domain> --backend-url https://<backend-domain>
```

Expected checks:

- Runtime config is reachable.
- Backend health is `ok`.
- SQL schema endpoint returns `200`.
- Execute preflight (`OPTIONS /api/v1/execute`) returns `200` with a valid `access-control-allow-origin`.
- Execute POST returns successful output.

## 4) Browser Verification

- Hard refresh frontend (or use incognito).
- Open Practice page:
  - SQL schema loads.
  - Python/Java/SQL execution returns output.
- If `Failed to fetch` appears, check browser Network for:
  - `OPTIONS /api/v1/execute`
  - `POST /api/v1/execute`
  - Request URL, status, and CORS headers.
