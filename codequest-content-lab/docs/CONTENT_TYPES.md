# Content Types

**Phase:** 26b — Isolated Content Lab
**Status:** Draft

---

## Overview

The Study Materials platform supports seven content types. Each type has different storage rules depending on license status.

---

## 1. Article

A news article, blog post, or tutorial from an external source.

**Full text storage:** Only if the source's license explicitly permits it. Default is `no-full-text`.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `summary` | Yes | Short, 1–3 sentences from feed description or admin-written |
| `source_url` | Yes | Original article URL; must be preserved permanently |
| `author` | No | From feed metadata |
| `published_date` | No | From feed metadata |
| `domain` | Yes | One primary domain |
| `tags` | No | Free-form |
| `license_type` | Yes | Default: `no-full-text` |
| `content_body` | No | **Empty unless `full_text_allowed = TRUE` on source** |
| `review_status` | Yes | `draft` → `pending_review` → `approved` / `rejected` |
| `source_type` | Yes | `rss`, `atom`, `manual` |

---

## 2. Book

A full-length book, typically public-domain.

**Full text storage:** Only for confirmed public-domain or open-license books.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `author` | Yes | |
| `source_url` | Yes | Gutenberg, Standard Ebooks, or other source URL |
| `gutenberg_id` | No | If sourced from Project Gutenberg |
| `license_type` | Yes | Must be `public-domain` or equivalent |
| `content_body` | No | Full text only for confirmed public-domain |
| `file_path` | No | Stored file path in lab content store |
| `domain` | Yes | One primary domain |
| `tags` | No | Free-form |
| `review_status` | Yes | `draft` → `pending_review` → `approved` / `rejected` |
| `source_type` | Yes | `gutenberg`, `standard-ebooks`, `manual` |
| `attribution` | Yes (if file stored) | |
| `license_proof_url` | Yes (if file stored) | |

---

## 3. Ebook

A formatted ebook (EPUB, MOBI), typically public-domain.

Same rules as **Book**. Primary distinction is format — ebooks are EPUB/MOBI, books may be plain text.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `author` | Yes | |
| `source_url` | Yes | |
| `file_format` | Yes | `epub`, `mobi` |
| `license_type` | Yes | Must be `public-domain` or equivalent |
| `review_status` | Yes | |
| `source_type` | Yes | `standard-ebooks`, `gutenberg`, `manual` |

---

## 4. Text File

Plain text version of a public-domain book or document.

Same rules as **Book**. Format is always `.txt`.

---

## 5. Research Paper

An academic paper from arXiv, OpenAlex, or similar source.

**Full text / PDF storage:** Store abstract only. Link to PDF on original host. Download PDF only if `open-access` confirmed.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `authors` | Yes | Array |
| `abstract` | Yes | Short abstract from metadata |
| `source_url` | Yes | Link to abstract page |
| `pdf_url` | No | Link to PDF on original host (not stored locally) |
| `published_date` | No | |
| `arxiv_id` | No | If arXiv source |
| `openalex_id` | No | If OpenAlex source |
| `domain` | Yes | One primary domain |
| `tags` | No | Free-form |
| `license_type` | Yes | `open-access`, `cc-by`, or `unknown` |
| `review_status` | Yes | |
| `source_type` | Yes | `arxiv`, `openalex`, `manual` |

---

## 6. Notes

Admin-created or instructor-created learning notes. No external license concern.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `content_body` | Yes | Full content — admin-created |
| `domain` | Yes | |
| `tags` | No | |
| `author` | Yes | Admin/instructor who created it |
| `review_status` | Yes | |
| `source_type` | Yes | Always `manual` |
| `license_type` | Yes | Always `internal` |

---

## 7. External Link

A curated external resource with a title and summary only. No content stored.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `summary` | Yes | Admin-written description |
| `source_url` | Yes | |
| `domain` | Yes | |
| `tags` | No | |
| `review_status` | Yes | |
| `source_type` | Yes | `manual` |
| `license_type` | Yes | `no-full-text` |

---

## Review status flow

All content items (regardless of type) follow this status progression:

```
draft → pending_review → approved
                      → rejected
         (any status) → flagged
```

Only `approved` items are visible to students. All other statuses are admin-only.

---

## license_type values

| Value | Meaning |
|---|---|
| `public-domain` | Confirmed public domain (US) |
| `cc-by` | Creative Commons Attribution |
| `cc-by-sa` | CC Attribution-ShareAlike |
| `cc-by-nc` | CC Attribution-NonCommercial |
| `open-access` | Open access academic paper |
| `internal` | Admin-created content, no external license |
| `no-full-text` | Third-party content; summary and link only |
| `unknown` | License not yet determined |
