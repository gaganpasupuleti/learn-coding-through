# Code Quest Frontend Sandbox

**Work branch only — do not merge to `main` until explicitly approved.**

| | |
|---|---|
| **Branch** | `feature/codequest-legacy-feature-wiring` |
| **PR (open, not for merge)** | https://github.com/gaganpasupuleti/learn-coding-through/pull/64 |
| **Main repo** | `learn-coding-through` — all work happens on the branch above |

## Setup (first time)

```bash
git clone https://github.com/gaganpasupuleti/learn-coding-through.git
cd learn-coding-through
git checkout feature/codequest-legacy-feature-wiring
cd codequest-frontend-kit
cp .env.example .env
npm install
```

## Run locally (3 terminals)

**Terminal 1 — backend (APIs)**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — main app (existing features, port 5000)**
```bash
# from repo root
npm install
npm run dev
```

**Terminal 3 — sandbox (new UI, port 3000)**
```bash
cd codequest-frontend-kit
npm run dev
```

Log in once at http://localhost:5000 — token is shared with the sandbox.

## URLs

| URL | What |
|-----|------|
| http://localhost:3000/dashboard | New approved dashboard |
| http://localhost:3000/progress | Locked baseline |
| http://localhost:3000/practice/sql | SQL Practice (proxied + backend) |
| http://localhost:3000/open?page=jobspy | Jobs (proxied main app) |

## Rules

- **No merge to `main`** without explicit approval
- Push all changes to `feature/codequest-legacy-feature-wiring` only
- Dashboard UI is approved; other pages redo one by one on this branch
