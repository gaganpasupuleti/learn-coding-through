# Study Materials Content Sources

**Branch:** `phase-26a-study-materials-content-platform-plan`
**Phase:** 26a — Planning and Documentation Only
**Status:** Draft
**Date:** 2026-06-29

---

## Overview

This document defines the approved sources for Study Materials content and the strategy for how each source type will be accessed. No ingestion code is written here. This is source planning only.

Every source and tool listed here is for use in the isolated `codequest-content-lab/` (Phase 26b onward). None of these tools or sources connect to the main Code Quest app until a future approved cutover phase.

---

## Source Categories

| Category | Source Type | Usage Restriction |
|---|---|---|
| Articles | RSS/Atom feeds | Metadata + summary only unless license allows full text |
| Articles | Web extraction | Only when license explicitly allows; prototype only |
| Research papers | arXiv API | Metadata + abstract + PDF link; do not store full PDF unless open license |
| Research papers | OpenAlex API | Metadata and abstract only |
| Public-domain books | Project Gutenberg / Gutendex API | Full text allowed; must confirm public-domain status |
| Public-domain ebooks | Standard Ebooks | Full text allowed; verify individual ebook license |
| Archive materials | Internet Archive | Strict license filter required; no copyrighted content |

---

## 1. Article Sources

### 1.1 RSS / Atom Feeds

RSS and Atom feeds are the safest ingestion path for articles. They provide title, summary/description, author, published date, and source URL without requiring full-text extraction.

**Allowed RSS sources (examples for future curation):**

| Feed | Domain |
|---|---|
| Towards Data Science (Medium) | Data Science, AI/ML |
| Real Python | Python |
| CSS-Tricks | Frontend |
| Dev.to (tagged feeds) | Frontend, Backend |
| Hacker News (YC) | Engineering, Career |
| arXiv new submissions (CS section) | DSA, AI/ML, Engineering |
| Planet Python | Python |
| The Pragmatic Engineer | Engineering, Career |

**Rule:** Store only title, summary, source URL, author, published date, tags, and domain from RSS. Do not store full article body from RSS unless the feed explicitly licenses its content for republishing.

### 1.2 Web Extraction (Restricted)

Web extraction tools (`newspaper4k`, `trafilatura`) can be used in the isolated lab prototype to test metadata extraction quality. They must not be used to store full article text unless:
- The site's license or Terms of Service explicitly permits content reuse
- The article is authored under Creative Commons or an equivalent open license
- Admin has reviewed and confirmed the license before publish

**Rule:** Full article text storage from web extraction is OFF by default. Admin must mark a specific source domain as `full_text_allowed` before any full text is stored.

---

## 2. Research Paper Sources

### 2.1 arXiv

- Access paper metadata (title, authors, abstract, categories, published date) via the arXiv API
- Store metadata only; link to arXiv abstract page and PDF on arXiv servers
- Do not download or store the full PDF locally unless:
  - The paper is clearly open-access or CC-licensed
  - Admin has reviewed and confirmed the license

arXiv papers are generally open-access preprints. PDFs may be downloaded for student reading only after admin review confirms open-access status.

### 2.2 OpenAlex

- Access scholarly metadata for papers, books, and reports beyond arXiv
- Store title, authors, abstract, DOI, publication venue, open-access status
- Use `is_oa` (is open access) flag to determine whether full-text download is permitted

---

## 3. Public-Domain Book Sources

### 3.1 Project Gutenberg / Gutendex

- All books on Project Gutenberg are public-domain in the US
- Access via Gutendex API (`https://gutendex.com`) for metadata: title, author, subjects, languages, download links
- Full text download is allowed; store in `content_files` with license `public-domain`
- Preferred formats: plain text (`.txt`), EPUB
- Always record `gutenberg_id`, `source_url`, and `download_url` in `content_items`

### 3.2 Standard Ebooks

- Standard Ebooks produces high-quality public-domain ebooks
- Each individual ebook must be verified as public-domain before download
- Store full ebook file in `content_files` with `license: public-domain`
- Always record original Standard Ebooks source URL and attribution

---

## 4. Archive Sources

### 4.1 Internet Archive

- Internet Archive hosts a vast range of materials including out-of-copyright books, academic texts, and historical documents
- Strict license filtering is required:
  - Only use items with confirmed `public-domain` or `open` license flags in Archive.org metadata
  - Do not use items under controlled digital lending (CDL) or borrow-only restrictions
  - Admin must review each item before publish
