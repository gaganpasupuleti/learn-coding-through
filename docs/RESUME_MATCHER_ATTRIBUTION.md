# Third-party attribution — CodeQuest Resume Lab

Student-facing product name: **CodeQuest Resume Lab**.

This document records third-party code reused for Resume Lab. Code Quest does not claim authorship of Resume Matcher.

## Resume Matcher (builder + API)

| Field | Value |
| --- | --- |
| Repository | https://github.com/gaganpasupuleti/Resume-Matcher |
| Upstream | https://github.com/srbhr/Resume-Matcher |
| Role | Student resume builder UI (Next.js), PDF/DOCX upload, JD tailor, templates, PDF export, LiteLLM/Ollama generation |
| License | Apache-2.0 (`Resume-Matcher/LICENSE`) |
| Runtime | Frontend `:3000` (iframe), API `:8001` (standalone; not `CODEQUEST_INTEGRATION_MODE`) |

## Reactive Resume (retired for this product path)

| Field | Value |
| --- | --- |
| Repository | https://github.com/AmruthPillai/Reactive-Resume |
| Role | **Retired** — no longer embedded. Prior embed-SSO / Local AI bridge work is obsolete for Resume Lab. |
| License | See upstream / sibling `reactive-resume` repo if retained for reference |

## Local AI ownership

| Concern | Owner |
| --- | --- |
| Numerical ATS score | Code Quest deterministic policy only (not RM JD match %, not Ollama) |
| Generative tailor / cover letter / email | Resume Matcher → LiteLLM → Ollama (same Ollama as Local Connector) |
| Local Connector pairing / status | Code Quest hub (`LocalConnectorPanel`) |
| Canonical resume documents (this cutover) | Resume Matcher TinyDB |
| CQ student auth / Resume Lab gate | Code Quest |

## Security notes

- Hugging Face remains backend-only and disabled by default (`ENABLE_HUGGINGFACE_AI=false`).
- No frontend Hugging Face token.
- Local Connector uses device pairing (hashed bearer); `VITE_CONNECTOR_TOKEN` is removed from production usage.
- Optional CQ → RM proxy (`/api/v1/resume-matcher/*`) requires CQ JWT; service token is optional for standalone RM.
- Browser students use Resume Matcher via the CQ iframe; do not put RM service secrets in Vite env.
