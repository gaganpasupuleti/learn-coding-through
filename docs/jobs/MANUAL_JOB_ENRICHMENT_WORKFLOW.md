# Manual Job Enrichment Import Workflow

Phase 27A design — docs only. No backend, frontend, or migration implementation in this phase.

## Purpose

JobSpy exports raw scraped jobs with stable `job_id` values (format `CQJ-YYYYMMDD-NNNN`). Students need **actual role**, **role ID**, **skills**, **quiz pack**, and a verified **apply link** — not just scraped title/company text.

This workflow lets admins enrich jobs **outside the app** (e.g. ChatGPT), then import validated rows back into CodeQuest without mutating raw scrape data.

## End-to-end flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│ Export CSV  │───▶│ Manual       │───▶│ Upload enriched │───▶│ Validation   │───▶│ Commit      │
│ (admin)     │    │ enrichment   │    │ CSV (admin)     │    │ preview      │    │ import      │
└─────────────┘    │ (ChatGPT)    │    └─────────────────┘    └──────────────┘    └─────────────┘
                   └──────────────┘                                                        │
                                                                                           ▼
                                                                                  ┌─────────────────┐
                                                                                  │ Student job     │
                                                                                  │ dashboard       │
                                                                                  │ (Phase 27E+)    │
                                                                                  └─────────────────┘
```

### Step 1 — Export jobs CSV

- Admin uses existing **Export CSV** on the Job Refresh Dashboard.
- Export includes: `#`, `Job ID`, `Title`, `Company`, `Location`, `Source`, `Apply Link`, `Job URL`, `Added (IST)`, etc.
- Export reads from `scraped_jobs`; it does **not** modify rows.
- Admin selects a batch (e.g. latest 500–5000 active jobs) for enrichment.

### Step 2 — Manual enrichment (ChatGPT)

- Admin copies export rows (or full CSV) into ChatGPT with a fixed prompt template (future Phase 27B doc).
- ChatGPT returns enriched fields per job: actual role, role ID, skills, quiz pack mapping, JD summary, live/expired status, etc.
- Admin pastes ChatGPT output into the **enriched import CSV** template (`JOB_ENRICHMENT_IMPORT_SCHEMA.md`).
- Human review: fix obvious mistakes, set `manual_review_needed=yes` for uncertain rows.

**Rules for manual enrichment:**

- Never change `job_id` — it is the join key to `scraped_jobs`.
- Use only allowed `actual_role_id` and `role_level_id` values from `JOB_ROLE_ID_MODEL.md`.
- Pipe-delimited lists for multi-value columns (skills, tools, frameworks).
- Keep `notes` for audit trail (e.g. "title says SDE but JD is QA").

### Step 3 — Upload enriched CSV

- Admin uploads CSV via future import UI (Phase 27C).
- Backend parses file, normalizes columns, rejects malformed rows early.
- Upload creates a **staging import run** — not live student data yet.

### Step 4 — Validation preview

- Backend validates each row against schema rules (`JOB_ENRICHMENT_IMPORT_SCHEMA.md`).
- Preview shows per row:
  - **Valid** — ready to commit
  - **Warning** — e.g. low `mapping_confidence`, `manual_review_needed=yes`
  - **Error** — missing `job_id`, unknown role ID, invalid status enum
- Preview joins `job_id` to existing `scraped_jobs` row; flags unknown or duplicate IDs.
- Admin can filter preview to errors/warnings only before commit.

### Step 5 — Commit import

- Admin approves and commits **selected valid rows** (or all valid rows).
- Commit writes to a separate **enriched jobs** store (future table: `job_enrichments` or similar).
- Each commit is versioned: re-import for same `job_id` creates a new enrichment version; latest approved version wins for student display.
- Commit log records: admin user, timestamp (UTC stored, IST displayed), row count, import run ID.

### Step 6 — Admin approval

- Rows with `manual_review_needed=yes` appear in an admin review queue (Phase 27D).
- Admin can approve, reject, or edit before student visibility.
- Rejected rows stay out of student dashboard; notes preserved for audit.

### Step 7 — Student display (later phase)

- Student job dashboard reads **enriched** data joined to `scraped_jobs` by `job_id`.
- Display fields: `actual_role_name`, skills chips, `quiz_pack_id` link, verified apply link.
- Fallback: if no enrichment exists, show raw scrape fields with "Role not classified" badge.
- Quiz packs from `QUIZ_PACK_IMPORT_SCHEMA.md` attach to jobs via `quiz_pack_id`.

## Why not modify `scraped_jobs` directly?

| Concern | Reason to keep scrape data separate |
|--------|-------------------------------------|
| **Audit trail** | Raw scrape is the source of truth from JobSpy; enrichment is a human/AI overlay. |
| **Re-scrape safety** | Auto refresh updates title/URL/status on `scraped_jobs`; overwriting with enrichment would lose originals. |
| **Rollback** | Bad import batch can be reverted without touching scrape history. |
| **Idempotent scrape** | Dedup keys (`source` + `job_url`) stay on raw table; enrichment joins on stable `job_id`. |
| **Multiple enrichments** | Same job can be re-enriched after JD review; version history lives in enrichment store. |
| **Separation of duties** | Scrape pipeline (cron, JobSpy) and manual enrichment pipeline have different owners and failure modes. |

**Rule:** `scraped_jobs` = immutable-ish ingest layer. Enrichment = curated layer joined by `job_id`.

## Phase boundaries

| Phase | Deliverable |
|-------|-------------|
| **27A** (this) | Workflow + schema + sample CSV design docs |
| **27B** | ChatGPT prompt template + enrichment guidelines |
| **27C** | Backend import API + staging validation |
| **27D** | Admin review UI + commit flow |
| **27E** | Student dashboard enriched job display + quiz pack links |

## Output proof (future implementation)

Each implementation phase must produce:

- Import run ID and row counts (valid / warning / error / committed)
- Sample enriched row joined to `scraped_jobs`
- Sample student card showing role + skills + quiz pack
- Re-import same `job_id` shows version increment, raw scrape unchanged

## Related docs

- `JOB_ROLE_ID_MODEL.md` — stable role and role-level IDs
- `JOB_ENRICHMENT_IMPORT_SCHEMA.md` — enriched CSV columns and validation rules
- `QUIZ_PACK_IMPORT_SCHEMA.md` — quiz pack CSV for role preparation