- Full text download is allowed only for confirmed public-domain items

---

## External Repositories and Source Strategy

Do not fork and merge external repositories directly into Code Quest.

Use external projects in one of these ways only:

1. Python dependency
2. API/source reference
3. CLI tool in isolated lab
4. Selected public-domain content source
5. Optional fork only after review and approval

---

### Article Ingestion

**kurtmckee/feedparser**

- Purpose: Parse RSS/Atom feeds.
- Usage: Python dependency.
- Fork/merge decision: Do not fork. Do not merge.

**AndyTheFactory/newspaper4k**

- Purpose: Extract article title, author, published date, text, images, and metadata.
- Usage: Python dependency in isolated ingestion prototype.
- Fork/merge decision: Do not fork. Do not merge.

**adbar/trafilatura**

- Purpose: Extract clean text and metadata from web pages.
- Usage: Python dependency or CLI in isolated ingestion prototype.
- Fork/merge decision: Do not fork. Do not merge.

---

### Research Paper Ingestion

**lukasschwab/arxiv.py**

- Purpose: Search arXiv and access paper metadata/PDF links.
- Usage: Python dependency.
- Fork/merge decision: Do not fork. Do not merge.

**J535D165/pyalex**

- Purpose: Search OpenAlex scholarly metadata.
- Usage: Python dependency.
- Fork/merge decision: Do not fork. Do not merge.

**ourresearch/openalex-official**

- Purpose: Official OpenAlex CLI for metadata/full-text workflows.
- Usage: Future CLI reference only.
- Fork/merge decision: Do not fork. Do not merge.

---

### Public-Domain Books and Ebooks

**garethbjohnson/gutendex**

- Purpose: Project Gutenberg metadata API.
- Usage: API reference. Optional self-host/fork only in separate lab if approved.
- Fork/merge decision: Do not merge into Code Quest.

**peterrauscher/py-gutenberg**

- Purpose: Access Project Gutenberg metadata and book files.
- Usage: Python dependency.
- Fork/merge decision: Do not fork. Do not merge.

**gutenbergtools**

- Purpose: Project Gutenberg tool/source organization.
- Usage: Reference only.
- Fork/merge decision: Do not merge.

**standardebooks**

- Purpose: Public-domain ebook source repositories.
- Usage: Source/reference for selected allowed ebooks.
- Fork/merge decision: Do not fork the full organization. Do not merge.

**standardebooks/tools**

- Purpose: Standard Ebooks production toolset.
- Usage: Reference only unless explicitly approved later.
- Fork/merge decision: Do not merge.

---

### Archive Sources

**jjjake/internetarchive**

- Purpose: Python and CLI access to Archive.org.
- Usage: Python dependency/CLI with strict license filtering.
- Fork/merge decision: Do not fork. Do not merge.

---

## Rule

Any full file download must store license, source URL, attribution, and public-domain/open-license proof. Copyrighted article content must not be stored as full text unless the license clearly allows it.

---

## Summary Table

| Library / Source | Type | Usage in Lab | Merge into Code Quest |
|---|---|---|---|
| feedparser | Python dep | RSS parsing | No |
| newspaper4k | Python dep | Article metadata extraction (prototype) | No |
| trafilatura | Python dep/CLI | Web text extraction (prototype) | No |
| arxiv.py | Python dep | arXiv metadata | No |
| pyalex | Python dep | OpenAlex metadata | No |
| openalex-official | CLI reference | Future reference | No |
| gutendex | API reference | Project Gutenberg metadata | No |
| py-gutenberg | Python dep | Gutenberg book files | No |
| gutenbergtools | Reference | Gutenberg tooling reference | No |
| standardebooks | Source reference | Selected public-domain ebooks | No |
| standardebooks/tools | Reference | SE production toolset reference | No |
| internetarchive | Python dep/CLI | Archive.org with license filter | No |

---

## References

- `docs/STUDY_MATERIALS_CONTENT_SAFETY_RULES.md` — Legal and safety rules that govern all sources
- `docs/STUDY_MATERIALS_CONTENT_SCHEMA.md` — Where source metadata is stored
- `docs/STUDY_MATERIALS_BRANCH_SEQUENCE.md` — When ingestion code is written (Phase 26b+)
