# Resume App Integration

Code Quest embeds the complete [Reactive Resume](https://github.com/gaganpasupuleti/reactive-resume) application as a separate service. Resume editing, templates, preview, export, and authentication remain owned by Reactive Resume.

Local AI runs through the **Code Quest Local Connector** in this repository:

`backend/codequest-local-ai-lab/connector/`

## Architecture

```text
Student browser
  └─ Code Quest (:5000)
       ├─ Career → Resume Lab
       │    ├─ Local Connector status panel
       │    └─ iframe → Reactive Resume (:3000/dashboard/resumes)
       │         └─ postMessage → Code Quest parent
       │              └─ Local Connector (:17891) → Ollama (:11434)
       └─ Code Quest backend (future Hugging Face only, disabled by default)
```

## Connector API (source of truth)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/v1/status` | No | Connector + Ollama health |
| `GET /api/v1/models` | `X-CodeQuest-Connector-Token` | Installed Ollama models |
| `POST /api/v1/resume/tailor` | Token + JSON body | Structured resume suggestions |

Defaults (verified from connector source):

- Connector: `http://127.0.0.1:17891`
- Ollama: `http://127.0.0.1:11434`
- Lab token: `codequest-local-lab` — **local development only**. This is not secure authentication and must never be treated as a production credential.

## Local configuration

### Code Quest (`.env`)

```env
VITE_RESUME_APP_URL=http://localhost:3000/dashboard/resumes
VITE_CODEQUEST_CONNECTOR_URL=http://127.0.0.1:17891
# Local-development lab token only. Not authentication. Do not use in production.
VITE_CONNECTOR_TOKEN=codequest-local-lab
```

Runtime config: `public/runtime-config.js` and `frontend-entrypoint.sh`.

Production builds refuse `codequest-local-lab`. If no paired-device token is configured, local AI is disabled with: **Local Connector pairing is required.** There is no silent production default.

### Connector (`backend/codequest-local-ai-lab`)

```env
CQ_CONNECTOR_PORT=17891
CQ_ALLOWED_ORIGINS=http://localhost:5000,http://127.0.0.1:5000,http://127.0.0.1:5173
OLLAMA_BASE_URL=http://127.0.0.1:11434
CQ_CONNECTOR_LAB_TOKEN=codequest-local-lab
```

### Reactive Resume (`.env.local`)

```env
CODEQUEST_EMBED_ORIGIN=http://localhost:5000
VITE_CODEQUEST_EMBED_ORIGIN=http://localhost:5000
APP_URL=http://localhost:3000
```

### Code Quest backend (future Hugging Face)

```env
ENABLE_HUGGINGFACE_AI=false
HF_TOKEN=
HF_MODEL=
```

`HF_TOKEN` must never be exposed to frontend code.

## Required ports

| Service | Port | URL |
|---------|------|-----|
| Code Quest | 5000 | http://localhost:5000 |
| Reactive Resume web | 3000 | http://localhost:3000/dashboard/resumes |
| Reactive Resume API (dev) | 3001 | proxied by Vite |
| Local Connector | 17891 | http://127.0.0.1:17891 |
| Ollama | 11434 | http://127.0.0.1:11434 |

## Start commands

### 1. Ollama

```bash
ollama serve
ollama pull <model-name>
```

### 2. Local Connector

```bash
cd backend/codequest-local-ai-lab
npm run verify          # mock Ollama tests
npm run dev:real        # real Ollama + standalone lab UI on :5173
```

Connector only (from `connector/`):

```bash
cd backend/codequest-local-ai-lab/connector
node src/start.mjs
```

### 3. Reactive Resume

```bash
cd reactive-resume
pnpm install
dotenvx run -f .env.local -- pnpm dev
```

### 4. Resume Matcher (integration mode)

Sibling repo required: `../Resume-Matcher` (https://github.com/gaganpasupuleti/Resume-Matcher).

```bash
cd ../Resume-Matcher/apps/backend
# Windows PowerShell
$env:CODEQUEST_INTEGRATION_MODE="true"
$env:PORT="8001"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Code Quest backend (backend-only env — never `VITE_*`):

```bash
RESUME_MATCHER_ENABLED=true
RESUME_MATCHER_BASE_URL=http://127.0.0.1:8001
RESUME_MATCHER_TIMEOUT_SECONDS=30
```

See `docs/RESUME_MATCHER_ATTRIBUTION.md` for reused modules and licenses.

### 5. Code Quest

```bash
cd learn-coding-through
npm install
npm run dev
```

Backend API:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Security

- Connector binds to `127.0.0.1` only.
- CORS uses exact-origin allowlist via `CQ_ALLOWED_ORIGINS` (no wildcards).
- Reactive Resume iframe embedding uses validated `CODEQUEST_EMBED_ORIGIN` CSP `frame-ancestors`.
- postMessage bridge validates child origin, `event.source`, and runtime schemas.
- Lab token is development-only and is not authentication.
- **Future security phase (not implemented):** production device pairing that issues a non-lab connector token per paired device. Until that ships, production builds must not enable local AI with the lab token.

## Deterministic ATS

Reactive Resume ATS scoring is **deterministic** (`packages/api/src/features/ai/ats-score.ts`).

- Numerical score depends on resume structure and content rules only.
- Local AI may suggest improvements through the connector bridge.
- AI does not change the ATS numerical score.

## Active AI providers

| Provider | Status |
|----------|--------|
| Code Quest Local Connector → Ollama | Active in Resume Lab |
| Hugging Face via Code Quest backend | Disabled (`ENABLE_HUGGINGFACE_AI=false`) |

Removed from active UI: OpenAI, Anthropic, Gemini, Groq, OpenRouter, Vercel AI Gateway, Azure OpenAI, direct Ollama from Reactive Resume.

## Local verification checklist

1. Start Ollama, connector, Reactive Resume, and Code Quest.
2. Sign into Code Quest → **Career → Resume Lab**.
3. Confirm Reactive Resume loads in the iframe.
4. Check connector panel shows connector/Ollama/model status.
5. Run deterministic **Run ATS Check** in the builder analysis sidebar.
6. Generate local suggestions (embedded mode) and accept/reject previews manually.
7. Stop connector and confirm resume editing still works.
8. Restart connector and refresh status.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Connector unavailable | `node backend/codequest-local-ai-lab/connector/src/start.mjs` running on `17891` |
| Origin blocked | `CQ_ALLOWED_ORIGINS` includes Code Quest origin |
| No models listed | `curl http://127.0.0.1:11434/api/tags` and run `ollama pull <model>` |
| Local AI unavailable in iframe | `VITE_CODEQUEST_EMBED_ORIGIN` set in Reactive Resume |
| Frame blocked | `CODEQUEST_EMBED_ORIGIN=http://localhost:5000` |

## Git note

Commit `5c66d625` mixes Resume integration with previously staged job-enrichment files. Splitting that commit was left unchanged to avoid risking either change set.
