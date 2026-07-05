# Job Role ID Model

Phase 27A design — stable identifiers for manual job enrichment and quiz pack mapping.

## Design principles

1. **Stable IDs never change** after first publish — display names can change in UI copy.
2. **Role ID** = job family (what kind of work). **Role level ID** = family + experience band.
3. IDs are uppercase `SNAKE_CASE`, prefixed `ROLE_` / `ROLE_<FAMILY>_<LEVEL>`.
4. Import CSV must use exact ID strings; free-text role names go in `actual_role_name`.
5. `ROLE_OTHER_REVIEW` is the fallback when classification is uncertain; always set `manual_review_needed=yes`.

## Role IDs (job family)

| Role ID | Display name | Typical scrape title signals |
|---------|--------------|------------------------------|
| `ROLE_JAVA_BACKEND` | Java Backend Developer | Java, Spring Boot, backend, REST API |
| `ROLE_PYTHON_DEV` | Python Developer | Python, Django, Flask, FastAPI |
| `ROLE_DATA_ANALYST` | Data Analyst | SQL, Excel, dashboards, reporting, BI |
| `ROLE_POWERBI_ANALYST` | Power BI Analyst | Power BI, DAX, data modeling |
| `ROLE_FRONTEND_REACT` | Frontend React Developer | React, JavaScript, UI, CSS |
| `ROLE_FULLSTACK_WEB` | Full Stack Web Developer | MERN, full stack, frontend + backend |
| `ROLE_QA_TESTING` | QA / Testing Engineer | manual testing, automation, Selenium |
| `ROLE_DATA_ENGINEER` | Data Engineer | ETL, pipelines, Spark, Airflow |
| `ROLE_ML_AI` | ML / AI Engineer | machine learning, NLP, TensorFlow, PyTorch |
| `ROLE_IT_SUPPORT` | IT Support / Helpdesk | L1, L2, desktop support, ticketing |
| `ROLE_SERVICENOW` | ServiceNow Developer / Admin | ServiceNow, ITSM, CMDB |
| `ROLE_BUSINESS_ANALYST` | Business Analyst | requirements, BRD, stakeholder, UAT |
| `ROLE_OTHER_REVIEW` | Other (needs review) | Ambiguous or cross-role postings |

## Experience level bands

Used in `role_level_id` suffix and `experience_level` column:

| Suffix | `experience_level` value | Meaning |
|--------|--------------------------|---------|
| `FRESHER` | fresher | 0–1 year, intern, trainee, graduate |
| `ENTRY` | entry | 1–2 years, junior |
| `EXPERIENCED` | experienced | 2+ years, mid/senior (manual import only for experienced_manual profile jobs) |

## Role level IDs

Pattern: `ROLE_<FAMILY>_<LEVEL>`

### Java Backend

| Role level ID | Display |
|---------------|---------|
| `ROLE_JAVA_BACKEND_FRESHER` | Java Backend — Fresher |
| `ROLE_JAVA_BACKEND_ENTRY` | Java Backend — Entry (1–2 yr) |
| `ROLE_JAVA_BACKEND_EXPERIENCED` | Java Backend — Experienced |

### Python Developer

| Role level ID | Display |
|---------------|---------|
| `ROLE_PYTHON_DEV_FRESHER` | Python Developer — Fresher |
| `ROLE_PYTHON_DEV_ENTRY` | Python Developer — Entry |
| `ROLE_PYTHON_DEV_EXPERIENCED` | Python Developer — Experienced |

### Data Analyst

| Role level ID | Display |
|---------------|---------|
| `ROLE_DATA_ANALYST_FRESHER` | Data Analyst — Fresher |
| `ROLE_DATA_ANALYST_ENTRY` | Data Analyst — Entry |
| `ROLE_DATA_ANALYST_EXPERIENCED` | Data Analyst — Experienced |

### Power BI Analyst

| Role level ID | Display |
|---------------|---------|
| `ROLE_POWERBI_ANALYST_FRESHER` | Power BI Analyst — Fresher |
| `ROLE_POWERBI_ANALYST_ENTRY` | Power BI Analyst — Entry |
| `ROLE_POWERBI_ANALYST_EXPERIENCED` | Power BI Analyst — Experienced |

