"""Persistence helpers for scraped jobs and scrape run tracking."""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.models import JobScrapeRun, ScrapedJob


def scraped_job_to_dict(row: ScrapedJob) -> dict[str, Any]:
    return {
        "id": row.id,
        "source": row.source,
        "title": row.title,
        "company": row.company,
        "location": row.location,
        "jobType": row.job_type,
        "datePosted": row.date_posted,
        "salaryMin": float(row.salary_min) if row.salary_min is not None else None,
        "salaryMax": float(row.salary_max) if row.salary_max is not None else None,
        "currency": row.currency,
        "description": row.description,
        "jobUrl": row.job_url,
        "applyUrl": row.apply_url or row.job_url,
        "createdAt": row.created_at,
        "linkStatus": getattr(row, "link_status", None) or "active",
        "ingestProfile": getattr(row, "ingest_profile", None),
    }


def save_scraped_jobs(
    db: Session,
    jobs: list[dict[str, Any]],
    *,
    profile_key: str | None = None,
) -> tuple[int, int]:
    """Insert new jobs, skip duplicates. Returns (saved_count, skipped_duplicates)."""
    saved = 0
    skipped = 0
    for job in jobs:
        existing = db.query(ScrapedJob).filter(ScrapedJob.id == job["id"]).first()
        if existing:
            skipped += 1
            continue
        row = ScrapedJob(
            id=job["id"],
            source=job["source"],
            title=job["title"],
            company=job.get("company"),
            location=job.get("location"),
            job_type=job.get("jobType"),
            date_posted=job.get("datePosted"),
            salary_min=job.get("salaryMin"),
            salary_max=job.get("salaryMax"),
            currency=job.get("currency"),
            description=job.get("description"),
            job_url=job["jobUrl"],
            apply_url=job.get("applyUrl"),
            created_at=job.get("createdAt") or datetime.utcnow(),
            link_status="active",
            ingest_profile=job.get("ingestProfile") or profile_key,
        )
        db.add(row)
        saved += 1
    if saved:
        db.commit()
    return saved, skipped


def count_total_jobs(db: Session) -> int:
    return db.query(func.count(ScrapedJob.id)).scalar() or 0


def count_active_jobs(db: Session) -> int:
    return (
        db.query(func.count(ScrapedJob.id))
        .filter(ScrapedJob.link_status == "active")
        .scalar()
        or 0
    )


def count_jobs_by_link_status(db: Session, status: str) -> int:
    return (
        db.query(func.count(ScrapedJob.id))
        .filter(ScrapedJob.link_status == status)
        .scalar()
        or 0
    )


def count_jobs_since(db: Session, since: datetime) -> int:
    return (
        db.query(func.count(ScrapedJob.id))
        .filter(ScrapedJob.created_at >= since)
        .scalar()
        or 0
    )


def get_latest_loaded_at(db: Session) -> datetime | None:
    return db.query(func.max(ScrapedJob.created_at)).scalar()


def get_source_breakdown(db: Session, *, active_only: bool = False) -> list[dict[str, Any]]:
    query = db.query(ScrapedJob.source, func.count(ScrapedJob.id))
    if active_only:
        query = query.filter(ScrapedJob.link_status == "active")
    rows = query.group_by(ScrapedJob.source).order_by(func.count(ScrapedJob.id).desc()).all()
    return [{"source": source, "count": count} for source, count in rows]


def get_location_breakdown(db: Session, limit: int = 10) -> list[dict[str, Any]]:
    rows = (
        db.query(ScrapedJob.location, func.count(ScrapedJob.id))
        .filter(ScrapedJob.location.isnot(None), ScrapedJob.location != "")
        .group_by(ScrapedJob.location)
        .order_by(func.count(ScrapedJob.id).desc())
        .limit(limit)
        .all()
    )
    return [{"location": location, "count": count} for location, count in rows]


def get_recent_scrape_runs(db: Session, days: int = 7, limit: int = 10) -> list[JobScrapeRun]:
    since = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(JobScrapeRun)
        .filter(JobScrapeRun.started_at >= since)
        .order_by(JobScrapeRun.started_at.desc())
        .limit(limit)
        .all()
    )


def get_last_run_by_type(db: Session, run_type: str) -> JobScrapeRun | None:
    return (
        db.query(JobScrapeRun)
        .filter(JobScrapeRun.run_type == run_type)
        .order_by(JobScrapeRun.started_at.desc())
        .first()
    )


