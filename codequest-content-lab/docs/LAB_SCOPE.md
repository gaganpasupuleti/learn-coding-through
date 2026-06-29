# Lab Scope

**Phase:** 26b — Isolated Content Lab
**Status:** Draft

---

## This lab is isolated

`codequest-content-lab/` exists at the repo root as a self-contained workspace. It has no import relationships, no shared config, and no database connection with the main Code Quest application.

The following directories and files are completely off-limits to this lab:

| Protected path | Reason |
|---|---|
| `src/` | Main app frontend source |
| `backend/` | Main app backend source |
| `codequest-frontend-kit/` | Phase 21 frontend sandbox |
| `developer-roadmap/` | Separate roadmap workspace |
| `package.json` / `package-lock.json` | Main app Node dependencies |
| Any existing `requirements.txt` outside this lab | Main app Python dependencies |
| Any migration files | Production DB schema |
| Any existing route or API handler | Live student-facing behavior |
| Jobs, Progress Tracker, Projects | Unrelated features |

---

## Nothing here is student-visible

Phase 26b produces no routes, no API endpoints, no database tables, and no UI components. Students cannot see or interact with anything in this folder at any point during Phase 26b.

Content only becomes student-visible after Phase 26e is implemented and approved.

---

## No real ingestion happens in Phase 26b

Phase 26b contains:
- Documentation
- Sample data (mock records only)
- Content type definitions
- Tagging model
- Ingestion planning docs

Phase 26b does NOT contain:
- Real RSS feed parsing
- Real arXiv API calls
- Real Gutenberg downloads
- Real database writes
- Any network calls to external services

---

## Phase 26c will add real ingestion MVP

Phase 26c (`phase-26c-content-ingestion-mvp`) is the first phase that writes ingestion scripts that talk to real external sources and a dev database. It requires explicit approval before starting.

Phase 26c will:
- Install Python dependencies in this lab (`feedparser`, `arxiv`, etc.)
- Write ingestion scripts under `codequest-content-lab/scripts/`
- Run migrations against the dev database only
- Log all ingestion runs to `content_ingestion_runs`
- Send all ingested items to `content_review_queue` with `pending_review` status

---

## Any future file download must prove license and public-domain safety

Before any real file (book, ebook, paper PDF) is downloaded and stored, the ingestion script must confirm and record:

| Required field | Description |
|---|---|
| `license_type` | Must be `public-domain`, `cc-by`, `cc-by-sa`, `cc-by-nc`, or `open-access` |
| `source_url` | Where the file came from |
| `attribution` | Attribution string as required by the license |
| `license_proof_url` | URL to the license statement or public-domain proof |
| `sha256_hash` | Integrity hash computed on download |

If any field cannot be confirmed, the file must not be stored. The item may be added as a link-only record.

Full copyrighted article text must never be stored unless the source license explicitly permits it. Default behavior is to store title, short summary, and source URL only.

---

## External repos remain dependencies and API references only

No external repository is forked into or merged into Code Quest. The following are Python dependencies or API references for use in Phase 26c+:

| Library | Usage |
|---|---|
| `feedparser` | RSS/Atom feed parsing |
| `newspaper4k` | Article metadata extraction (prototype only) |
| `trafilatura` | Web text extraction (prototype only) |
| `arxiv` | arXiv paper metadata |
| `pyalex` | OpenAlex scholarly metadata |
| `internetarchive` | Internet Archive access with strict license filter |
| Gutendex | API reference (optional self-hosted instance in lab only) |

None of these libraries are installed in Phase 26b.
