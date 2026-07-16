"""Seed data for job_roles and job_role_levels (Phase 27B).

Used by Alembic migration and optional manual re-seed script.
"""

from __future__ import annotations

JOB_ROLES: list[dict[str, str | None]] = [
    {
        "role_id": "ROLE_JAVA_BACKEND",
        "role_name": "Java Backend Developer",
        "role_family": "java-backend",
        "description": "Backend services with Java and Spring ecosystem.",
    },
    {
        "role_id": "ROLE_PYTHON_DEV",
        "role_name": "Python Developer",
        "role_family": "python-dev",
        "description": "Application development with Python frameworks and APIs.",
    },
    {
        "role_id": "ROLE_DATA_ANALYST",
        "role_name": "Data Analyst",
        "role_family": "data-analyst",
        "description": "SQL, reporting, dashboards, and business analytics.",
    },
    {
        "role_id": "ROLE_POWERBI_ANALYST",
        "role_name": "Power BI Analyst",
        "role_family": "powerbi-analyst",
        "description": "Power BI modeling, DAX, and visualization.",
    },
    {
        "role_id": "ROLE_FRONTEND_REACT",
        "role_name": "Frontend React Developer",
        "role_family": "frontend-react",
        "description": "React UI development and frontend integration.",
    },
    {
        "role_id": "ROLE_FULLSTACK_WEB",
        "role_name": "Full Stack Web Developer",
        "role_family": "fullstack-web",
        "description": "End-to-end web application development.",
    },
    {
        "role_id": "ROLE_QA_TESTING",
        "role_name": "QA / Testing Engineer",
        "role_family": "qa-testing",
        "description": "Manual and automated software testing.",
    },
    {
        "role_id": "ROLE_DATA_ENGINEER",
        "role_name": "Data Engineer",
        "role_family": "data-engineer",
        "description": "Data pipelines, ETL, and platform engineering.",
    },
    {
        "role_id": "ROLE_ML_AI",
        "role_name": "ML / Data Science Engineer",
        "role_family": "ml-ai",
        "description": "Classic machine learning, model training, and data science engineering.",
    },
    {
        "role_id": "ROLE_GEN_AI",
        "role_name": "Generative AI / LLM Engineer",
        "role_family": "gen-ai",
        "description": "LLMs, RAG, prompt engineering, and generative AI application development.",
    },
    {
        "role_id": "ROLE_AGENTIC_AI",
        "role_name": "Agentic AI Engineer",
        "role_family": "agentic-ai",
        "description": "AI agents, multi-agent systems, and autonomous agent workflows.",
    },
    {
        "role_id": "ROLE_IT_SUPPORT",
        "role_name": "IT Support / Helpdesk",
        "role_family": "it-support",
        "description": "L1/L2 support, troubleshooting, and ticketing.",
    },
    {
        "role_id": "ROLE_SERVICENOW",
        "role_name": "ServiceNow Developer / Admin",
        "role_family": "servicenow",
        "description": "ServiceNow platform configuration and development.",
    },
    {
        "role_id": "ROLE_BUSINESS_ANALYST",
        "role_name": "Business Analyst",
        "role_family": "business-analyst",
        "description": "Requirements, process analysis, and stakeholder coordination.",
    },
    {
        "role_id": "ROLE_CYBER_SECURITY",
        "role_name": "Cyber Security Analyst",
        "role_family": "cyber-security",
        "description": "SOC, infosec, vulnerability assessment, and security operations.",
    },
    {
        "role_id": "ROLE_SALESFORCE",
        "role_name": "Salesforce Developer / Admin",
        "role_family": "salesforce-crm",
        "description": "Salesforce CRM development, Apex, Lightning, and administration.",
    },
    {
        "role_id": "ROLE_DYNAMICS_CRM",
        "role_name": "Microsoft Dynamics 365 CRM",
        "role_family": "dynamics-crm",
        "description": "Dynamics 365 CRM configuration, plugins, and customization.",
    },
    {
        "role_id": "ROLE_POWER_PLATFORM",
        "role_name": "Power Platform Developer",
        "role_family": "power-platform",
        "description": "Power Apps, Power Automate, and Microsoft low-code solutions.",
    },
    {
        "role_id": "ROLE_OTHER_REVIEW",
        "role_name": "Other (needs review)",
        "role_family": "other-review",
        "description": "Ambiguous or cross-role postings requiring manual review.",
    },
]

LEVEL_BANDS: list[dict[str, int | str | None]] = [
    {"suffix": "FRESHER", "experience_level": "fresher", "min_years": 0, "max_years": 1},
    {"suffix": "ENTRY", "experience_level": "entry", "min_years": 1, "max_years": 2},
    {"suffix": "EXPERIENCED", "experience_level": "experienced", "min_years": 2, "max_years": None},
]


def job_role_levels_seed() -> list[dict[str, int | str | None]]:
    """Build role level rows (N roles x 3 experience bands)."""
    rows: list[dict[str, int | str | None]] = []
    for role in JOB_ROLES:
        role_id = str(role["role_id"])
        for band in LEVEL_BANDS:
            rows.append(
                {
                    "role_level_id": f"{role_id}_{band['suffix']}",
                    "role_id": role_id,
                    "experience_level": band["experience_level"],
                    "min_years": band["min_years"],
                    "max_years": band["max_years"],
                }
            )
    return rows
