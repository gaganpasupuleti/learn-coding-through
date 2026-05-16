"""Realistic fixture job board — visible to students, labeled only in admin."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from app.models.models import JobPost, JobPostStatus, LearningBatch

logger = logging.getLogger(__name__)

# Stable keys stored in listing_metadata.fixture_key for idempotent upserts.
FIXTURE_JOB_TEMPLATES: list[dict[str, Any]] = [
    {
        "fixture_key": "junior-backend-hyd",
        "title": "Junior Backend Engineer",
        "company_name": "TechMahindra Digital",
        "location": "Hyderabad",
        "employment_type": "Full-time",
        "description": "Build REST APIs with Python/FastAPI, write unit tests, and collaborate with product on feature delivery.",
    },
    {
        "fixture_key": "frontend-react-chennai",
        "title": "Frontend Developer (React)",
        "company_name": "Freshworks",
        "location": "Chennai",
        "employment_type": "Full-time",
        "description": "Ship responsive UI components, integrate with backend APIs, and improve Core Web Vitals on customer-facing apps.",
    },
    {
        "fixture_key": "data-analyst-intern-blr",
        "title": "Data Analyst Intern",
        "company_name": "Flipkart",
        "location": "Bengaluru",
        "employment_type": "Internship",
        "description": "SQL reporting, dashboarding in Metabase/Looker, and ad-hoc analysis for operations teams.",
    },
    {
        "fixture_key": "devops-zoho",
        "title": "DevOps Engineer",
        "company_name": "Zoho",
        "location": "Chennai / Remote",
        "employment_type": "Full-time",
        "description": "CI/CD pipelines, container orchestration, and observability for SaaS product releases.",
    },
    {
        "fixture_key": "python-razorpay",
        "title": "Python Developer",
        "company_name": "Razorpay",
        "location": "Bengaluru",
        "employment_type": "Full-time",
        "description": "Payments platform services, async workers, and integration testing in a high-scale environment.",
    },
    {
        "fixture_key": "qa-automation-pune",
        "title": "QA Automation Engineer",
        "company_name": "Infosys",
        "location": "Pune",
        "employment_type": "Full-time",
        "description": "End-to-end test automation (Playwright/Selenium), API contract tests, and release sign-off.",
    },
    {
        "fixture_key": "mobile-intern-swiggy",
        "title": "Mobile Developer Intern",
        "company_name": "Swiggy",
        "location": "Bengaluru",
        "employment_type": "Internship",
        "description": "Assist on React Native features, fix bugs from crash reports, and pair with senior engineers on code review.",
    },
    {
        "fixture_key": "cloud-support-remote",
        "title": "Cloud Support Associate",
        "company_name": "AWS India",
        "location": "Remote (India)",
        "employment_type": "Full-time",
        "description": "Customer troubleshooting for cloud workloads, incident triage, and documentation of runbooks.",
    },
]

LEGACY_DEMO_TITLE_PREFIX = "[KPI demo seed]"


def _fixture_key_from_job(job: JobPost) -> str | None:
    meta = job.listing_metadata if isinstance(job.listing_metadata, dict) else None
    if meta and isinstance(meta.get("fixture_key"), str):
        return meta["fixture_key"]
    return None


def _next_sort_order(db: Session) -> int:
    from sqlalchemy import func

    current = db.query(func.max(JobPost.sort_order)).scalar()
    return int(current or 0) + 1


def seed_fixture_job_board(
    db: Session,
    *,
    created_by_user_id: int,
    eligible_batch_id: int | None = None,
) -> int:
    """
    Upsert open fixture jobs with realistic copy (no demo prefix in titles).
    Returns count of jobs touched (created or updated).
    """
    if eligible_batch_id is None:
        batch = db.query(LearningBatch).order_by(LearningBatch.id.asc()).first()
        eligible_batch_id = batch.id if batch else None

    touched = 0
    sort_base = _next_sort_order(db)

    for index, template in enumerate(FIXTURE_JOB_TEMPLATES):
        key = template["fixture_key"]
        existing: JobPost | None = None
        for job in db.query(JobPost).filter(JobPost.is_fixture.is_(True)).all():
            if _fixture_key_from_job(job) == key:
                existing = job
                break

        metadata = {"fixture_key": key, "source": "fixture_seed"}
        if existing:
            existing.title = template["title"]
            existing.company_name = template["company_name"]
            existing.location = template["location"]
            existing.employment_type = template["employment_type"]
            existing.description = template["description"]
            existing.status = JobPostStatus.OPEN
            existing.is_fixture = True
            existing.listing_metadata = metadata
            if eligible_batch_id is not None:
                existing.eligible_batch_id = eligible_batch_id
            if existing.sort_order == 0:
                existing.sort_order = sort_base + index
        else:
            db.add(
                JobPost(
                    title=template["title"],
                    company_name=template["company_name"],
                    location=template["location"],
                    employment_type=template["employment_type"],
                    description=template["description"],
                    status=JobPostStatus.OPEN,
                    is_fixture=True,
                    sort_order=sort_base + index,
                    eligible_batch_id=eligible_batch_id,
                    created_by_user_id=created_by_user_id,
                    listing_metadata=metadata,
                )
            )
        touched += 1

    _migrate_legacy_kpi_demo_jobs(db, eligible_batch_id=eligible_batch_id)
    db.flush()
    logger.info("Fixture job board: upserted %s listings", touched)
    return touched


def _migrate_legacy_kpi_demo_jobs(db: Session, *, eligible_batch_id: int | None) -> None:
    """Rename old KPI-prefixed listings and mark them as fixture."""
    legacy = db.query(JobPost).filter(JobPost.title.like(f"{LEGACY_DEMO_TITLE_PREFIX}%")).all()
    renames = {
        f"{LEGACY_DEMO_TITLE_PREFIX} Junior Backend Engineer": FIXTURE_JOB_TEMPLATES[0],
        f"{LEGACY_DEMO_TITLE_PREFIX} Frontend internship": FIXTURE_JOB_TEMPLATES[2],
    }
    for job in legacy:
        job.is_fixture = True
        template = renames.get(job.title)
        if template:
            job.title = template["title"]
            job.company_name = template["company_name"]
            job.location = template["location"]
            job.employment_type = template["employment_type"]
            job.description = template["description"]
            job.listing_metadata = {
                "fixture_key": template["fixture_key"],
                "source": "legacy_kpi_migrate",
            }
        if eligible_batch_id is not None and job.eligible_batch_id is None:
            job.eligible_batch_id = eligible_batch_id
