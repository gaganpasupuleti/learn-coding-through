# Job Enrichment Import Schema

Phase 27A design — enriched CSV columns for manual import back into CodeQuest.

## File format

- **Encoding:** UTF-8
- **Delimiter:** comma (`,`)
- **Header row:** required, exact column names below (case-sensitive)
- **Multi-value fields:** pipe-separated (`|`) within a single cell — e.g. `java|spring-boot|rest-api`
- **Join key:** `job_id` must match existing `scraped_jobs.job_id` (format `CQJ-YYYYMMDD-NNNN`)

## Columns

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `job_id` | yes | string | Stable CodeQuest job ID from export. Never invent or change. |
| `actual_role_id` | yes | enum | Role family ID from `JOB_ROLE_ID_MODEL.md` |
| `actual_role_name` | yes | string | Human-readable role for student UI |
| `role_level_id` | yes | enum | Role + experience band ID |
| `experience_level` | yes | enum | `fresher` \| `entry` \| `experienced` |
| `job_live_status` | yes | enum | Whether posting is still live |
| `jd_fetch_status` | yes | enum | Whether JD text was successfully obtained |
| `jd_summary` | no | text | 2–4 sentence summary of job description (max 2000 chars) |
| `required_skills` | yes | pipe-list | Must-have skills for the role |
| `good_to_have_skills` | no | pipe-list | Nice-to-have skills |
| `tools` | no | pipe-list | Tools/platforms (Jira, Git, Postman, etc.) |
| `programming_languages` | no | pipe-list | Languages mentioned in JD |
| `databases` | no | pipe-list | DB technologies |
| `frameworks` | no | pipe-list | Frameworks/libraries |
| `student_preparation_topics` | no | pipe-list | Topics student should study before applying |
| `quiz_pack_id` | no | string | Linked quiz pack ID (see `QUIZ_PACK_IMPORT_SCHEMA.md`) |
| `mapping_confidence` | yes | decimal | 0.00–1.00 confidence in role mapping |
| `manual_review_needed` | yes | enum | `yes` \| `no` |
| `notes` | no | text | Admin/ChatGPT audit notes |

## Allowed status values

### `job_live_status`

| Value | Meaning |
|-------|---------|
| `LIVE` | Posting appears active; apply link likely works |
| `EXPIRED` | Posting closed or 404 on apply URL |
| `UNKNOWN` | Could not verify live status |

### `jd_fetch_status`

| Value | Meaning |
|-------|---------|
| `FETCHED` | Full or sufficient JD text obtained |
| `BLOCKED` | Site blocked scraping / login wall |
| `PARTIAL` | Title/snippet only, incomplete JD |
| `UNKNOWN` | JD not attempted or inconclusive |

### `manual_review_needed`

| Value | Meaning |
|-------|---------|
| `yes` | Hold for admin approval before student visibility |
| `no` | Auto-eligible for commit if other validation passes |

## Validation rules (preview step)

### Hard errors (row rejected)

- Missing or blank `job_id`
- `job_id` not found in `scraped_jobs`
- Unknown `actual_role_id` or `role_level_id`
- `role_level_id` family mismatch with `actual_role_id`
- `experience_level` mismatch with `role_level_id` suffix
- Invalid enum for `job_live_status`, `jd_fetch_status`, or `manual_review_needed`
- `mapping_confidence` outside 0.00–1.00
- `actual_role_id` = `ROLE_OTHER_REVIEW` but `manual_review_needed` = `no`

### Warnings (row importable with flag)

- `mapping_confidence` < 0.70
- `manual_review_needed` = `yes`
- `jd_fetch_status` = `PARTIAL` or `UNKNOWN`
- `job_live_status` = `EXPIRED` (still importable for history; hide from student "apply now")
- Empty `required_skills`
- `quiz_pack_id` set but pack not found in quiz import store

### Commit behavior

- Only rows passing hard validation can be committed.
- Warning rows require explicit admin checkbox "commit warnings" or per-row approval.
- Re-import same `job_id`: new enrichment version; previous version archived, not deleted.

## Example header row

```csv
job_id,actual_role_id,actual_role_name,role_level_id,experience_level,job_live_status,jd_fetch_status,jd_summary,required_skills,good_to_have_skills,tools,programming_languages,databases,frameworks,student_preparation_topics,quiz_pack_id,mapping_confidence,manual_review_needed,notes
```

## Sample data

See `sample-data/job-enrichment-import.sample.csv` for five fresher-role examples.

## Relationship to export CSV

Export CSV (from JobSpy admin) provides source columns. Enrichment CSV adds curated columns above. Join only on `job_id`.

| Export column | Enrichment usage |
|---------------|------------------|
| Job ID | → `job_id` (copy exactly) |
| Title | Inform `actual_role_name`; do not overwrite scrape row |
| Apply Link | Verify `job_live_status`; student apply uses scrape URL unless future override field added |
| Company, Location | Display only; not in enrichment CSV |

## Future DB mapping (not implemented in 27A)

Planned entity: `job_enrichments` (or equivalent) with columns mirroring this schema plus `version`, `import_run_id`, `approved_at`, `approved_by`.
