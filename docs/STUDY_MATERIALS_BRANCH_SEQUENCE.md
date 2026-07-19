# Study Materials Branch Sequence

**Branch:** `phase-26a-study-materials-content-platform-plan`
**Phase:** 26a — Planning and Documentation Only
**Status:** Draft
**Date:** 2026-06-29

---

## Overview

This document defines the full branch sequence for the Study Materials content platform. Each phase is a separate branch. No phase starts until the previous phase's PR is reviewed and approved. No branch targets `main` directly.

---

## Branch Sequence

```
main
└── phase-26a-study-materials-content-platform-plan   ← current branch
└── phase-26b-study-materials-content-lab
└── phase-26c-content-ingestion-mvp
└── phase-26d-study-materials-admin-review
└── phase-26e-study-materials-student-ui
└── phase-26f-reading-progress-bookmarks
└── phase-26g-main-app-integration
```

---

## Phase 26a — Study Materials Content Platform Plan

**Branch:** `phase-26a-study-materials-content-platform-plan`
**Type:** Planning and documentation only
**Target:** `main` (docs-only; no code change)

### Deliverables

- `docs/STUDY_MATERIALS_CONTENT_PLATFORM_PLAN.md`
- `docs/STUDY_MATERIALS_CONTENT_SOURCES.md`
- `docs/STUDY_MATERIALS_CONTENT_SCHEMA.md`
- `docs/STUDY_MATERIALS_CONTENT_SAFETY_RULES.md`
- `docs/STUDY_MATERIALS_BRANCH_SEQUENCE.md`

### Must-not-touch

- `src/`
- `backend/`
- `codequest-frontend-kit/`
- `developer-roadmap/`
- Any database
- Any existing routes, APIs, or frontend pages

### Acceptance criteria

- [ ] All 5 docs created and committed
- [ ] No app code changed
- [ ] No dependencies installed
- [ ] No migrations written

---

## Phase 26b — Study Materials Content Lab

**Branch:** `phase-26b-study-materials-content-lab`
**Type:** Isolated lab folder creation
**Parent:** branched from approved `phase-26a` merge

### Goal

Create `codequest-content-lab/` at the repo root. This folder is completely isolated from the main app.

### Deliverables

```
codequest-content-lab/
  README.md
  requirements.txt        # feedparser, newspaper4k, trafilatura, arxiv, pyalex, internetarchive
  .gitignore              # exclude downloaded content files, virtual env, secrets
  scripts/
    fetch_rss_sample.py   # prototype: fetch one RSS feed and print metadata
    fetch_arxiv_sample.py # prototype: search arXiv and print paper metadata
    fetch_gutenberg_sample.py  # prototype: query Gutendex API and print book metadata
  output/
    .gitkeep
```

### Must-not-touch

- `src/`
- `backend/`
- `codequest-frontend-kit/`
- Main app database
- Any production environment

### Acceptance criteria

- [ ] `codequest-content-lab/` created with README, requirements.txt, and sample scripts
- [ ] `pip install -r requirements.txt` succeeds in a virtual environment
- [ ] Each sample script runs and prints output without errors
- [ ] No connection to production database
- [ ] No files added outside `codequest-content-lab/`

### Output proof required

```
fetch_rss_sample.py output:
  source: <feed name>
  item count fetched: <N>
  sample item:
    title: ...
    summary: ...
    url: ...
    published: ...

fetch_arxiv_sample.py output:
  query: "machine learning"
  results fetched: <N>
  sample paper:
    title: ...
    authors: [...]
    arxiv_id: ...
    abstract: ...
    pdf_url: ...

fetch_gutenberg_sample.py output:
  query: "mathematics"
  results fetched: <N>
  sample book:
    title: ...
    author: ...
    gutenberg_id: ...
    license: public domain
    txt_download_url: ...
```

---

## Phase 26c — Content Ingestion MVP

**Branch:** `phase-26c-content-ingestion-mvp`
**Type:** Backend ingestion scripts + database migrations
**Parent:** branched from approved `phase-26b` merge

