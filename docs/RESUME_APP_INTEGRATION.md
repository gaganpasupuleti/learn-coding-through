# Resume App Integration

Code Quest embeds the complete [Reactive Resume](https://github.com/gaganpasupuleti/reactive-resume) application as a separate service. Resume editing, templates, preview, export, and authentication remain owned by Reactive Resume.

## Architecture

```text
Student browser
  └─ Code Quest (:5000)
       └─ Career → Resume Lab (iframe)
            └─ Reactive Resume (:3000/dashboard/resumes)
```

Future local AI (Stage 2, blocked on connector):

```text
Reactive Resume iframe
  → postMessage → Code Quest parent
  → Code Quest Local Connector → Ollama
  → Code Quest parent → postMessage → Reactive Resume iframe
```

## Local configuration

### Code Quest (`learn-coding-through`)

`.env`:

```env
VITE_RESUME_APP_URL=http://localhost:3000/dashboard/resumes
```

Runtime config is also supported via `public/runtime-config.js` and the production `frontend-entrypoint.sh` generator.

### Reactive Resume (`reactive-resume`)

`.env` or `.env.local`:

```env
CODEQUEST_EMBED_ORIGIN=http://localhost:5000
APP_URL=http://localhost:3000
```

When `CODEQUEST_EMBED_ORIGIN` is missing or invalid, Reactive Resume denies iframe embedding with:

- `X-Frame-Options: DENY`
- `Content-Security-Policy: frame-ancestors 'none'`

When valid, HTML app shells send:

- `Content-Security-Policy: frame-ancestors 'self' <exact-origin>`

## Required ports

| Service | Port | URL |
|---------|------|-----|
| Code Quest | 5000 | http://localhost:5000 |
| Reactive Resume web | 3000 | http://localhost:3000/dashboard/resumes |
| Reactive Resume API (dev) | 3001 | proxied by Vite |

## Navigation

- Code Quest: **Career → Resume Lab**
- Resume Lab is enabled and opens the embedded builder
- **Open full screen** opens the same configured Resume URL in a new tab

## Security notes

- Only the validated `CODEQUEST_EMBED_ORIGIN` may embed Reactive Resume.
- Do not pass Code Quest login tokens or student secrets in iframe query parameters.
- Reactive Resume keeps its own authentication session inside the iframe.
- For production, prefer HTTPS on both services under related parent domains when possible.

## Start commands

### Reactive Resume

```bash
cd reactive-resume
pnpm install
# start postgres per AGENTS.md, then:
dotenvx run -f .env.local -- pnpm dev
```

### Code Quest

```bash
cd learn-coding-through
npm install
npm run dev
```

Backend (if not already running):

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Local verification

1. Start Reactive Resume on port 3000.
2. Start Code Quest on port 5000.
3. Sign into Code Quest.
4. Open **Career → Resume Lab**.
5. Confirm Reactive Resume loads in the iframe.
6. Sign into Reactive Resume inside the iframe if prompted.
7. Create or open a resume, edit, preview, and export PDF/DOCX.
8. Use **Open full screen** and confirm the same app opens.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Blank iframe / refused to connect | Reactive Resume running? `VITE_RESUME_APP_URL` correct? |
| Frame blocked | Set `CODEQUEST_EMBED_ORIGIN=http://localhost:5000` in Reactive Resume |
| Wrong page in iframe | Use full path `/dashboard/resumes` or origin-only URL (helper appends path) |
| Config error screen in Code Quest | `VITE_RESUME_APP_URL` must be valid `http://` or `https://` |

## Stage 2 — Local AI (planned)

Stage 2 is **not implemented yet** because the **Code Quest Local Connector** source is not present in this workspace.

Before connector work begins:

1. Add or locate the connector repository.
2. Document its real URL, port, and API contract from source — do not invent endpoints.
3. Implement provider-neutral AI (`codequest-local`, future disabled `huggingface`).
4. Add the secure `postMessage` bridge between Code Quest and Reactive Resume.
5. Remove unsupported cloud AI providers from the active Resume application.
6. Keep ATS numerical scoring deterministic; AI may only explain or suggest.

### Future environment variables (Stage 2)

Code Quest backend:

```env
ENABLE_HUGGINGFACE_AI=false
HF_TOKEN=
HF_MODEL=
```

Hugging Face must run through the Code Quest backend only. Never expose `HF_TOKEN` to frontend code.

### Removed providers target (Stage 2)

OpenAI, Gemini, Google Generative AI, Anthropic, Groq, OpenRouter, Azure OpenAI, and direct browser-to-Ollama communication will be removed from the active Resume app once the connector path is implemented.

## Future phases

- SSO / account linking between Code Quest and Reactive Resume
- Hugging Face provider through Code Quest backend (disabled by default)
- Deterministic ATS scoring separated from optional AI explanations
