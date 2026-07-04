# Future Ingestion Plan

**Phase:** 26b — Isolated Content Lab
**Status:** Draft — no ingestion scripts written yet

---

## Overview

This document defines the planned ingestion scripts for Phase 26c+. No scripts are written in Phase 26b. This is planning only.

---

## Phase 26c: Real Ingestion MVP

Phase 26c will create the following scripts under `codequest-content-lab/scripts/`:

```
codequest-content-lab/scripts/
  seed_domains.py           — seed content_domains table with 15 domains
  ingest_rss.py             — parse RSS feeds, insert article metadata
  ingest_arxiv.py           — search arXiv, insert paper metadata
  ingest_gutenberg.py       — query Gutendex API, download .txt files for public-domain books
  run_ingestion.py          — orchestrator: runs all ingestion scripts in sequence
```

Phase 26c will also add a `requirements.txt` to this lab folder:

```
feedparser>=6.0
newspaper4k>=0.9
trafilatura>=1.8
arxiv>=2.1
pyalex>=0.14
internetarchive>=4.0
psycopg2-binary>=2.9
python-dotenv>=1.0
```

---

## Ingestion script contracts

Every ingestion script must:

1. Accept source configuration from environment variables or a config file (no hardcoded credentials)
2. Log a run record to `content_ingestion_runs` before and after execution
3. Emit these output counts at minimum:
   - `source_count` — records fetched from source
   - `imported_count` — new items successfully inserted
   - `skipped_duplicate_count` — items skipped (already exist by `external_id + source_id`)
   - `rejected_unsafe_count` — items rejected due to missing/unknown license
   - `downloaded_file_count` — files downloaded to `content_files`
4. Insert all new items with `status = 'pending_review'`
5. Insert a corresponding `content_review_queue` row for each new item
6. Never insert items with `license_type = 'unknown'` that have `content_body` populated
7. Never store full article body unless the source has `full_text_allowed = TRUE`

---

## RSS feed ingestion (`ingest_rss.py`)

**Library:** `feedparser`

**Process:**
1. Load active RSS sources from `content_sources` where `source_type IN ('rss', 'atom')`
2. Parse each feed with `feedparser.parse(feed_url)`
3. For each entry: extract title, summary/description, link, author, published
4. Check for existing item by `(external_id, source_id)` — skip if duplicate
5. Check `full_text_allowed` on source — if `False`, set `content_body = NULL`
6. Insert into `content_items` with `status = 'pending_review'`, `license_type = 'no-full-text'`
7. Insert into `content_review_queue`
8. Log counts to `content_ingestion_runs`

**Output proof required:**
```
source_count: N
imported_count: N
skipped_duplicate_count: N
rejected_unsafe_count: N
downloaded_file_count: 0

sample article item:
  title: "..."
  summary: "..."
  source_url: "https://..."
  author: "..."
  published_date: "YYYY-MM-DD"
  domain: "python"
  license_type: "no-full-text"
  content_body: null
  status: "pending_review"
```

---

## arXiv ingestion (`ingest_arxiv.py`)

**Library:** `arxiv`

**Process:**
1. Search arXiv by configured subject categories (e.g., `cs.LG`, `cs.DS`, `stat.ML`)
2. For each result: extract title, authors, summary (abstract), published, arxiv_id, pdf_url
3. Deduplicate by `arxiv_id`
4. Set `license_type = 'open-access'` for arXiv preprints
5. Store abstract in `content_body` — arXiv preprint abstracts are freely available
6. Store `pdf_url` pointing to arXiv PDF — do not download locally unless admin explicitly approves
7. Insert with `status = 'pending_review'`

**Output proof required:**
```
source_count: N
imported_count: N
skipped_duplicate_count: N
rejected_unsafe_count: N
downloaded_file_count: 0

sample paper item:
  title: "..."
  authors: ["...", "..."]
  abstract: "..."
  arxiv_id: "XXXX.XXXXX"
  pdf_url: "https://arxiv.org/pdf/..."
  domain: "ai-ml"
  license_type: "open-access"
  status: "pending_review"
```

---

## Gutenberg ingestion (`ingest_gutenberg.py`)

**Library / API:** Gutendex API (`https://gutendex.com/books/`)
**Python helper:** `py-gutenberg` (optional)

**Process:**
1. Query Gutendex API by subject/topic (e.g., `mathematics`, `computer science`, `logic`)
2. For each result: extract title, author, gutenberg_id, subjects, languages, download links
3. Confirm `public-domain` status (all Gutenberg books are public-domain in the US)
4. Download `.txt` file to `content_files` store
5. Record `license_type = 'public-domain'`, `source_url`, `attribution`, `license_proof_url`
6. Compute `sha256_hash` of downloaded file
7. Insert into `content_items` with `status = 'pending_review'`
8. If download fails or hash cannot be verified, skip and count as `rejected_unsafe_count`

**Output proof required:**
```
source_count: N
imported_count: N
skipped_duplicate_count: N
rejected_unsafe_count: N
downloaded_file_count: N

sample book item:
  title: "..."
  author: "..."
  gutenberg_id: NNNN
  license_type: "public-domain"
  attribution: "Public domain in the US. Source: Project Gutenberg."
  license_proof_url: "https://www.gutenberg.org/ebooks/NNNN"
  file_format: "txt"
  sha256_hash: "..."
  status: "pending_review"
```

---

## Domain filter proof

After ingestion, every implementation phase must include a domain filter smoke check:

```
domain filter result (domain=maths):
  matching items: N
  sample titles: ["...", "...", "..."]

domain filter result (domain=ai-ml):
  matching items: N
  sample titles: ["...", "...", "..."]
```

---

## Admin review publish proof

Phase 26d must prove the review flow works end-to-end:

```
admin review publish result:
  item_id: <uuid>
  review_action: approve
  reviewed_by: <admin user id>
  reviewed_at: <ISO timestamp>
  new_status: published
  was_student_visible_before: false
  is_student_visible_after: true
```

---

## Student reading progress proof

Phase 26f must prove progress tracking works:

```
student reading progress update:
  user_id: <id>
  content_item_id: <uuid>
  progress_percent: 47.50
  current_position: "chapter-3"
  last_read_at: <ISO timestamp>
  completed_at: null
```

---

## Internet Archive usage (Phase 26c+, optional)

If Internet Archive items are added in a future phase, every item must pass:

- [ ] `licenseurl` field present and points to confirmed public-domain or open license
- [ ] Not under controlled digital lending (CDL) or borrow-only restrictions
- [ ] Admin has reviewed and approved before publish
- [ ] `license_type`, `source_url`, `attribution`, and `license_proof_url` all populated

Default: reject any Internet Archive item where license cannot be confirmed from metadata.