### Goal

Write real ingestion scripts that populate the database entities defined in `STUDY_MATERIALS_CONTENT_SCHEMA.md`. Scripts run in `codequest-content-lab/` but write to the dev database.

### Deliverables

- Database migration: all 12 entities from the schema (dev environment only)
- `codequest-content-lab/scripts/ingest_rss.py` — ingests RSS feeds into `content_items`
- `codequest-content-lab/scripts/ingest_arxiv.py` — ingests arXiv papers into `content_items`
- `codequest-content-lab/scripts/ingest_gutenberg.py` — ingests Gutenberg books and downloads `.txt` files to `content_files`
- `codequest-content-lab/scripts/seed_domains.py` — seeds `content_domains` with the 15 standard domains
- Ingestion run logging to `content_ingestion_runs`
- All items land in `content_review_queue` with `status = 'pending_review'`

### Must-not-touch

- Production database
- `src/`, `backend/`, `codequest-frontend-kit/`
- Existing routes, APIs, frontend pages
- Jobs, Progress Tracker, Projects

### Acceptance criteria

- [ ] Migrations run cleanly on dev database
- [ ] RSS ingestion run completes and logs output counts
- [ ] arXiv ingestion run completes and logs output counts
- [ ] Gutenberg ingestion run completes, downloads at least one `.txt` file, and logs output counts
- [ ] `seed_domains.py` seeds all 15 domains
- [ ] All ingested items land in `content_review_queue` with `pending_review` status
- [ ] No items with `license_type = 'unknown'` have `content_body` populated
- [ ] No items with `license_type = 'no-full-text'` have `content_body` populated

### Output proof required

```
ingest_rss.py run log:
  source_count: <N>
  imported_count: <N>
  skipped_duplicate_count: <N>
  rejected_unsafe_count: <N>
  downloaded_file_count: 0  (articles never download files)

  sample article item:
    id: ...
    title: ...
    summary: ...
    source_url: ...
    author: ...
    published_date: ...
    domain: ...
    tags: [...]
    license_type: no-full-text
    content_body: null
    status: pending_review

ingest_gutenberg.py run log:
  source_count: <N>
  imported_count: <N>
  skipped_duplicate_count: <N>
  rejected_unsafe_count: <N>
  downloaded_file_count: <N>

  sample book item:
    id: ...
    title: ...
    author: ...
    gutenberg_id: ...
    license_type: public-domain
    content_body: <first 200 chars of text>...
    file_id: <uuid>
    status: pending_review

  sample domain filter result (domain=maths):
    matching items: <N>
    sample titles: [...]
```

---

## Phase 26d — Study Materials Admin Review

**Branch:** `phase-26d-study-materials-admin-review`
**Type:** Backend API + admin UI
**Parent:** branched from approved `phase-26c` merge

### Goal

Build the admin-facing review queue UI and API endpoints. Admins can view, filter, approve, reject, edit, flag, or archive queued content items.

### Deliverables

- `backend/` routes for content review queue (GET list, GET item, PATCH status)
- Admin UI page: content review queue
- Admin UI page: content item detail with checklist
- Approve / Reject / Flag / Archive actions
- Audit trail stored in `content_review_queue.review_notes` and `reviewed_by`

### Must-not-touch

- Student-facing routes (not live yet)
- Jobs, Progress Tracker, Projects
- Ingestion scripts (already in 26c)

### Acceptance criteria

- [ ] Admin can see all `pending_review` items
- [ ] Admin can approve an item → `status = 'published'`
- [ ] Admin can reject an item → `status = 'rejected'` with reason
- [ ] Admin can flag an item → `status = 'flagged'`
- [ ] Approved item appears in API results for `status = 'published'`
- [ ] Rejected item does not appear in student-facing results

### Output proof required

```
Admin review publish result:
  item_id: <uuid>
  review_action: approve
  reviewed_by: <admin user id>
  reviewed_at: <timestamp>
  new status: published
```

---

