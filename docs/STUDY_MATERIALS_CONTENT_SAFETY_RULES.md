# Study Materials Content Safety Rules

**Branch:** `phase-26a-study-materials-content-platform-plan`
**Phase:** 26a — Planning and Documentation Only
**Status:** Draft
**Date:** 2026-06-29

---

## Purpose

This document defines the legal and content safety rules that govern every piece of content in the Study Materials platform. These rules apply to all ingestion scripts, admin review workflows, and any file storage decisions.

These rules are non-negotiable. They must be enforced by ingestion code, checked in admin review, and preserved throughout the platform lifetime.

---

## Rule 1: Do Not Store Full Copyrighted Article Text

**Rule:** Never store the full body text of a third-party article unless the license of that source or article explicitly permits storage and republication.

**Applies to:** Articles ingested via RSS, Atom feeds, or web extraction.

**What to store instead:**
- Title
- Short summary (up to ~300 characters; use the RSS feed's `<description>` or `<summary>` element, not extracted body)
- Original source URL
- Author name(s)
- Published date
- Domain and tags
- License type (default: `no-full-text`)

**What NOT to store:**
- Full article body unless `full_text_allowed = TRUE` on the source record AND a valid license permits it

**How to mark an exception:**
- Admin must set `content_sources.full_text_allowed = TRUE`
- Admin must record the license type and a license proof URL
- Content item `license_type` must be set to `cc-by`, `cc-by-sa`, `cc-by-nc`, or equivalent

---

## Rule 2: Store Full Files Only for Public-Domain or Open-License Content

**Rule:** Only download and store a complete file (`.txt`, `.epub`, `.pdf`) when the content is confirmed public-domain or carries a compatible open license.

**Public-domain thresholds (US law):**
- Published before 1928: public domain in the US (use this as a conservative lower bound)
- Gutenberg books: all confirmed public-domain; always acceptable
- Standard Ebooks: verify each ebook individually; most are public-domain
- Internet Archive: use `license` metadata field; reject anything without a confirmed public-domain or open license flag

**Rule:** When in doubt, do not download. Add to review queue with `license_type = 'unknown'` and await admin decision.

---

## Rule 3: Mandatory Fields for Any Stored File

Every row in `content_files` must have all of the following fields populated before the file is stored:

| Field | Required |
|---|---|
| `source_url` | Yes — where the file came from |
| `license_type` | Yes — must not be `unknown` for files; must be confirmed |
| `attribution` | Yes — attribution string as required by the license |
| `license_proof_url` | Yes — URL pointing to the license statement or public-domain proof |
| `sha256_hash` | Yes — computed on download for integrity |

**Rule:** If any of these fields cannot be populated with a confirmed value, the file must not be stored. The item may be added to `content_items` as a link-only item without a file.

---

## Rule 4: Track License Type on Every Content Item

Every row in `content_items` must have a `license_type` value. The default is `unknown`.

| `license_type` | Meaning | Full text stored? | Full file stored? |
|---|---|---|---|
| `public-domain` | Confirmed public domain | Yes | Yes |
| `cc-by` | Creative Commons Attribution | Yes | Yes |
| `cc-by-sa` | CC Attribution-ShareAlike | Yes | Yes |
| `cc-by-nc` | CC Attribution-NonCommercial | Yes (non-commercial use) | Yes |
| `open-access` | Open access academic paper | Abstract only unless confirmed CC | PDF link only |
| `no-full-text` | Third-party article, no republication right | No — summary and link only | No |
| `unknown` | License not yet determined | No | No |

**Rule:** Items with `license_type = 'no-full-text'` or `'unknown'` must have `content_body = NULL` and `file_id = NULL`.

---

## Rule 5: Admin Review Before Any Item Becomes Visible to Students

**Rule:** No content item may be visible to students until it reaches `status = 'published'` via admin review.

The review flow is:
1. Ingestion job creates item with `status = 'pending_review'`
2. Item enters `content_review_queue`
3. Admin reviews and checks the safety checklist
4. Admin sets `review_action = 'approve'` → item status becomes `published`
5. Only then does the item appear in student-facing queries

**Admin review checklist before approving any item:**

- [ ] Title is accurate and not misleading
- [ ] Summary is present and meaningful
- [ ] Source URL is reachable and legitimate
- [ ] `license_type` is set to a confirmed value (not `unknown`)
- [ ] If `content_body` is populated: confirm license explicitly permits full text storage
- [ ] If `file_id` is set: confirm `content_files` record has `source_url`, `attribution`, `license_proof_url`, and `sha256_hash`
- [ ] Tags and domain are correctly set
- [ ] Content is appropriate for a student learning platform

---

## Rule 6: Attribution Must Be Preserved

**Rule:** For any content stored under Creative Commons or any license that requires attribution, the `attribution` field in `content_items` and `content_files` must be populated with the attribution string specified by the license or the source.

Attribution must appear in any UI that renders the content.

---

## Rule 7: Source URLs Must Be Preserved

**Rule:** `content_items.source_url` must never be removed or overwritten after initial ingestion. It is the permanent record of the original source.

Even for public-domain content where the full file is stored locally, the original source URL must remain in the record.

---

## Rule 8: No Research Paper PDFs Stored Without Confirmed Open Access

**Rule:** Do not download and store a research paper PDF locally unless:
- The paper has `is_oa = TRUE` (OpenAlex) or equivalent confirmed open-access status
- The paper's license is `cc-by`, `cc-by-sa`, or clearly stated as open
- Admin has confirmed and approved

For all other research papers, store metadata and abstract only. Provide `pdf_url` linking to the PDF on the original publisher's server (arXiv, journal, etc.) without local download.

---

## Rule 9: Internet Archive Items Require Strict License Filtering

**Rule:** Internet Archive items must pass all of the following checks before ingestion:

- [ ] `licenseurl` field is present and points to a public-domain or confirmed open license
- [ ] Item is not under controlled digital lending (CDL) or borrow-only restrictions
- [ ] Item is not in the "lending library" collection without open license confirmation
- [ ] Admin has reviewed and approved

Default behavior: reject any Internet Archive item where license cannot be confirmed from its metadata fields.

---

## Rule 10: Ingestion Scripts Must Emit Rejection Counts

**Rule:** Every ingestion run must produce the following output counts, stored in `content_ingestion_runs`:

| Field | What it counts |
|---|---|
| `source_count` | Records fetched from the source |
| `imported_count` | New items successfully created |
| `skipped_duplicate_count` | Items skipped because `(external_id, source_id)` already exists |
| `rejected_unsafe_count` | Items rejected due to missing/unknown license or safety rule violation |
| `downloaded_file_count` | Files downloaded and stored in `content_files` |

The `run_log` JSONB field must include the reason for each rejection (e.g., `"license_unknown"`, `"no_source_url"`, `"duplicate"`, `"full_text_blocked"`).

---

## Rule 11: Web Extraction Is Off by Default

**Rule:** `trafilatura`, `newspaper4k`, and similar web extraction tools must not be used to extract and store full article text unless:
- The source has `full_text_allowed = TRUE` in `content_sources`
- The source's license has been reviewed and confirmed
- Admin approval has been granted for that source

Default ingestion from RSS/Atom feeds uses the feed summary/description only.

---

## Rule 12: Standard Ebooks — Verify Individual Files, Not Organization-Level

**Rule:** Do not assume all Standard Ebooks content is usable. While Standard Ebooks produces public-domain ebooks, each individual title must be verified independently:

- Check that the original work is public-domain
- Record the Standard Ebooks source URL and the Project Gutenberg/public-domain proof where applicable
- Store `attribution` as specified on the Standard Ebooks book page

---

## Violation Response

If an ingestion run or manual review discovers that a content item was stored in violation of these rules:

1. Set `content_items.status = 'flagged'`
2. Add a `content_review_queue` entry with `status = 'flagged'` and a note describing the violation
3. Remove `content_body` and `file_id` from the item immediately
4. Delete the corresponding `content_files` row and the physical file if applicable
5. Do not restore the item to `published` status until the violation is resolved and admin re-approves

---

## References

- `docs/STUDY_MATERIALS_CONTENT_SOURCES.md` — Source strategy and approved tools
- `docs/STUDY_MATERIALS_CONTENT_SCHEMA.md` — Fields referenced in these rules
- `docs/STUDY_MATERIALS_CONTENT_PLATFORM_PLAN.md` — Admin review flow
