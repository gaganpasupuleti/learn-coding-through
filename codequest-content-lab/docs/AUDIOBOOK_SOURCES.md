# Audiobook Source Connectors

**Phase:** 26c — Study Materials source connector planning
**Status:** Draft — metadata planning only, no audio downloads

---

## Overview

Audiobook connectors ingest **metadata and outbound links** in MVP. Audio files (MP3, M4B, etc.) must not be downloaded in this branch. LibriVox is the first-choice source because its catalog is public-domain volunteer readings with clear licensing.

**MVP first choice:** LibriVox API for public-domain audiobook metadata.

**Global rule for every source below:** Do not fork. Do not merge.

**This branch:** Audiobook files must not be downloaded.

---

## 1. LibriVox API

| Field | Value |
|---|---|
| **source_name** | LibriVox |
| **source_type** | `metadata-api` |
| **repo_or_api_name** | LibriVox API |
| **purpose** | Fetch public-domain audiobook metadata: title, author, narrator, language, duration, LibriVox URL, section/chapter list references |
| **allowed_content** | Title; author; narrator; language; total duration; canonical LibriVox project URL; section titles and external stream/download URLs as **links only** (not fetched in MVP) |
| **forbidden_content** | Downloading MP3/M4B files in this branch; storing audio binaries locally without license proof workflow; mixing non–public-domain readings |
| **license_safety_rule** | LibriVox recordings are public domain in the US (same underlying text license). `license_type = public-domain`. `attribution` must credit LibriVox and readers. Before any future local audio storage: record `license_proof_url`, `source_url`, and `sha256_hash` per file. MVP: link-only. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Public API reference only. |
| **mvp_priority** | **P0** — first audiobook connector |
| **future_ingestion_fields** | `external_id` (LibriVox project id), `content_type: audiobook`, `title`, `author`, `narrator`, `language`, `duration_secs`, `source_url`, `section_count`, `license_type: public-domain`, `attribution`, `license_proof_url`, `audio_file_path` (null in MVP), `sha256_hash` (null in MVP), `domain`, `tags`, `review_status` |
| **output_proof_required** | Counts plus sample audiobook with LibriVox URL, `audio_file_path: null`, `license_type: public-domain`, `status: pending_review`. |

---

## 2. Internet Archive (internetarchive library)

| Field | Value |
|---|---|
| **source_name** | Internet Archive Audiobooks |
| **source_type** | `library` |
| **repo_or_api_name** | `jjjake/internetarchive` |
| **purpose** | Future optional connector to search Internet Archive audio items with strict license filtering |
| **allowed_content** | Metadata for items with confirmed public-domain or CC license in `licenseurl` field; outbound link to IA detail page |
| **forbidden_content** | Borrow-only / controlled digital lending items; items with missing or ambiguous license; downloading audio in this branch; any item without admin review |
| **license_safety_rule** | **Deferred.** When implemented: reject unless `licenseurl` confirms public-domain or allowed CC license; reject CDL/borrow-only; require admin approval before publish; never download without `license_proof_url`, `attribution`, and `sha256_hash`. Default: metadata link-only. |
| **fork_merge_decision** | **Do not fork. Do not merge.** Python library reference only for a future lab script. |
| **mvp_priority** | **deferred** — after LibriVox MVP is stable |
| **future_ingestion_fields** | `external_id` (IA identifier), `title`, `author`, `source_url`, `license_type`, `license_proof_url`, `attribution`, `duration_secs`, `audio_file_path` (null until approved download), `ia_collection`, `review_status` |
| **output_proof_required** | Counts plus sample with IA identifier, confirmed `licenseurl` reference, `audio_file_path: null`, `rejected_unsafe_count` for any item failing license filter. |

---

## Audiobook content type (planned)

Audiobooks extend the Study Materials catalog as `content_type: audiobook`. Storage rules mirror books:

| Field | MVP default |
|---|---|
| `audio_file_path` | `null` |
| `sha256_hash` | `null` |
| `license_type` | `public-domain` (LibriVox) |
| `content_body` | `null` (no transcript unless separately licensed) |
| `review_status` | `pending_review` |
| Local audio files | **Forbidden in this branch** |

Students would stream or link out to source URLs until a future phase approves hosted files with license proof.

---

## Related docs

- [CONTENT_TYPES.md](./CONTENT_TYPES.md) — book/ebook rules (audiobook fields align closely)
- [LAB_SCOPE.md](./LAB_SCOPE.md) — Internet Archive CDL restrictions
- [SOURCE_PRIORITY_MVP.md](./SOURCE_PRIORITY_MVP.md) — LibriVox before Internet Archive
