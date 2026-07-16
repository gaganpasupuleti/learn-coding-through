# Local connection architecture

## Connection proof

| Process | Address | Responsibility |
| --- | --- | --- |
| Resume Lab | `127.0.0.1:5173` | Local test UI and browser-only draft storage |
| Local AI Connector | `127.0.0.1:17891` | Origin check, request validation, Ollama calls, output validation |
| Ollama | `127.0.0.1:11434` | Local model inference |
| Mock Ollama | `127.0.0.1:11435` | Deterministic testing only |

## Security properties currently tested

- Connector binds to the IPv4 loopback interface only.
- Browser origins use an exact allowlist.
- Protected endpoints require a lab token.
- Request bodies and individual fields are size limited.
- Model names are allow-character validated.
- AI responses must match the resume-tailoring contract.
- Evidence strings are checked against the submitted resume.
- Resume and job text are not written to connector logs.
- The connector has no arbitrary shell or arbitrary prompt endpoint.

## Production changes intentionally deferred

- Replace the lab token with short-lived Code Quest-signed device tokens.
- Package the connector as a signed Tauri desktop application.
- Add explicit device pairing and disconnect/revoke behavior.
- Test the hosted HTTPS Code Quest origin against browser local-network permissions.
- Add cancellation and controlled streaming.
- Add PDF/DOCX extraction in a separately reviewed local pipeline.
- Add an update channel and version compatibility policy.

## Trust boundary

Local model output is user-controlled and untrusted. It can be used for resume
drafts, but never for permissions, certificates, official Code Quest scores,
payments, or administrative decisions. Official ATS scoring remains on the
existing deterministic Code Quest engine.

