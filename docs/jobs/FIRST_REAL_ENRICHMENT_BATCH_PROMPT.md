# First Real Enrichment Batch — ChatGPT Prompt

**Phase:** 27H — real enriched CSV prep  
**Batch file:** `local-data/job-enrichment-batch-001.working.csv` (local only, do not commit raw exports)

Use this prompt after exporting jobs from **Admin → JobSpy Ops → Export CSV**. Pick **10 real rows** with valid `Job ID`, clear title/company, and a working apply URL. Prefer `internship_india`, `fresher_india`, or `entry_level_india` profiles.

---

## Step 1 — Paste this system instruction

```
You are helping prepare a CodeQuest job enrichment import CSV.

Rules:
- Output ONLY valid CSV rows (no markdown fences).
- Use the exact header row below.
- Copy job_id exactly from the export. Never invent or change job_id.
- Use only role IDs and role level IDs from the allowed lists.
- experience_level must match role_level_id suffix: FRESHER→fresher, ENTRY→entry, EXPERIENCED→experienced.
- job_live_status: LIVE | EXPIRED | UNKNOWN
- jd_fetch_status: FETCHED | BLOCKED | PARTIAL | UNKNOWN
- manual_review_needed: yes | no
- mapping_confidence: decimal 0.00–1.00
- Multi-value fields use pipe | separator inside one cell.
- If you only have title/metadata (no full JD): set jd_fetch_status=UNKNOWN or PARTIAL, job_live_status=UNKNOWN, mapping_confidence below 0.70, manual_review_needed=yes.
- Do NOT guess a full JD summary if JD text was not provided.
- If role mapping is uncertain, use ROLE_OTHER_REVIEW and manual_review_needed=yes.
- Leave quiz_pack_id blank unless a valid pack ID is supplied.
- Keep jd_summary to 2–4 sentences max when JD text exists; otherwise one sentence noting title-only metadata.

Required CSV header (exact):
job_id,actual_role_id,actual_role_name,role_level_id,experience_level,job_live_status,jd_fetch_status,jd_summary,required_skills,good_to_have_skills,tools,programming_languages,databases,frameworks,student_preparation_topics,quiz_pack_id,mapping_confidence,manual_review_needed,notes

Allowed actual_role_id values:
ROLE_JAVA_BACKEND, ROLE_PYTHON_DEV, ROLE_DATA_ANALYST, ROLE_POWERBI_ANALYST, ROLE_FRONTEND_REACT, ROLE_FULLSTACK_WEB, ROLE_QA_TESTING, ROLE_DATA_ENGINEER, ROLE_ML_AI, ROLE_GEN_AI, ROLE_AGENTIC_AI, ROLE_IT_SUPPORT, ROLE_SERVICENOW, ROLE_BUSINESS_ANALYST, ROLE_CYBER_SECURITY, ROLE_SALESFORCE, ROLE_DYNAMICS_CRM, ROLE_POWER_PLATFORM, ROLE_OTHER_REVIEW

Allowed role_level_id pattern examples:
ROLE_JAVA_BACKEND_FRESHER, ROLE_PYTHON_DEV_ENTRY, ROLE_DATA_ANALYST_FRESHER, ROLE_FRONTEND_REACT_FRESHER, ROLE_FULLSTACK_WEB_ENTRY, etc.

Reference docs in repo:
- docs/jobs/JOB_ENRICHMENT_IMPORT_SCHEMA.md
- docs/jobs/JOB_ROLE_ID_MODEL.md
```

---

## Step 2 — Paste 10 export rows

Paste a table or CSV snippet from your export with at least these columns:

| Job ID | Title | Company | Profile | Apply Link | Job URL | Status |

Example user message:

```
Enrich these 10 exported jobs into import CSV rows.

[Paste 10 rows here from jobs export CSV]

For each row:
1. Map to the best actual_role_id and role_level_id.
2. If JD text is missing, use UNKNOWN statuses and manual_review_needed=yes.
3. Put audit rationale in notes.
4. Return header + 10 data rows only.
```

---

## Step 3 — Save and review locally

1. Save ChatGPT output to `local-data/job-enrichment-batch-001.working.csv` (overwrite or new version).
2. Open in a spreadsheet editor and verify:
   - Exactly 10 data rows
   - No duplicate `job_id`
   - All required columns present
3. Run local preview (see `FIRST_REAL_IMPORT_CHECKLIST.md`).

---

## Step 4 — Production safety

- **Preview in production** is allowed (read-only validation).
- **Do not click Commit Import** in production until explicit approval.
- **Never commit** `sample-data/job-enrichment-import.sample.csv` or sample `CQJ-SAMPLE-*` rows to production.

---

## Quality bar before commit

Each row should have:

- Confident role mapping (`mapping_confidence` ≥ 0.70) **or** `manual_review_needed=yes`
- `required_skills` filled from JD or defensible title signals
- `notes` explaining mapping decisions
- `job_id` matching a row still present in `scraped_jobs`
