# Code Quest Frontend Sandbox

Brick-by-brick UI rebuild. **Dashboard** is the approved new page; existing product features are **wired to the main Code Quest app**.

## Run locally (both apps)

**Terminal 1 — main app (existing features + APIs):**
```bash
cd ..   # learn-coding-through repo root
npm install
npm run dev
# http://localhost:5000
```

**Terminal 2 — sandbox (new UI):**
```bash
cd codequest-frontend-kit
cp .env.example .env
npm install
npm run dev
# http://localhost:3000/dashboard
```

**Terminal 3 — backend (optional, for live data):**
```bash
cd backend
# uvicorn app.main:app --reload --port 8000
```

## What is wired

| Sandbox sidebar | Opens |
|-----------------|--------|
| **Practice → Code / SQL / Typing / Power BI** | `/practice/*` proxied to main app (port 5000) |
| **Practice → Quiz, Flow Path** | Main app `/?page=...` deep link |
| **Learn → Calendar, Projects, Hub, …** | Main app `/?page=...` |
| **Career → Jobs, Career Map, Resume** | Main app `/?page=...` |
| **Dashboard, Progress** | New sandbox UI |

API calls from proxied practice pages use `/api` → backend (port 8000).

## Env

Copy `.env.example` to `.env` and adjust `VITE_LEGACY_APP_URL` if main app is not on port 5000.

## Scope

- **Approved UI:** `/dashboard`, locked `/progress`
- **Redo later:** restyle legacy feature pages one by one inside the new shell