def get_latest_jobs(db: Session, limit: int = 10, *, active_only: bool = True) -> list[ScrapedJob]:
    query = db.query(ScrapedJob)
    if active_only:
        query = query.filter(ScrapedJob.link_status == "active")
    return query.order_by(ScrapedJob.created_at.desc()).limit(limit).all()


def get_expired_jobs(db: Session, limit: int = 20) -> list[ScrapedJob]:
    return (
        db.query(ScrapedJob)
        .filter(ScrapedJob.link_status.in_(["expired", "link_failed"]))
        .order_by(ScrapedJob.link_checked_at.desc().nullsfirst())
        .limit(limit)
        .all()
    )


def get_source_failure_counts(db: Session, days: int = 7) -> dict[str, int]:
    """Aggregate source errors from recent scrape runs."""
    since = datetime.utcnow() - timedelta(days=days)
    runs = (
        db.query(JobScrapeRun)
        .filter(JobScrapeRun.started_at >= since, JobScrapeRun.error_count > 0)
        .all()
    )
    failures: dict[str, int] = {}
    for run in runs:
        if not run.errors_json:
            continue
        try:
            errors = json.loads(run.errors_json)
        except (json.JSONDecodeError, TypeError):
            continue
        for err in errors:
            if isinstance(err, str) and ":" in err:
                src = err.split(":", 1)[0].strip().lower()
                failures[src] = failures.get(src, 0) + 1
    return failures


def create_scrape_run(
    db: Session,
    *,
    search_term: str,
    location: str,
    sources: list[str],
    results_wanted: int,
    hours_old: int,
    triggered_by: str | None,
    run_type: str = "manual",
    profile: str | None = None,
) -> JobScrapeRun:
    row = JobScrapeRun(
        search_term=search_term,
        location=location,
        sources_json=json.dumps(sources),
        results_wanted=results_wanted,
        hours_old=hours_old,
        started_at=datetime.utcnow(),
        triggered_by=triggered_by,
        status="failed",
        run_type=run_type,
        profile=profile,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_scrape_run(
    db: Session,
    run: JobScrapeRun,
    *,
    total_found: int,
    saved_count: int,
    skipped_duplicates: int,
    errors: list[str],
    finished_at: datetime,
    duration_ms: int,
    source_breakdown: dict[str, int] | None = None,
    expired_count: int = 0,
    failed_link_count: int = 0,
) -> JobScrapeRun:
    error_count = len(errors)
    if total_found == 0 and error_count > 0:
        status = "failed"
    elif total_found > 0 and error_count > 0:
        status = "partial_success"
    else:
        status = "success"

    run.total_found = total_found
    run.saved_count = saved_count
    run.skipped_duplicates = skipped_duplicates
    run.error_count = error_count
    run.errors_json = json.dumps(errors) if errors else None
    run.source_breakdown_json = json.dumps(source_breakdown) if source_breakdown else None
    run.expired_count = expired_count
    run.failed_link_count = failed_link_count
    run.finished_at = finished_at
    run.duration_ms = duration_ms
    run.status = status
    db.commit()
    db.refresh(run)
    return run


def scrape_run_to_dict(run: JobScrapeRun) -> dict[str, Any]:
    try:
        sources = json.loads(run.sources_json)
    except (json.JSONDecodeError, TypeError):
        sources = []
    try:
        source_breakdown = json.loads(run.source_breakdown_json) if run.source_breakdown_json else {}
    except (json.JSONDecodeError, TypeError):
        source_breakdown = {}
    return {
        "id": run.id,
        "searchTerm": run.search_term,
        "location": run.location,
        "sources": sources if isinstance(sources, list) else [],
        "totalFound": run.total_found,
        "savedCount": run.saved_count,
        "skippedDuplicates": run.skipped_duplicates,
        "errorCount": run.error_count,
        "status": run.status,
        "startedAt": run.started_at,
        "finishedAt": run.finished_at,
        "durationMs": run.duration_ms,
        "runType": getattr(run, "run_type", None) or "manual",
        "profile": getattr(run, "profile", None),
        "sourceBreakdown": source_breakdown if isinstance(source_breakdown, dict) else {},
        "expiredCount": getattr(run, "expired_count", 0) or 0,
        "failedLinkCount": getattr(run, "failed_link_count", 0) or 0,
    }
