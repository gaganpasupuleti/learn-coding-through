# Code Quest Local AI Lab

An isolated connection proof for this flow:

```text
Local Resume Lab (127.0.0.1:5173)
        -> Local AI Connector (127.0.0.1:17891)
        -> Ollama (127.0.0.1:11434)
```

This lab does not modify the Code Quest application, database, ATS score, or
authentication. Resume and job-description text live only in the browser and
are sent only to the local connector during a generation request.

## What is included

- A local browser-based Resume Lab.
- A loopback-only connector with an exact-origin allowlist.
- Ollama health and installed-model discovery.
- Structured resume-tailoring output through Ollama `/api/chat`.
- Response validation and evidence flags.
- A mock Ollama server for testing without a downloaded model.
- Automated unit, integration, CORS, authentication, and malformed-output tests.

## Requirements

- Node.js 20 or newer.
- npm.
- Ollama only for the real-model test.

## Fastest connection proof (mock model)

```bash
npm run install:ui
npm run dev:mock
```

Open <http://127.0.0.1:5173>, select **Load demo**, then select
**Analyse locally**. The connector status should show `codequest-mock:latest`.

The mock proves browser-to-connector routing, CORS, request validation, model
discovery, structured output, and UI rendering. It does not prove real model
quality.

## Real Ollama test

1. Install and start Ollama.
2. Pull a model suitable for the laptop, for example:

   ```bash
   ollama pull gemma3:4b
   ```

3. Install the UI dependencies and start the lab:

   ```bash
   npm run install:ui
   npm run dev:real
   ```

4. Open <http://127.0.0.1:5173> and select the detected model.

Ollama remains bound to its default loopback address. Do not set
`OLLAMA_HOST=0.0.0.0` and do not use `OLLAMA_ORIGINS=*` for this lab.

## Verify

```bash
npm run verify
```

The command runs connector tests, an end-to-end mock-Ollama request, and a
production build of the local Resume Lab.

## Lab-only token

The UI and connector use `codequest-local-lab` as a deliberately non-secret
development token. It only prevents accidental local calls; it is not the
production pairing design. The production connector will require short-lived,
Code Quest-signed device tokens.

Override it for local experiments by setting the same value in both processes:

```text
CQ_CONNECTOR_LAB_TOKEN=<local-test-value>
VITE_CONNECTOR_TOKEN=<same-local-test-value>
```

## Current boundaries

- Text and Markdown resume input only.
- No PDF/DOCX parsing.
- No cloud synchronization.
- No ATS scoring.
- No desktop installer or auto-start.
- No Hugging Face fallback.
- No automatic resume modification.

These boundaries are intentional. The next phase begins only after a real
student laptop successfully connects to Ollama through this lab.