## Phase 26e — Study Materials Student UI

**Branch:** `phase-26e-study-materials-student-ui`
**Type:** Frontend — student-facing Study Materials hub
**Parent:** branched from approved `phase-26d` merge

### Goal

Replace the "SOON" sidebar link with a real Study Materials hub page visible to students. Shows published content items only.

### Deliverables

- Study Materials home page with domain filter bar
- Content item detail page
- Collections/learning path page
- Search page
- API endpoints for student browse, filter, search (published items only)

### Must-not-touch

- Admin review UI (already in 26d)
- Jobs, Progress Tracker, Projects
- Ingestion scripts

### Acceptance criteria

- [ ] Sidebar link navigates to Study Materials hub
- [ ] Student sees published items only
- [ ] Domain filter narrows results correctly
- [ ] Content type filter works
- [ ] Content detail page shows title, summary, source link, tags, domain
- [ ] Full text / file shown only for public-domain items
- [ ] Search returns relevant results

---

## Phase 26f — Reading Progress and Bookmarks

**Branch:** `phase-26f-reading-progress-bookmarks`
**Type:** Frontend + Backend — student reading progress and saved items
**Parent:** branched from approved `phase-26e` merge

### Goal

Add reading progress tracking and save/bookmark functionality for students.

### Deliverables

- `student_reading_progress` API endpoints (GET, PATCH)
- `student_saved_content` API endpoints (GET, POST, DELETE)
- Reading progress bar on content detail page
- Resume reading indicator on Study Materials home
- Saved items section
- Progress aggregation on student dashboard (if dashboard exists)

### Acceptance criteria

- [ ] Reading progress updates when student scrolls or advances
- [ ] Progress persists across sessions
- [ ] Completion badge appears when `progress_percent >= 95`
- [ ] Student can save and unsave items
- [ ] Saved items appear in saved section

### Output proof required

```
Sample student reading progress update:
  user_id: <id>
  content_item_id: <uuid>
  progress_percent: 47.50
  current_position: "chapter-3"
  last_read_at: <timestamp>
```

---

## Phase 26g — Main App Integration

**Branch:** `phase-26g-main-app-integration`
**Type:** Integration and cleanup
**Parent:** branched from approved `phase-26f` merge

### Goal

Final integration of the Study Materials platform into the main app. Clean up any prototype or dev-only code. Confirm all safety rules are enforced in production paths.

### Deliverables

- Remove any dev-only or mock data
- Confirm all ingestion scripts use production-safe database connections
- Confirm admin review flow is required before any item is student-visible
- Confirm safety rules from `STUDY_MATERIALS_CONTENT_SAFETY_RULES.md` are enforced end-to-end
- Update `docs/LAUNCH.md` with Study Materials launch notes
- Update `docs/FRONTEND_PAGE_REPLACEMENT_MAP.md` if applicable

### Acceptance criteria

- [ ] No student-visible content with `license_type = 'unknown'`
- [ ] No student-visible content with `content_body` populated for `no-full-text` items
- [ ] Admin review queue is the only path to `published` status
- [ ] All ingestion run counts are logged and reviewable
- [ ] Sidebar "Study Materials" link is no longer marked SOON

---

## Rules Across All Phases

- Each branch is cut from the approved merge of the previous phase
- No phase merges to `main` without PR review and approval
- No phase touches files outside its stated deliverables
- `codequest-content-lab/` stays isolated until Phase 26g approves production integration
- No production database connections until Phase 26c and only on dev database; production database only from Phase 26g
- Jobs, Progress Tracker, Projects, and protected engines are never touched

---

## References

- `docs/STUDY_MATERIALS_CONTENT_PLATFORM_PLAN.md` — Product plan
- `docs/STUDY_MATERIALS_CONTENT_SOURCES.md` — Source strategy
- `docs/STUDY_MATERIALS_CONTENT_SCHEMA.md` — Database entities
- `docs/STUDY_MATERIALS_CONTENT_SAFETY_RULES.md` — Legal and safety rules
