# Article Source Connectors

**Phase:** 26c — Study Materials source connector planning
**Status:** Draft — reference only, no ingestion

---

## Overview

Article connectors ingest **metadata only** by default: title, short summary, author, published date, and canonical `source_url`. Full article body text is forbidden unless a source is explicitly configured with `full_text_allowed = true` and the upstream license permits storage.

**MVP first choice:** `kurtmckee/feedparser` for RSS/Atom feeds.

**Global rule for every source below:** Do not fork. Do not merge.

---

## 1. RSS / Atom feeds (feedparser)

| Field | Value |
|---|---|
| **source_name** | RSS / Atom Feed Parser |
| **source_type** | `rss` |
| **repo_or_api_name** | `kurtmckee/feedparser` |
| **purpose** | Parse RSS 2.0 and Atom feeds to discover new article metadata (title, description/summary, link, author, published date) |
| **allowed_content** | Feed entry title; short description or summary from feed (not scraped full page); canonical article URL; author and published date when present in feed |
| **forbidden_content** | Full article body scraped from linked pages; paywalled content text; content where feed terms prohibit redistribution |
| **license_safety_rule** | Default `license_type = no-full-text`. Set `content_body = null`. Preserve `source_url`. Only populate `content_body` when source config has `full_text_allowed = true` AND license is confirmed (e.g. CC-BY feed). |
| **fork_merge_decision** | **Do not fork. Do not merge.** Use as a pip dependency in Phase 26c+ lab `requirements.txt` only. |
| **mvp_priority** | **P0** — first article connector |
| **future_ingestion_fields** | `external_id` (feed entry id or link hash), `title`, `summary`, `source_url`, `author`, `published_date`, `source_type` (`rss` / `atom`), `license_type`, `content_body` (null), `domain`, `tags`, `review_status` |
| **output_proof_required** | Run counts: `source_count`, `imported_count`, `skipped_duplicate_count`, `rejected_unsafe_count`, `downloaded_file_count: 0`. Sample item with `content_body: null`, `license_type: no-full-text`, `status: pending_review`. |

---

## 2. Web text extraction (trafilatura)

| Field | Value |
|---|---|
| **source_name** | Trafilatura Web Extractor |
| **source_type** | `library` |
| **repo_or_api_name** | `adbar/trafilatura` |
| **purpose** | Optional prototype helper to extract clean text or metadata from a known-allowed URL when license explicitly permits full-text storage |
| **allowed_content** | Metadata extraction for prototyping; full text only when admin-approved source has confirmed open license |
| **forbidden_content** | Default use for bulk article body extraction; any copyrighted full text without explicit license proof |
| **license_safety_rule** | Disabled by default in MVP. When enabled per-source: require `full_text_allowed = true`, confirmed `license_type`, and admin review before publish. Never run against arbitrary URLs without source allowlist. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Reference library only. |
| **mvp_priority** | P2 — prototype / opt-in only |
| **future_ingestion_fields** | Same as RSS; optional `content_body` when license confirmed; `extraction_method: trafilatura` |
| **output_proof_required** | Counts plus sample with `content_body: null` unless license proof fields populated. |

---

## 3. Web article metadata (newspaper4k)

| Field | Value |
|---|---|
| **source_name** | Newspaper4k Article Parser |
| **source_type** | `library` |
| **repo_or_api_name** | `AndyTheFactory/newspaper4k` |
| **purpose** | Extract article metadata (title, authors, publish date, top image URL) from HTML pages for enrichment — not default body storage |
| **allowed_content** | Title, author, published date, lead image URL, canonical URL when license is link-only |
| **forbidden_content** | Full article text by default; images stored locally without license check |
| **license_safety_rule** | Metadata-only mode in MVP. Do not persist `content_body`. `license_type = no-full-text` unless source license explicitly allows more. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Reference library only. |
| **mvp_priority** | P2 — enrichment prototype |
| **future_ingestion_fields** | `title`, `author`, `published_date`, `source_url`, `summary` (admin or feed-derived only), `top_image_url` (optional, link only), `license_type`, `content_body` (null) |
| **output_proof_required** | Counts plus sample metadata record with `content_body: null`. |

---

## 4. Hacker News API

| Field | Value |
|---|---|
| **source_name** | Hacker News Public API |
| **source_type** | `web-api` |
| **repo_or_api_name** | `HackerNews/API` |
| **purpose** | Fetch story metadata (title, URL, score, author, time) for curated tech/career reading lists |
| **allowed_content** | Story title; external `source_url` (HN discussion or linked article URL); HN item id; author handle; timestamp |
| **forbidden_content** | Full text of linked external articles; comment thread bodies stored locally |
| **license_safety_rule** | Store HN metadata and outbound link only. `license_type = no-full-text`. Linked article content is never fetched or stored in MVP. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Public REST API reference only. |
| **mvp_priority** | P1 — after RSS MVP |
| **future_ingestion_fields** | `external_id` (HN item id), `title`, `source_url`, `author`, `published_date`, `hn_score`, `domain`, `tags`, `source_type: hackernews`, `license_type: no-full-text`, `content_body: null` |
| **output_proof_required** | Counts plus sample story with HN id, title, URL, `content_body: null`. |

---

## 5. DEV Community (Forem) API

| Field | Value |
|---|---|
| **source_name** | DEV Community API |
| **source_type** | `web-api` |
| **repo_or_api_name** | `Forem/DEV API` |
| **purpose** | Fetch DEV.to article metadata (title, description, URL, tags, published date) for developer learning content |
| **allowed_content** | Article title; short description from API; canonical URL; tags; published date; author username |
| **forbidden_content** | Full `body_markdown` or `body_html` stored locally unless DEV terms and author license explicitly allow it and admin approves |
| **license_safety_rule** | MVP: use API description field as summary only (typically short). `license_type = no-full-text`. Do not store full post body. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Public API reference only. |
| **mvp_priority** | P1 — after RSS MVP |
| **future_ingestion_fields** | `external_id` (DEV article id), `title`, `summary`, `source_url`, `author`, `published_date`, `tags`, `source_type: dev-to`, `license_type: no-full-text`, `content_body: null` |
| **output_proof_required** | Counts plus sample with description-length summary only, `content_body: null`. |

---

## Article ingestion defaults (all sources)

| Setting | Default |
|---|---|
| `content_body` | `null` |
| `license_type` | `no-full-text` |
| `review_status` | `pending_review` |
| `downloaded_file_count` | `0` |
| Full text storage | Forbidden unless explicit source flag + license proof |

See [SOURCE_PRIORITY_MVP.md](./SOURCE_PRIORITY_MVP.md) for rollout order.
