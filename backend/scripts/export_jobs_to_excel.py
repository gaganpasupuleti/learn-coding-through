#!/usr/bin/env python3
"""Export active scraped jobs from the Code Quest DB to a detailed Excel file."""

from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path

# Allow running from repo root or backend/
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from openpyxl.utils import get_column_letter
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import ScrapedJob
from app.services.job_profiles import SCRAPE_PROFILES

PROFILE_LABELS = {key: profile.label for key, profile in SCRAPE_PROFILES.items()}
PROFILE_TIERS = {key: profile.experience_tier for key, profile in SCRAPE_PROFILES.items()}

ROLE_FAMILIES: list[tuple[str, tuple[str, ...]]] = [
    ("Data Science & ML", ("data scientist", "machine learning", "ml engineer", "ai engineer", "deep learning", "nlp", "computer vision")),
    ("Data Analytics", ("data analyst", "business analyst", "bi analyst", "analytics analyst", "reporting analyst")),
    ("Data Engineering", ("data engineer", "etl developer", "data pipeline", "big data engineer")),
    ("Software Engineering", ("software engineer", "software developer", "developer", "programmer", "sde", "full stack", "fullstack", "frontend", "backend", "web developer", "application developer")),
    ("DevOps & Cloud", ("devops", "site reliability", "sre", "cloud engineer", "platform engineer", "infrastructure engineer")),
    ("QA & Testing", ("qa engineer", "quality assurance", "test engineer", "sdet", "automation tester")),
    ("Product & Management", ("product manager", "project manager", "scrum master", "program manager", "business development")),
    ("Design", ("ux designer", "ui designer", "product designer", "graphic designer")),
    ("Database & DBA", ("database administrator", "dba", "sql developer", "oracle developer")),
    ("Cybersecurity", ("security analyst", "cyber security", "information security", "soc analyst")),
]

SKILL_KEYWORDS: tuple[str, ...] = (
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Oracle", "Snowflake", "BigQuery",
    "React", "Angular", "Vue", "Node.js", "Django", "Flask", "FastAPI", "Spring Boot", ".NET",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "Git",
    "Power BI", "Tableau", "Excel", "Spark", "Hadoop", "Kafka", "Airflow", "dbt",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "NLP",
    "REST API", "GraphQL", "Microservices", "Linux", "Agile", "Scrum",
)

EXPERIENCE_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("Internship", ("intern", "internship", "summer intern", "graduate intern")),
    ("Fresher / Entry Level", ("fresher", "entry level", "entry-level", "graduate trainee", "trainee", "junior", "0-1 year", "0 to 1")),
    ("1+ years", ("1 year", "1+ year", "1-2 year", "1 to 2", "minimum 1 year")),
    ("2+ years", ("2 year", "2+ year", "2-3 year", "2 to 3")),
    ("3+ years", ("3 year", "3+ year", "3-5 year", "3 to 5")),
    ("5+ years / Senior", ("5 year", "5+ year", "senior", "lead", "principal", "architect", "staff engineer")),
]

INGEST_EXPERIENCE = {
    "internship_india": "Internship",
    "fresher_india": "Fresher / Entry Level",
    "entry_level_india": "Entry Level",
    "experienced_manual_india": "1+ years",
}


def _normalize_text(*parts: str | None) -> str:
    return " ".join(p.strip() for p in parts if p and p.strip()).lower()


def infer_role_family(title: str, description: str | None) -> str:
    haystack = _normalize_text(title, description)
    for family, keywords in ROLE_FAMILIES:
        if any(kw in haystack for kw in keywords):
            return family
    return "General / Other"


def infer_role(title: str) -> str:
    cleaned = " ".join(title.split()).strip()
    return cleaned or "Untitled role"


def infer_experience(title: str, description: str | None, ingest_profile: str | None) -> str:
    haystack = _normalize_text(title, description)
    for label, keywords in EXPERIENCE_RULES:
        if any(kw in haystack for kw in keywords):
            return label
    if ingest_profile and ingest_profile in INGEST_EXPERIENCE:
        return INGEST_EXPERIENCE[ingest_profile]
    return "Not specified"


