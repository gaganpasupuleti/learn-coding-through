# codequest-content-lab

**Phase:** 26b — Isolated Content Lab
**Branch:** `phase-26b-study-materials-content-lab`
**Status:** Prototype / Isolated — not connected to main app

---

## What this is

This folder is an isolated research and prototyping lab for the future Study Materials content platform. It contains sample data, content type definitions, tagging models, and ingestion planning docs.

**Nothing in this folder is student-visible.**
**Nothing in this folder connects to the production database.**
**Nothing in this folder affects the main Code Quest app.**

---

## What this is NOT

- Not a Python package to install
- Not connected to `src/`, `backend/`, or `codequest-frontend-kit/`
- Not running any real ingestion yet
- Not downloading real books, articles, or papers
- Not importing or forking external repositories

---

## Folder structure

```
codequest-content-lab/
  README.md                          ← this file
  .gitignore                         ← excludes downloaded files, venvs, secrets
  docs/
    LAB_SCOPE.md                     ← isolation rules and phase boundaries
    CONTENT_TYPES.md                 ← definitions for all content types
    TAGGING_MODEL.md                 ← domain/tag taxonomy and rules
    FUTURE_INGESTION_PLAN.md         ← planned ingestion scripts for Phase 26c+
  sample-data/
    domains.sample.json              ← mock domain seed records
    articles.sample.json             ← mock article metadata (no full body text)
    books.sample.json                ← mock public-domain book records
    papers.sample.json               ← mock research paper metadata
    collections.sample.json          ← mock learning path collections
    student-progress.sample.json     ← mock student reading progress records
```

---

## Phase boundaries

| Phase | What happens |
|---|---|
| **26b (this branch)** | Isolated lab folder created. Sample data and docs only. No real ingestion. |
| **26c** | Real ingestion MVP. RSS feed parsing, arXiv metadata, Gutenberg book records. Dev DB only. |
| **26d** | Admin review UI. Approve/reject queue. |
| **26e** | Student-facing Study Materials hub. Published items only. |
| **26f** | Reading progress and bookmarks. |
| **26g** | Main app integration. Production cutover. |

---

## External library usage

All external libraries (`feedparser`, `newspaper4k`, `trafilatura`, `arxiv`, `pyalex`, `internetarchive`) are planned as Python dependencies for Phase 26c+. They are not installed here. They are not forked. They are not merged into this repo.

See `docs/FUTURE_INGESTION_PLAN.md` for full details.

---

## Safety rule

Any real file download (books, papers, ebooks) must prove public-domain or open-license status before the file is stored. License, source URL, attribution, and license proof URL must be recorded alongside every stored file. See `docs/LAB_SCOPE.md`.
