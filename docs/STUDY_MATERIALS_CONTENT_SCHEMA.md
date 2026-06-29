# Study Materials Content Schema

**Branch:** `phase-26a-study-materials-content-platform-plan`
**Phase:** 26a — Planning and Documentation Only
**Status:** Draft
**Date:** 2026-06-29

---

## Overview

This document defines all proposed database entities for the Study Materials content platform. No migrations are written here. This is schema planning only.

All tables will be implemented in the main Code Quest database (PostgreSQL) in a future approved implementation phase. All entity names use snake_case. All timestamps use `TIMESTAMPTZ`.

---

## Entity Index

| Entity | Purpose |
|---|---|
| `content_sources` | Registered content sources (RSS feeds, APIs, manual) |
| `content_items` | Individual articles, books, papers, notes, ebooks |
| `content_files` | Actual stored files for public-domain/open-license content |
| `content_domains` | Domain taxonomy (Maths, Python, DSA, etc.) |
| `content_tags` | Free-form tags |
| `content_item_tags` | Join table: content items to tags |
| `content_collections` | Curated ordered reading paths |
| `content_collection_items` | Join table: items in a collection with ordering |
| `student_saved_content` | Student bookmarks / saved items |
| `student_reading_progress` | Per-student per-item reading progress |
| `content_ingestion_runs` | Log of each automated ingestion run |
| `content_review_queue` | Admin review queue entries |

---

## 1. `content_sources`

Tracks registered sources that feed content into the platform.

```
content_sources
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name                TEXT NOT NULL
  slug                TEXT NOT NULL UNIQUE
  source_type         TEXT NOT NULL
                        -- 'rss', 'atom', 'arxiv', 'openalex',
                        -- 'gutenberg', 'standard_ebooks',
                        -- 'internet_archive', 'manual'
  feed_url            TEXT
  api_endpoint        TEXT
  base_url            TEXT
  default_domain_id   UUID REFERENCES content_domains(id)
  full_text_allowed   BOOLEAN NOT NULL DEFAULT FALSE
  license_type        TEXT
                        -- 'public-domain', 'cc-by', 'cc-by-sa',
                        -- 'cc-by-nc', 'open-access', 'no-full-text', 'unknown'
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
  notes               TEXT
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 2. `content_items`

The core entity. One row per article, book, paper, note, ebook, or external link.

```
content_items
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  source_id           UUID REFERENCES content_sources(id)
  content_type        TEXT NOT NULL
                        -- 'article', 'book', 'ebook', 'text-file',
                        -- 'research-paper', 'notes', 'external-link'
  title               TEXT NOT NULL
  slug                TEXT NOT NULL UNIQUE
  summary             TEXT
  content_body        TEXT
                        -- NULL for articles unless full_text_allowed is TRUE on source
                        -- Populated for public-domain books, notes, text files
  author              TEXT
  authors             TEXT[]
                        -- For research papers with multiple authors
  source_url          TEXT
  pdf_url             TEXT
                        -- Research papers: link to PDF on original host
  published_date      DATE
  domain_id           UUID REFERENCES content_domains(id)
  gutenberg_id        INTEGER
  arxiv_id            TEXT
  openalex_id         TEXT
  license_type        TEXT NOT NULL DEFAULT 'unknown'
                        -- Same values as content_sources.license_type
  attribution         TEXT
                        -- Required attribution string for open-license content
  file_id             UUID REFERENCES content_files(id)
  reading_time_mins   INTEGER
                        -- Estimated reading time; computed on ingest
  difficulty_level    TEXT
                        -- 'beginner', 'intermediate', 'advanced', null
  status              TEXT NOT NULL DEFAULT 'pending_review'
                        -- 'pending_review', 'published', 'rejected', 'archived', 'flagged'
  review_notes        TEXT
  reviewed_by         INTEGER REFERENCES users(id)
  reviewed_at         TIMESTAMPTZ
  external_id         TEXT
                        -- Source-specific ID for deduplication
  language            TEXT NOT NULL DEFAULT 'en'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**Indexes:**
- `(status, content_type)` — student browse queries
- `(domain_id, status)` — domain filter queries
- `(source_id)` — ingestion deduplication
- `(external_id, source_id)` — unique constraint to prevent duplicate ingestion
- `(slug)` — unique, used for routing

---

## 3. `content_files`

Stores metadata about physically downloaded files (public-domain books, open-license ebooks, text files).

```
content_files
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  file_name           TEXT NOT NULL
  file_path           TEXT NOT NULL
                        -- Relative path within isolated content store
  file_format         TEXT NOT NULL
                        -- 'txt', 'epub', 'pdf', 'html', 'mobi'
  file_size_bytes     BIGINT
  sha256_hash         TEXT
                        -- Integrity check
  source_url          TEXT NOT NULL
                        -- Where the file was downloaded from
  license_type        TEXT NOT NULL
  attribution         TEXT NOT NULL
  license_proof_url   TEXT
                        -- URL to license statement or public-domain proof
  downloaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 4. `content_domains`

Domain taxonomy. Seeded, not user-generated.

```
content_domains
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name                TEXT NOT NULL UNIQUE
  slug                TEXT NOT NULL UNIQUE
  display_order       INTEGER NOT NULL DEFAULT 0
  icon                TEXT
                        -- Icon name or emoji for UI
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**Seed data:**

