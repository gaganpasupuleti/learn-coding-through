# Book and Ebook Source Connectors

**Phase:** 26c — Study Materials source connector planning
**Status:** Draft — metadata planning only, no file downloads

---

## Overview

Book and ebook connectors target **confirmed public-domain or open-license** works. Phase 26c planning ingests **metadata first**; file download (`.txt`, `.epub`) requires license proof fields and happens only in a later approved ingestion phase.

**MVP first choice:** `garethbjohnson/gutendex` for Project Gutenberg public-domain book metadata.

**Global rule for every source below:** Do not fork. Do not merge.

**This branch:** Book and ebook files must not be downloaded.

---

## 1. Gutendex API

| Field | Value |
|---|---|
| **source_name** | Gutendex |
| **source_type** | `metadata-api` |
| **repo_or_api_name** | `garethbjohnson/gutendex` |
| **purpose** | Query Project Gutenberg catalog metadata: title, authors, subjects, languages, Gutenberg id, download link references |
| **allowed_content** | Title, author(s), subjects, languages, `gutenberg_id`, Gutenberg ebook URL, format hints (txt/epub URLs as links only in MVP) |
| **forbidden_content** | Downloading book files in Phase 26c planning branch; storing full book text without `license_type = public-domain` and proof fields |
| **license_safety_rule** | All Gutenberg US catalog items treated as `public-domain` in the US. Before any file download (later phase): require `attribution`, `license_proof_url`, `sha256_hash`. MVP: metadata and link-only records only. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Use public Gutendex API or self-host in lab only as a dependency/service reference — not vendored into repo. |
| **mvp_priority** | **P0** — first book/ebook metadata connector |
| **future_ingestion_fields** | `external_id` (gutenberg_id), `title`, `author`, `source_url`, `gutenberg_id`, `subjects`, `languages`, `file_format`, `license_type: public-domain`, `attribution`, `license_proof_url`, `file_path` (null in MVP), `sha256_hash` (null in MVP), `domain`, `tags`, `review_status` |
| **output_proof_required** | Counts plus sample book with `gutenberg_id`, `license_type: public-domain`, `file_path: null`, `sha256_hash: null`, `status: pending_review`. |

---

## 2. Project Gutenberg (via Gutendex)

| Field | Value |
|---|---|
| **source_name** | Project Gutenberg |
| **source_type** | `metadata-api` |
| **repo_or_api_name** | Project Gutenberg via `garethbjohnson/gutendex` |
| **purpose** | Canonical public-domain book catalog; Gutendex is the planned query layer — do not scrape gutenberg.org HTML directly in MVP |
| **allowed_content** | Public-domain metadata; link to `https://www.gutenberg.org/ebooks/{id}` |
| **forbidden_content** | Bulk HTML scraping; storing copyrighted modern additions; downloading files in this branch |
| **license_safety_rule** | `license_type = public-domain` for US catalog. `license_proof_url` must point to the Gutenberg ebook page. File download deferred until proof workflow is implemented. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Access via Gutendex API reference only. |
| **mvp_priority** | **P0** (same pipeline as Gutendex) |
| **future_ingestion_fields** | Same as Gutendex; `source_type: gutenberg` |
| **output_proof_required** | Same as Gutendex sample proof. |

---

## 3. Standard Ebooks tooling

| Field | Value |
|---|---|
| **source_name** | Standard Ebooks Tools |
| **source_type** | `library` |
| **repo_or_api_name** | `standardebooks/tools` |
| **purpose** | Reference for how Standard Ebooks produces EPUBs; future lab script may mirror metadata fields — not used to vend tooling into Code Quest |
| **allowed_content** | Understanding of SE ebook structure; metadata field mapping for EPUB sources |
| **forbidden_content** | Forking or merging the tools repo; running production ingestion from unreleased SE repos without catalog confirmation |
| **license_safety_rule** | Standard Ebooks works are public domain with SE production credit. Before file storage: `attribution` must credit Standard Ebooks; `license_proof_url` must be the SE ebook page. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Documentation reference only. |
| **mvp_priority** | P2 — after Gutendex + SE catalog metadata |
| **future_ingestion_fields** | `title`, `author`, `source_url` (standardebooks.org page), `file_format: epub`, `source_type: standard-ebooks`, `license_type: public-domain`, `attribution`, `license_proof_url`, `file_path`, `sha256_hash` |
| **output_proof_required** | Metadata sample with SE URL; `file_path: null` in MVP. |

---

## 4. Standard Ebooks public repos

| Field | Value |
|---|---|
| **source_name** | Standard Ebooks Catalog |
| **source_type** | `metadata-api` |
| **repo_or_api_name** | Standard Ebooks public GitHub ebook repos |
| **purpose** | Discover curated public-domain EPUB editions with consistent metadata and cover art references |
| **allowed_content** | Title, author, SE canonical URL, repo name as external reference, subjects/tags from SE metadata |
| **forbidden_content** | Cloning entire SE repo into Code Quest; downloading EPUB files in this branch |
| **license_safety_rule** | Public domain + SE attribution required before any local EPUB storage. MVP: link-only ebook records. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Catalog URLs and API/HTML metadata references only. |
| **mvp_priority** | P1 — after Gutendex MVP |
| **future_ingestion_fields** | `external_id` (SE slug), `title`, `author`, `source_url`, `file_format: epub`, `source_type: standard-ebooks`, `license_type: public-domain`, `attribution`, `license_proof_url`, `cover_image_url` (link only) |
| **output_proof_required** | Sample ebook metadata with SE URL; no local file path. |

---

## 5. Open Library API

| Field | Value |
|---|---|
| **source_name** | Open Library |
| **source_type** | `metadata-api` |
| **repo_or_api_name** | Open Library API |
| **purpose** | Enrich book metadata (title, authors, subjects, cover, OLID) and identify public-domain availability flags |
| **allowed_content** | Bibliographic metadata; Open Library work/edition ids; cover URL (link only); public-domain indicator when confirmed |
| **forbidden_content** | Treating all OL records as public domain; downloading scanned volumes without explicit PD confirmation; storing in-copyright full text |
| **license_safety_rule** | Only ingest items where public-domain status is confirmed via Open Library + cross-check with Gutenberg/SE when possible. If PD status unknown, store as link-only external reference or reject. Never set `license_type = public-domain` without proof. |
| **fork_merge_decision** | **Do not fork. Do not merge.** REST API reference only. |
| **mvp_priority** | P1 — metadata enrichment after Gutendex |
| **future_ingestion_fields** | `external_id` (olid), `title`, `author`, `source_url`, `openlibrary_id`, `subjects`, `cover_image_url`, `license_type` (public-domain or unknown), `domain`, `tags` |
| **output_proof_required** | Counts plus sample with OLID and explicit `license_type`; `file_path: null`. |

---

## Book / ebook ingestion defaults

| Setting | MVP default |
|---|---|
| File download | **Forbidden in this branch** |
| `file_path` | `null` |
| `sha256_hash` | `null` |
| `license_type` | `public-domain` only when source confirms PD |
| `review_status` | `pending_review` |
| Full text in DB | Only after confirmed PD + approved download phase |

See [SOURCE_PRIORITY_MVP.md](./SOURCE_PRIORITY_MVP.md) for rollout order.
