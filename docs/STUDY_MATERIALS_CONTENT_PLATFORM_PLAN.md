# Study Materials Content Platform Plan

**Branch:** `phase-26a-study-materials-content-platform-plan`
**Phase:** 26a — Planning and Documentation Only
**Status:** Draft
**Date:** 2026-06-29

---

## Overview

Study Materials is currently marked **SOON** in the Code Quest sidebar. This document defines the full product plan to turn it into a student-facing content hub integrated with the existing Code Quest platform.

The platform will let students discover, read, save, and track progress across curated articles, books, ebooks, research papers, and notes — all tagged by domain and topic. Content will pass through an admin review workflow before becoming visible to students.

---

## 1. Product Goals

| Goal | Description |
|---|---|
| Student discovery | Browse and search all content types by domain, tag, and difficulty |
| Curated quality | Every item passes admin review before publish |
| Reading progress | Students resume where they left off and see completion percentages |
| Saved/bookmarks | Students build a personal reading list |
| Learning paths | Curated ordered sequences of content items |
| Domain filtering | Filter by Maths, DSA, Python, AI/ML, etc. |
| Safe content | No copyrighted full text stored without clear license |

---

## 2. Student-Facing Hub

### 2.1 Study Materials Home

- Domain filter bar at top (Maths, Python, DSA, AI/ML, Cloud, etc.)
- Featured collection carousel
- Recent items feed
- Continue reading section (resumes in-progress items)
- Saved/bookmarked items shortcut

### 2.2 Content Detail Page

- Title, author, source, published date
- Short summary (always available)
- Tags and domain badges
- Full content (only for public-domain / open-license items)
- External link (for articles, papers, commercial ebooks)
- Reading progress bar
- Save/bookmark toggle
- Related items suggestions

### 2.3 Collections / Learning Paths

- Ordered list of content items
- Progress indicator (N of M complete)
- Curated by admin or future instructor role
- Tagged by domain and level (Beginner / Intermediate / Advanced)

### 2.4 Search

- Full-text search on title, summary, tags, domains
- Filter by content type, domain, tag, difficulty
- Sort by relevance, date, reading time

---

## 3. Admin Review / Publish Flow

### 3.1 Ingestion Queue

- Automated ingestion jobs populate `content_ingestion_runs` and `content_review_queue`
- Each ingested item arrives with status `pending_review`
- Admin sees a queue of items awaiting review

### 3.2 Admin Review Actions

| Action | Result |
|---|---|
| Approve | Status moves to `published`; visible to students |
| Reject | Status moves to `rejected`; reason recorded |
| Edit | Admin can correct title, summary, tags, domain, license |
| Flag | Marks item for legal or quality check |
| Archive | Removes from student view without deletion |

### 3.3 Review Criteria Checklist

- [ ] Title is accurate and not misleading
- [ ] Summary is meaningful (not auto-generated garbage)
- [ ] Source URL is reachable and trustworthy
- [ ] License is recorded and valid for intended usage
- [ ] No full copyrighted text stored without explicit license permission
- [ ] Tags and domain are correctly set
- [ ] Content is appropriate for students

---

## 4. Domain / Category / Tag Filtering

### Primary Domains

| Domain | Slug |
|---|---|
| Mathematics | `maths` |
| Data Science | `data-science` |
| Engineering | `engineering` |
| Frontend | `frontend` |
| Backend | `backend` |
| Python | `python` |
| SQL | `sql` |
| Power BI | `power-bi` |
| Aptitude | `aptitude` |
| Data Structures & Algorithms | `dsa` |
| AI / Machine Learning | `ai-ml` |
| Cloud | `cloud` |
| Career | `career` |
| Resume | `resume` |
| Interview Prep | `interview-prep` |

### Content Type Categories