| name | slug |
|---|---|
| Mathematics | maths |
| Data Science | data-science |
| Engineering | engineering |
| Frontend | frontend |
| Backend | backend |
| Python | python |
| SQL | sql |
| Power BI | power-bi |
| Aptitude | aptitude |
| Data Structures & Algorithms | dsa |
| AI / Machine Learning | ai-ml |
| Cloud | cloud |
| Career | career |
| Resume | resume |
| Interview Prep | interview-prep |

---

## 5. `content_tags`

Free-form tags for finer-grained filtering within domains.

```
content_tags
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name                TEXT NOT NULL UNIQUE
  slug                TEXT NOT NULL UNIQUE
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 6. `content_item_tags`

Join table linking content items to tags.

```
content_item_tags
  content_item_id     UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE
  tag_id              UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE
  PRIMARY KEY (content_item_id, tag_id)
```

---

## 7. `content_collections`

Curated ordered reading paths / learning sequences.

```
content_collections
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  title               TEXT NOT NULL
  slug                TEXT NOT NULL UNIQUE
  description         TEXT
  domain_id           UUID REFERENCES content_domains(id)
  difficulty_level    TEXT
                        -- 'beginner', 'intermediate', 'advanced'
  cover_image_url     TEXT
  created_by          INTEGER REFERENCES users(id)
  status              TEXT NOT NULL DEFAULT 'draft'
                        -- 'draft', 'published', 'archived'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 8. `content_collection_items`

Join table: ordered items within a collection.

```
content_collection_items
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  collection_id       UUID NOT NULL REFERENCES content_collections(id) ON DELETE CASCADE
  content_item_id     UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE
  position            INTEGER NOT NULL DEFAULT 0
                        -- Ordering within the collection
  note                TEXT
                        -- Optional curator note for this item in context
  UNIQUE (collection_id, content_item_id)
```

---

## 9. `student_saved_content`

Per-student bookmarks.

```
student_saved_content
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  content_item_id     UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE
  saved_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
  UNIQUE (user_id, content_item_id)
```

---

## 10. `student_reading_progress`

Tracks per-student per-item reading progress.

```
student_reading_progress
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  content_item_id     UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE
  progress_percent    NUMERIC(5,2) NOT NULL DEFAULT 0
                        -- 0.00 to 100.00
  current_position    TEXT
                        -- Scroll offset, page number, or chapter marker
  last_read_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  completed_at        TIMESTAMPTZ
                        -- Set when progress_percent >= 95
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  UNIQUE (user_id, content_item_id)
```

---

## 11. `content_ingestion_runs`

Log of each automated ingestion run for audit, deduplication, and output proof.

```
content_ingestion_runs
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  source_id           UUID REFERENCES content_sources(id)
  run_type            TEXT NOT NULL
                        -- 'rss', 'arxiv', 'openalex', 'gutenberg',
                        -- 'standard_ebooks', 'internet_archive', 'manual'
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  completed_at        TIMESTAMPTZ
  status              TEXT NOT NULL DEFAULT 'running'
                        -- 'running', 'completed', 'failed', 'partial'
  source_count        INTEGER DEFAULT 0
                        -- Number of source records fetched
  imported_count      INTEGER DEFAULT 0
                        -- Number of new items successfully imported
  skipped_duplicate_count INTEGER DEFAULT 0
  rejected_unsafe_count   INTEGER DEFAULT 0
  downloaded_file_count   INTEGER DEFAULT 0
  error_message       TEXT
  run_log             JSONB
                        -- Detailed per-item log for audit
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 12. `content_review_queue`

Admin review queue. One entry per content item awaiting review.

```
content_review_queue
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  content_item_id     UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE
  ingestion_run_id    UUID REFERENCES content_ingestion_runs(id)
  queued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
  assigned_to         INTEGER REFERENCES users(id)
  status              TEXT NOT NULL DEFAULT 'pending'
                        -- 'pending', 'in_review', 'approved', 'rejected', 'flagged'
  review_action       TEXT
                        -- 'approve', 'reject', 'edit', 'flag', 'archive'
  review_notes        TEXT
  reviewed_by         INTEGER REFERENCES users(id)
  reviewed_at         TIMESTAMPTZ
  UNIQUE (content_item_id)
```

---

## Entity Relationship Summary

```
content_sources ──< content_items >── content_files
                                  >── content_domains
                                  >── content_item_tags >── content_tags
                                  >── content_collection_items >── content_collections
                                  >── student_saved_content
                                  >── student_reading_progress
                                  >── content_review_queue
content_ingestion_runs >── content_review_queue
users >── content_review_queue
users >── student_saved_content
users >── student_reading_progress
users >── content_collections (created_by)
```

---

## Notes on `users` Reference

`content_items.reviewed_by`, `content_review_queue.assigned_to/reviewed_by`, and `content_collections.created_by` reference `users(id)` from the existing Code Quest users table. These foreign keys will use the existing user model — no new user types are introduced in this schema.

---

## References

- `docs/STUDY_MATERIALS_CONTENT_PLATFORM_PLAN.md` — Product plan and content types
- `docs/STUDY_MATERIALS_CONTENT_SAFETY_RULES.md` — Which fields are mandatory for legal compliance
- `docs/STUDY_MATERIALS_BRANCH_SEQUENCE.md` — When migrations are written (Phase 26c+)
