# Connector Lab Test Report

Tested on 2026-07-16 with Node.js 24.14.0.

## Verified

- All six connector contract tests pass.
- The connector binds to `127.0.0.1` and rejects unapproved browser origins.
- Protected routes require the lab token.
- Model discovery works through the Ollama-compatible `/api/tags` endpoint.
- Resume analysis uses Ollama-compatible structured output and rejects malformed model output.
- The mock end-to-end route reports the connector and Ollama as connected.
- The mock model returns one evidence-backed suggestion and preserves `Python` as a missing keyword instead of adding it to the resume.
- The React Resume Lab builds successfully for production.
- The page contains no runtime web-font or cloud-model request.

## Still requires a physical laptop test

- Real Ollama installation and a downloaded local model.
- Windows and macOS startup behavior.
- Hosted HTTPS Code Quest page access to the loopback connector, including browser Local Network Access permission.
- Production pairing and per-install authentication. The fixed lab token is intentionally only for this prototype.

## Visual QA limitation

The cloud browser used for verification blocks navigation to local loopback services. The local page and API were verified through build, contract, integration, and HTTP smoke tests, but visual browser interaction must be completed on the first student laptop.