def extract_skills(title: str, description: str | None, limit: int = 20) -> list[str]:
    haystack = _normalize_text(title, description)
    found: list[str] = []
    for skill in SKILL_KEYWORDS:
        pattern = re.escape(skill.lower())
        if re.search(rf"\b{pattern}\b", haystack) or skill.lower() in haystack:
            found.append(skill)
    return found[:limit]


def format_salary(min_val: float | None, max_val: float | None, currency: str | None) -> str:
    if min_val is None and max_val is None:
        return ""
    cur = f"{currency} " if currency else ""
    if min_val is not None and max_val is not None:
        return f"{cur}{min_val:g} - {max_val:g}"
    value = min_val if min_val is not None else max_val
    return f"{cur}{value:g}"


def fetch_active_jobs(db: Session) -> list[ScrapedJob]:
    return (
        db.query(ScrapedJob)
        .filter(ScrapedJob.link_status == "active")
        .order_by(ScrapedJob.created_at.desc())
        .all()
    )


def job_to_row(job: ScrapedJob, index: int) -> dict[str, object]:
    skills = extract_skills(job.title, job.description)
    profile_key = job.ingest_profile or ""
    return {
        "S.No": index,
        "Job ID": job.id,
        "Role": infer_role(job.title),
        "Role Family": infer_role_family(job.title, job.description),
        "Skills": ", ".join(skills),
        "Experience Level": infer_experience(job.title, job.description, job.ingest_profile),
        "Scrape Profile": PROFILE_LABELS.get(profile_key, profile_key or "Unknown"),
        "Experience Tier": PROFILE_TIERS.get(profile_key, ""),
        "Company": job.company or "",
        "Location": job.location or "",
        "Source": job.source or "",
        "Job Type": job.job_type or "",
        "Date Posted": job.date_posted.isoformat(sep=" ", timespec="seconds") if job.date_posted else "",
        "Salary Range": format_salary(
            float(job.salary_min) if job.salary_min is not None else None,
            float(job.salary_max) if job.salary_max is not None else None,
            job.currency,
        ),
        "Salary Min": float(job.salary_min) if job.salary_min is not None else "",
        "Salary Max": float(job.salary_max) if job.salary_max is not None else "",
        "Currency": job.currency or "",
        "Job Link": job.job_url,
        "Apply Link": job.apply_url or job.job_url,
        "Link Status": job.link_status or "active",
        "Ingested At": job.created_at.isoformat(sep=" ", timespec="seconds") if job.created_at else "",
        "Description": " ".join((job.description or "").split()),
    }


def export_to_excel(rows: list[dict[str, object]], output_path: Path) -> None:
    if not rows:
        raise SystemExit("No active jobs found in database.")

    headers = list(rows[0].keys())
    wb = Workbook()
    ws = wb.active
    ws.title = "Active Jobs"
    ws.freeze_panes = "A2"

    header_font = Font(bold=True)
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.alignment = Alignment(wrap_text=True, vertical="top")

    link_font = Font(color="0563C1", underline="single")
    link_columns = {"Job Link", "Apply Link"}

    for row_idx, row in enumerate(rows, start=2):
        for col_idx, header in enumerate(headers, start=1):
            value = row.get(header, "")
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if header in link_columns and value:
                cell.hyperlink = str(value)
                cell.font = link_font
            if header == "Description":
                cell.alignment = Alignment(wrap_text=True, vertical="top")

    for col_idx, header in enumerate(headers, start=1):
        letter = get_column_letter(col_idx)
        if header == "Description":
            ws.column_dimensions[letter].width = 60
        elif header in link_columns:
            ws.column_dimensions[letter].width = 42
        else:
            max_len = max(len(str(ws.cell(row=r, column=col_idx).value or "")) for r in range(1, ws.max_row + 1))
            ws.column_dimensions[letter].width = min(max(max_len + 2, 12), 36)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output_path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Export all active scraped jobs to Excel")
    parser.add_argument(
        "--output",
        default="exports/codequest_active_jobs_detailed.xlsx",
        help="Output .xlsx path",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        jobs = fetch_active_jobs(db)
        rows = [job_to_row(job, idx) for idx, job in enumerate(jobs, start=1)]
    finally:
        db.close()

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = (BACKEND_DIR.parent / output_path).resolve()

    export_to_excel(rows, output_path)
    print(f"Exported {len(rows)} active jobs to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
