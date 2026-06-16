# Code Quest Frontend Sandbox — Integration Guide

## Wired to existing Code Quest features

The sandbox **does not reimplement** SQL, Code, Typing, Power BI, Jobs, etc. It links to the **main app** at repo root.

### Local dev (two terminals)

```bash
# Terminal 1 — main app (port 5000)
npm run dev

# Terminal 2 — sandbox (port 3000)
cd codequest-frontend-kit
cp .env.example .env
npm run dev
```

### How routing works

| Link type | Example | Mechanism |
|-----------|---------|-----------|
| Practice engines | `/practice/sql` | Vite proxy → main app on :5000 |
| Jobs, Quiz, Calendar, … | `http://localhost:5000/?page=jobspy` | Deep link in `src/App.tsx` |
| New UI | `/dashboard`, `/progress` | Sandbox React / static HTML |
| APIs | `/api/v1/...` | Proxied to backend :8000 |

### Redo UI one by one

1. Keep feature engines in `src/features/`
2. Rebuild page chrome in `codequest-frontend-kit/`
3. When approved, port shell into `StudentShell`
