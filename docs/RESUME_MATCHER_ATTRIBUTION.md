# Third-party attribution — CodeQuest Resume Lab

Student-facing product name: **CodeQuest Resume Lab**.

This document records third-party code reused or adapted for Resume Lab. Code Quest does not claim authorship of Reactive Resume or Resume Matcher.

## Reactive Resume

| Field | Value |
| --- | --- |
| Repository | https://github.com/AmruthPillai/Reactive-Resume (upstream) / local fork `reactive-resume` |
| Integration commit | `0f7ca8f` (Resume Matcher workflows in Resume Lab panel) |
| Hardening commit | `0db5c65` (session-nonce Code Quest bridge) |
| Role | Resume editor, templates, live preview, section management, PostgreSQL resume storage, PDF/DOCX/JSON export |
| License | See `reactive-resume/LICENSE` in the sibling repository |

## Resume Matcher

| Field | Value |
| --- | --- |
| Repository | https://github.com/gaganpasupuleti/Resume-Matcher |
| Upstream | https://github.com/srbhr/Resume-Matcher |
| Integration commit | `35aa6c7` (integration mode APIs) |
| Hardening commit | `16e064e` (service-token fail-closed) |
| Role | PDF/DOCX parsing (MarkItDown), deterministic job keyword analysis, prompt preparation for cover letter / application email |
| License | Apache-2.0 (`Resume-Matcher/LICENSE`) |

### Modules reused directly

| Module | Symbol | Use |
| --- | --- | --- |
| `apps/backend/app/services/parser.py` | `parse_document` | PDF/DOCX → markdown via MarkItDown |
| `apps/backend/app/services/refiner.py` | `calculate_keyword_match`, `_keyword_in_text`, `_extract_all_text` | Deterministic keyword coverage (not ATS score) |
| `apps/backend/app/prompts/templates.py` | `COVER_LETTER_PROMPT`, `OUTREACH_MESSAGE_PROMPT`, `get_language_name` | Prompt packages for Local Connector generation |

### Modules adapted

| Module | Adaptation |
| --- | --- |
| `apps/frontend/lib/utils/keyword-matcher.ts` | Ported stop-word / token heuristics into `apps/backend/app/services/codequest_keywords.py` for LLM-free JD analysis |
| Cover letter / outreach services | Generation disabled in integration mode; prompts prepared only |

### Disabled in `CODEQUEST_INTEGRATION_MODE=true`

- Direct Ollama / LiteLLM generation
- Provider-key CRUD (`/api/v1/config/*`)
- Enrichment generative routes
- TinyDB as permanent resume source of truth
- Standalone resume/job CRUD as Code Quest SoT

## Local AI ownership

| Concern | Owner |
| --- | --- |
| Numerical ATS score | Reactive Resume deterministic engine (`packages/api/.../ats-score.ts`) |
| Generative suggestions / cover letter / email | Code Quest Local Connector → Ollama |
| Parse + keyword findings | Resume Matcher integration API |
| Canonical resume storage | Reactive Resume PostgreSQL |

## Security notes

- Hugging Face remains backend-only and disabled by default (`ENABLE_HUGGINGFACE_AI=false`).
- No frontend Hugging Face token.
- Local Connector uses device pairing (hashed bearer); `VITE_CONNECTOR_TOKEN` is removed from production usage.
- CQ → RM calls require matching `RESUME_MATCHER_SERVICE_TOKEN` / `CODEQUEST_SERVICE_TOKEN`.
- Browser clients call Code Quest backend only; they do not call Resume Matcher directly in production.
- CQ access tokens stay in the Code Quest parent; RR bridge uses origin + source + session nonce.
