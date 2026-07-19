# Resume Lab Integration (Resume Matcher)

Code Quest Resume Lab embeds **[Resume Matcher](https://github.com/gaganpasupuleti/Resume-Matcher)** as the student builder. Reactive Resume and the abandoned `codequest-resume-app/` path are retired for this product surface.

## Architecture

```text
Student browser
  └─ Code Quest (:5000)
       ├─ Career → Resume Lab (hub)
       │    ├─ Local Connector status panel → :17891 → Ollama :11434
       │    └─ Open resume builder
       └─ Resume builder workspace
            └─ iframe → Resume Matcher frontend (:3000)
                 └─ Resume Matcher FastAPI (:8001)
                      └─ LiteLLM → Ollama (:11434)  [LLM_PROVIDER=ollama]
```

Optional: CQ backend proxies a subset of RM public APIs at `/api/v1/resume-matcher/*` (JWT at the CQ boundary). Generative tailor/cover-letter work runs **inside Resume Matcher** against the same Ollama the Local Connector uses. Numerical ATS remains Code Quest deterministic policy — do not treat RM JD match % as ATS.

## Attribution

See [`docs/RESUME_MATCHER_ATTRIBUTION.md`](./RESUME_MATCHER_ATTRIBUTION.md).

## Local configuration

### Code Quest (`.env`)

```env
VITE_RESUME_APP_URL=http://localhost:3000
VITE_CODEQUEST_CONNECTOR_URL=http://127.0.0.1:17891

# Resume Matcher (backend-only — never VITE_*)
RESUME_MATCHER_ENABLED=true
RESUME_MATCHER_BASE_URL=http://127.0.0.1:8001
# Optional; standalone RM does not require a service token
# RESUME_MATCHER_SERVICE_TOKEN=
```

### Resume Matcher backend (`apps/backend/.env`)

```env
PORT=8001
HOST=127.0.0.1
LLM_PROVIDER=ollama
LLM_API_BASE=http://127.0.0.1:11434
LLM_MODEL=gemma3:4b
FRONTEND_BASE_URL=http://localhost:3000
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:5000","http://127.0.0.1:5000"]
```

Do **not** set `CODEQUEST_INTEGRATION_MODE=true` for this cutover — that mode disables the editor APIs and Ollama.

### Resume Matcher frontend

Point the Next.js app at the API on `:8001` (see Resume Matcher `SETUP.md` / frontend env).

### Local Connector

```env
CQ_CONNECTOR_PORT=17891
CQ_ALLOWED_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
OLLAMA_BASE_URL=http://127.0.0.1:11434
```

## Ports

| Service | Port |
|---------|------|
| Code Quest | 5000 |
| Code Quest API | 8000 |
| Resume Matcher frontend | 3000 |
| Resume Matcher API | 8001 |
| Local Connector | 17891 |
| Ollama | 11434 |

## Start (one stack)

```bash
# 1) CQ API
cd backend && .venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# 2) Resume Matcher API (sibling checkout)
cd ../Resume-Matcher/apps/backend
uv run uvicorn app.main:app --host 127.0.0.1 --port 8001

# 3) Resume Matcher frontend
cd ../frontend && npm run dev

# 4) Local Connector
cd ../../learn-coding-through-resume-lab/backend/codequest-local-ai-lab/connector
node src/start.mjs

# 5) Code Quest shell
cd ../../.. && npm run dev
```

## Student flow

1. Pair Local Connector on Resume Lab hub (proves Ollama is reachable).
2. Open resume builder → Resume Matcher loads in the iframe.
3. Upload PDF/DOCX, paste JD, tailor, export inside Resume Matcher (Ollama via RM backend).

## Intentionally out of scope

- Reactive Resume embed SSO (`/api/v1/resume-lab/embed-bootstrap`)
- postMessage `codequest-ai/v1` bridge into RR Local AI panel
- CQ↔RM full resume document sync
- OpenAI-compatible shim on the Local Connector