- `article` — News, blog, tutorials
- `book` — Public-domain or open-license books
- `ebook` — Public-domain or open-license ebooks
- `text-file` — Plain text from public-domain sources
- `research-paper` — arXiv, OpenAlex, or other academic sources
- `notes` — Admin-created or instructor-created notes
- `external-link` — Curated external resources with summary only

### Tags

Free-form tags associated with any content item. Examples: `numpy`, `neural-networks`, `system-design`, `sql-joins`, `resume-tips`.

---

## 5. Reading Progress

- Track `last_read_at`, `progress_percent`, `current_page` or `scroll_position` per student per item
- Resume reading from last position on supported content types (books, text files, notes)
- Show completion badge when `progress_percent >= 95`
- Aggregate progress shown on student dashboard

---

## 6. Saved / Bookmarked Materials

- Students can save any content item
- Saved items visible in sidebar shortcut and Study Materials home
- Remove saved items at any time
- Saved items are personal and not visible to other students

---

## 7. Content Types

### 7.1 Article

| Field | Notes |
|---|---|
| title | Required |
| summary | Short, 1–3 sentences, no full article body unless license allows |
| source_url | Original article URL |
| author | From feed or extraction metadata |
| published_date | From feed or extraction metadata |
| domain | One or more domains |
| tags | Free-form |
| license | Usually `no-full-text` for third-party articles |
| content_body | **Empty unless license explicitly allows full text** |

### 7.2 Public-Domain Book / Ebook / Text File

| Field | Notes |
|---|---|
| title | Required |
| author | Required |
| source_url | Gutenberg or Standard Ebooks URL |
| gutenberg_id | If sourced from Project Gutenberg |
| license | Must be `public-domain` or confirmed open license |
| content_body | Full text allowed |
| file_path | Stored file path in isolated content store |
| domain | One or more domains |
| tags | Free-form |

### 7.3 Research Paper

| Field | Notes |
|---|---|
| title | Required |
| authors | List |
| abstract | Short abstract only |
| source_url | Link to abstract page (arXiv, OpenAlex, etc.) |
| pdf_url | Link to PDF on original source — not stored locally unless open license |
| published_date | Required |
| arxiv_id | If arXiv source |
| openalex_id | If OpenAlex source |
| domain | One or more domains |
| tags | Free-form |
| license | Must be recorded |

### 7.4 Notes

| Field | Notes |
|---|---|
| title | Required |
| content_body | Full content — admin-created, no external license concern |
| domain | One or more |
| tags | Free-form |
| author | Admin/instructor who created it |

---

## 8. Content Collections / Learning Paths

- An ordered list of `content_items`
- Created and managed by admins
- Students follow the sequence at their own pace
- Progress tracked per collection

---

## 9. Future Isolated Lab

Phase 26b will create an isolated folder `codequest-content-lab/` at the repo root. This lab:

- Is not served by the main app
- Has its own `requirements.txt` and `README.md`
- Contains ingestion scripts and prototypes
- Uses Python dependencies (`feedparser`, `newspaper4k`, `trafilatura`, `arxiv`, `pyalex`, `internetarchive`)
- Does NOT connect to the production database
- Does NOT touch any file in `src/`, `backend/`, `codequest-frontend-kit/`
- Remains isolated until a future explicit cutover phase is approved

---

## 10. Out of Scope for Phase 26a

- No frontend pages
- No backend API changes
- No database migrations
- No dependency installs
- No ingestion scripts
- No connection to production DB
- No changes to Jobs, Progress Tracker, or Projects
- No redesign of existing UI

---

## 11. References

- `docs/STUDY_MATERIALS_CONTENT_SOURCES.md` — Approved source strategy and external repositories
- `docs/STUDY_MATERIALS_CONTENT_SCHEMA.md` — Database entity definitions
- `docs/STUDY_MATERIALS_CONTENT_SAFETY_RULES.md` — Legal and content safety rules
- `docs/STUDY_MATERIALS_BRANCH_SEQUENCE.md` — Full phase sequence
