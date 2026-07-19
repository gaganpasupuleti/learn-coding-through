# Fresher Tech Role Family Catalog (India)

**Status:** Wave 1 + Wave 2.5 implemented; Waves 2–3 planned.  
**Use for:** JobSpy search terms, `job_roles` taxonomy, rules-v1 classifier, enrichment import.

## Design rules

1. **Specific before generic** in classifier order (Power Apps before Full Stack; Salesforce before Software Engineer).
2. **Stable IDs** — `ROLE_<FAMILY>` + levels `ROLE_<FAMILY>_FRESHER|ENTRY|EXPERIENCED`.
3. **Ambiguous titles** → `ROLE_OTHER_REVIEW` + `manual_review_needed=yes`.
4. **Non-tech interns** (marketing, accounting) stay in `ROLE_OTHER_REVIEW` until a dedicated bucket exists.

---

## Wave 1 — Implemented

| Role ID | Family | JobSpy terms (India fresher) | Classifier keywords |
|---------|--------|------------------------------|---------------------|
| `ROLE_CYBER_SECURITY` | Cyber security | cyber security fresher, soc analyst fresher, information security fresher | cyber security, cybersecurity, soc analyst, infosec, security analyst, cyber defense |
| `ROLE_SALESFORCE` | Salesforce CRM | salesforce fresher, sfdc fresher, salesforce developer fresher | salesforce, sfdc, apex, lightning developer, salesforce admin |
| `ROLE_DYNAMICS_CRM` | Dynamics 365 CRM | dynamics 365 fresher, microsoft dynamics fresher, crm developer fresher | dynamics 365, dynamics crm, d365, microsoft dynamics |
| `ROLE_POWER_PLATFORM` | Power Apps / Automate | power apps fresher, power automate fresher, power platform fresher | power apps, powerapps, power automate, power platform, canvas app |

**Also extended:** `ROLE_FRONTEND_REACT` keywords (next.js, typescript developer, frontend engineer).

**New scrape profile:** `platform_crm_india` (auto-enabled) — CRM, low-code, cyber fresher terms.

---

## Wave 2.5 — Implemented (AI split)

| Role ID | Family | JobSpy terms (India fresher) | Classifier keywords |
|---------|--------|------------------------------|---------------------|
| `ROLE_GEN_AI` | Generative AI / LLM | gen ai fresher, llm engineer fresher, prompt engineer fresher | gen ai, generative ai, llm, rag, prompt engineer, ai engineer |
| `ROLE_AGENTIC_AI` | Agentic AI | agentic ai fresher, ai agent developer fresher | agentic ai, ai agent, multi-agent, langgraph, crewai, autogen |
| `ROLE_ML_AI` | ML / Data Science (classic) | machine learning fresher, data science fresher | machine learning, ml engineer, data scientist, tensorflow, pytorch, nlp |

**New scrape profile:** `ai_india` (auto-enabled) — Gen AI, agentic, ML/data science fresher terms.

**Overlap:** Agentic before Gen AI before classic ML. Generic "AI Engineer" → `ROLE_GEN_AI` (review if ambiguous).

---

## Wave 1 — Already in taxonomy (keyword reference)

See `JOB_ROLE_ID_MODEL.md` for IDs. Key fresher search terms:

| Role ID | JobSpy terms |
|---------|--------------|
| `ROLE_JAVA_BACKEND` | java developer fresher, spring boot fresher |
| `ROLE_PYTHON_DEV` | python developer fresher, django fresher |
| `ROLE_DATA_ANALYST` | data analyst fresher, data analyst intern |
| `ROLE_POWERBI_ANALYST` | power bi fresher, bi developer fresher |
| `ROLE_FRONTEND_REACT` | react developer fresher, frontend developer fresher |
| `ROLE_FULLSTACK_WEB` | full stack developer fresher, mern fresher |
| `ROLE_QA_TESTING` | qa fresher, software tester fresher |
| `ROLE_DATA_ENGINEER` | data engineer fresher, etl fresher |
| `ROLE_ML_AI` | machine learning fresher, data science fresher |
| `ROLE_GEN_AI` | gen ai fresher, llm engineer fresher |
| `ROLE_AGENTIC_AI` | agentic ai fresher, ai agent developer fresher |
| `ROLE_IT_SUPPORT` | it support fresher, helpdesk fresher |
| `ROLE_SERVICENOW` | servicenow fresher |
| `ROLE_BUSINESS_ANALYST` | business analyst fresher, ba fresher |

---

## Wave 2 — Planned

| Role ID | Family |
|---------|--------|
| `ROLE_DOTNET` | .NET / C# |
| `ROLE_NODE_BACKEND` | Node.js backend |
| `ROLE_ANGULAR_FRONTEND` | Angular |
| `ROLE_ANDROID_DEV` | Android |
| `ROLE_DEVOPS_CLOUD` | DevOps / cloud junior |

---

## Wave 3 — Planned

| Role ID | Family |
|---------|--------|
| `ROLE_SQL_DBA` | SQL / DBA |
| `ROLE_RPA` | RPA (UiPath, etc.) |
| `ROLE_SAP` | SAP |
| `ROLE_UI_UX` | UI/UX design |

---

## Overlap resolution

| Signal | Prefer | Not |
|--------|--------|-----|
| power bi / dax | `ROLE_POWERBI_ANALYST` | Data Analyst |
| power apps / power automate | `ROLE_POWER_PLATFORM` | Power BI, Full Stack |
| salesforce / apex / sfdc | `ROLE_SALESFORCE` | Full Stack |
| dynamics 365 / d365 | `ROLE_DYNAMICS_CRM` | Power Platform |
| react / next.js | `ROLE_FRONTEND_REACT` | Full Stack (unless full stack also) |
| soc / cyber / infosec | `ROLE_CYBER_SECURITY` | IT Support |
| agentic / ai agent / langgraph | `ROLE_AGENTIC_AI` | Gen AI, ML |
| gen ai / llm / rag / prompt engineer | `ROLE_GEN_AI` | Agentic AI, ML |
| tensorflow / pytorch / data scientist | `ROLE_ML_AI` | Gen AI |
| servicenow | `ROLE_SERVICENOW` | IT Support |
| generic software engineer | `ROLE_FULLSTACK_WEB` (low confidence) | — |

---

## Implementation checklist (per wave)

Wave 1 (2026-07-12):

- [x] `backend/app/data/job_role_seed.py`
- [x] Alembic migration `20260712_22_wave1_fresher_role_families.py`
- [x] `docs/jobs/JOB_ROLE_ID_MODEL.md`
- [x] `backend/app/services/job_profiles.py` (search terms + `platform_crm_india`)
- [x] `backend/app/schemas/scraped_jobs.py` (`VALID_PROFILES`)
- [x] `scripts/run_job_skill_enrichment.py` (title rules + skill lexicon)
- [x] `docs/jobs/FIRST_REAL_ENRICHMENT_BATCH_PROMPT.md` (allowed role list)

Wave 2.5 (2026-07-12):

- [x] Split `ROLE_ML_AI` classic ML vs `ROLE_GEN_AI` vs `ROLE_AGENTIC_AI`
- [x] Migration `20260712_23_wave25_gen_agentic_ai.py`
- [x] Scrape profile `ai_india`
- [x] Classifier + skill lexicon updates

Waves 2–3: repeat checklist when implemented.