### Frontend React

| Role level ID | Display |
|---------------|---------|
| `ROLE_FRONTEND_REACT_FRESHER` | Frontend React — Fresher |
| `ROLE_FRONTEND_REACT_ENTRY` | Frontend React — Entry |
| `ROLE_FRONTEND_REACT_EXPERIENCED` | Frontend React — Experienced |

### Full Stack Web

| Role level ID | Display |
|---------------|---------|
| `ROLE_FULLSTACK_WEB_FRESHER` | Full Stack Web — Fresher |
| `ROLE_FULLSTACK_WEB_ENTRY` | Full Stack Web — Entry |
| `ROLE_FULLSTACK_WEB_EXPERIENCED` | Full Stack Web — Experienced |

### QA / Testing

| Role level ID | Display |
|---------------|---------|
| `ROLE_QA_TESTING_FRESHER` | QA Testing — Fresher |
| `ROLE_QA_TESTING_ENTRY` | QA Testing — Entry |
| `ROLE_QA_TESTING_EXPERIENCED` | QA Testing — Experienced |

### Data Engineer

| Role level ID | Display |
|---------------|---------|
| `ROLE_DATA_ENGINEER_FRESHER` | Data Engineer — Fresher |
| `ROLE_DATA_ENGINEER_ENTRY` | Data Engineer — Entry |
| `ROLE_DATA_ENGINEER_EXPERIENCED` | Data Engineer — Experienced |

### ML / AI

| Role level ID | Display |
|---------------|---------|
| `ROLE_ML_AI_FRESHER` | ML / AI — Fresher |
| `ROLE_ML_AI_ENTRY` | ML / AI — Entry |
| `ROLE_ML_AI_EXPERIENCED` | ML / AI — Experienced |

### IT Support

| Role level ID | Display |
|---------------|---------|
| `ROLE_IT_SUPPORT_FRESHER` | IT Support — Fresher |
| `ROLE_IT_SUPPORT_ENTRY` | IT Support — Entry |
| `ROLE_IT_SUPPORT_EXPERIENCED` | IT Support — Experienced |

### ServiceNow

| Role level ID | Display |
|---------------|---------|
| `ROLE_SERVICENOW_FRESHER` | ServiceNow — Fresher |
| `ROLE_SERVICENOW_ENTRY` | ServiceNow — Entry |
| `ROLE_SERVICENOW_EXPERIENCED` | ServiceNow — Experienced |

### Business Analyst

| Role level ID | Display |
|---------------|---------|
| `ROLE_BUSINESS_ANALYST_FRESHER` | Business Analyst — Fresher |
| `ROLE_BUSINESS_ANALYST_ENTRY` | Business Analyst — Entry |
| `ROLE_BUSINESS_ANALYST_EXPERIENCED` | Business Analyst — Experienced |

### Other (review)

| Role level ID | Display |
|---------------|---------|
| `ROLE_OTHER_REVIEW_FRESHER` | Other — Fresher (review) |
| `ROLE_OTHER_REVIEW_ENTRY` | Other — Entry (review) |
| `ROLE_OTHER_REVIEW_EXPERIENCED` | Other — Experienced (review) |

## Validation rules (import)

- `actual_role_id` must be one of the role IDs above.
- `role_level_id` must match pattern `ROLE_<FAMILY>_<LEVEL>` and family must align with `actual_role_id` (e.g. `ROLE_JAVA_BACKEND` + `ROLE_JAVA_BACKEND_FRESHER`).
- `experience_level` must match the level suffix on `role_level_id`.
- If `actual_role_id` is `ROLE_OTHER_REVIEW`, `manual_review_needed` must be `yes`.

## Quiz pack naming convention

Quiz packs reference role level IDs:

```
QP_<FAMILY>_<LEVEL>_W<NN>
```

Example: `QP_JAVA_BACKEND_FRESHER_W01` — week 1 pack for Java Backend fresher roles.

See `QUIZ_PACK_IMPORT_SCHEMA.md` for quiz CSV columns.
