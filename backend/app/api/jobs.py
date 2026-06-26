"""Public and admin job board routes (python-jobspy integration)."""

from __future__ import annotations

import time
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import require_jobs_admin
from app.core.config import settings
from app.core.database import get_db
from app.models.models import ScrapedJob, User, UserRole
from app.schemas.scraped_jobs import (
    CleanupLinksResponse,
    EmailPreviewRequest,
    EmailPreviewResponse,
    FIXED_JOB_LOCATION,
    JobStatsResponse,
    JobsListResponse,
    LatestJobSummary,
    LocationBreakdownItem,
    NormalizedJob,
    RefreshRequest,
    RefreshResponse,
    ScrapeRequest,
    ScrapeRunSummary,
    ScrapeSummary,
    SendDigestRequest,
    SendDigestResponse,
    SourceBreakdownItem,
)
from app.services.job_email import build_digest, send_email
from app.services.job_link_checker import cleanup_job_links
from app.services.job_profiles import get_profile
from app.services.job_refresh import run_profile_refresh
from app.services.job_scraper import scrape_jobs_safe
from app.services.job_store import (
    count_active_jobs,
    count_jobs_by_link_status,
    count_jobs_since,
    count_total_jobs,
    create_scrape_run,
    get_expired_jobs,
    get_last_run_by_type,
    get_latest_jobs,
    get_latest_loaded_at,
    get_location_breakdown,
    get_recent_scrape_runs,
    get_source_breakdown,
    get_source_failure_counts,
    save_scraped_jobs,
    scrape_run_to_dict,
    scraped_job_to_dict,
    update_scrape_run,
)

router = APIRouter(tags=["Jobs"])
admin_router = APIRouter(prefix="/admin/jobs", tags=["Admin Jobs"])

# Student-friendly experience filters mapped to title/description keywords.
# Inferred from job text since scraped listings have no structured experience field.
EXPERIENCE_KEYWORDS: dict[str, list[str]] = {
    "internship": ["intern"],
    "fresher": [
        "fresher",
        "entry level",
        "entry-level",
        "graduate",
        "trainee",
        "junior",
        "0-1 year",
        "0 - 1 year",
        "0 to 1",
    ],
    "1plus": ["1 year", "1+ year", "1 - 2 year", "1-2 year", "1 to 2", "minimum 1 year", "1 yr"],
    "2plus": ["2 year", "2+ year", "2 - 3 year", "2-3 year", "2 to 3", "2 yr"],
    "3plus": ["3 year", "3+ year", "3 - 5 year", "3-5 year", "3 to 5", "3 yr"],
    "5plus": ["5 year", "5+ year", "senior", "lead", "principal", "architect", "5 yr"],
}


def _to_normalized(row: ScrapedJob) -> NormalizedJob:
    return NormalizedJob(**scraped_job_to_dict(row))


def _to_latest_summary(row: ScrapedJob) -> LatestJobSummary:
    return LatestJobSummary(
        id=row.id,
        source=row.source,
        title=row.title,
        company=row.company,
        location=row.location,
        datePosted=row.date_posted,
        createdAt=row.created_at,
        jobUrl=row.job_url,
        linkStatus=getattr(row, "link_status", None) or "active",
    )


def _triggered_by_label(admin: User | None) -> str:
    if admin is not None:
        return admin.email
    return "admin_key"


@router.get("/jobs", response_model=JobsListResponse)
def list_jobs(
    search: str | None = Query(None),
    location: str | None = Query(None),
    source: str | None = Query(None),
    company: str | None = Query(None),
    experience: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
):
    query = db.query(ScrapedJob)
    if not include_inactive:
        query = query.filter(ScrapedJob.link_status == "active")
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ScrapedJob.title.ilike(term),
                ScrapedJob.company.ilike(term),
                ScrapedJob.description.ilike(term),
            )
        )
    if company:
        query = query.filter(ScrapedJob.company.ilike(f"%{company.strip()}%"))
    if location:
        query = query.filter(ScrapedJob.location.ilike(f"%{location.strip()}%"))
    if source:
        query = query.filter(ScrapedJob.source == source.strip().lower())
    if experience:
        keywords = EXPERIENCE_KEYWORDS.get(experience.strip().lower())
        if keywords:
            clauses = []
            for kw in keywords:
                like = f"%{kw}%"
                clauses.append(ScrapedJob.title.ilike(like))
                clauses.append(ScrapedJob.description.ilike(like))
            query = query.filter(or_(*clauses))

    total = query.count()
    rows = (
        query.order_by(ScrapedJob.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return JobsListResponse(
        jobs=[_to_normalized(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/jobs/{job_id}", response_model=NormalizedJob)
def get_job(job_id: str, db: Session = Depends(get_db)):
    row = db.query(ScrapedJob).filter(ScrapedJob.id == job_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")
    return _to_normalized(row)


@admin_router.get("/stats", response_model=JobStatsResponse)
def admin_job_stats(
    days: int = Query(7, ge=1, le=90),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
):
    now = datetime.utcnow()
    start_of_today = datetime(now.year, now.month, now.day)
    since_24h = now - timedelta(hours=24)
    since_7d = now - timedelta(days=7)

    runs = get_recent_scrape_runs(db, days=days, limit=limit)
    latest = get_latest_jobs(db, limit=limit, active_only=True)
    expired_samples = get_expired_jobs(db, limit=limit)
    last_auto = get_last_run_by_type(db, "auto")
    last_cleanup = get_last_run_by_type(db, "cleanup")

    return JobStatsResponse(
        totalJobs=count_total_jobs(db),
        activeJobs=count_active_jobs(db),
        loadedToday=count_jobs_since(db, start_of_today),
        loadedLast24Hours=count_jobs_since(db, since_24h),
        loadedLast7Days=count_jobs_since(db, since_7d),
        latestLoadedAt=get_latest_loaded_at(db),
        expiredJobs=count_jobs_by_link_status(db, "expired"),
        linkFailedJobs=count_jobs_by_link_status(db, "link_failed"),
        unknownLinkJobs=count_jobs_by_link_status(db, "unknown"),
        lastAutoRefreshAt=last_auto.finished_at if last_auto else None,
        lastCleanupAt=last_cleanup.finished_at if last_cleanup else None,
        sourceBreakdown=[SourceBreakdownItem(**item) for item in get_source_breakdown(db)],
        sourceFailureCounts=get_source_failure_counts(db, days=days),
        locationBreakdown=[LocationBreakdownItem(**item) for item in get_location_breakdown(db, limit=limit)],
        recentScrapeRuns=[ScrapeRunSummary(**scrape_run_to_dict(r)) for r in runs],
        latestJobs=[_to_latest_summary(row) for row in latest],
        expiredJobSamples=[_to_latest_summary(row) for row in expired_samples],
    )


@admin_router.post("/refresh", response_model=RefreshResponse)
def admin_refresh_jobs(
    payload: RefreshRequest,
    db: Session = Depends(get_db),
    admin: User | None = Depends(require_jobs_admin),
):
    profile = get_profile(payload.profile)
    if profile is None:
        raise HTTPException(status_code=400, detail=f"Unknown profile: {payload.profile}")

    if payload.runMode == "auto" and not profile.auto_enabled:
        raise HTTPException(
            status_code=400,
            detail=f"Profile {payload.profile} is manual-only and cannot run in auto mode",
        )

    run_type = "auto" if payload.runMode == "auto" else "manual"
    try:
        result = run_profile_refresh(
            db,
            profile_key=payload.profile,
            sources=payload.sources,
            run_type=run_type,
            triggered_by=_triggered_by_label(admin),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return RefreshResponse(**result)


@admin_router.post("/cleanup-links", response_model=CleanupLinksResponse)
def admin_cleanup_links(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User | None = Depends(require_jobs_admin),
):
    started = time.perf_counter()
    run = create_scrape_run(
        db,
        search_term="link cleanup",
        location=FIXED_JOB_LOCATION,
        sources=[],
        results_wanted=0,
        hours_old=0,
        triggered_by=_triggered_by_label(admin),
        run_type="cleanup",
        profile=None,
    )

    summary = cleanup_job_links(db, limit=limit)
    duration_ms = max(0, int((time.perf_counter() - started) * 1000))
    finished_at = datetime.utcnow()

    run = update_scrape_run(
        db,
        run,
        total_found=summary["checkedCount"],
        saved_count=0,
        skipped_duplicates=0,
        errors=[],
        finished_at=finished_at,
        duration_ms=duration_ms,
        expired_count=summary["markedExpired"],
        failed_link_count=summary["markedLinkFailed"],
    )

    return CleanupLinksResponse(scrapeRunId=run.id, **summary)


@admin_router.post("/scrape", response_model=ScrapeSummary)
def admin_scrape_jobs(
    payload: ScrapeRequest,
    db: Session = Depends(get_db),
    admin: User | None = Depends(require_jobs_admin),
):
    """Legacy endpoint — use POST /refresh with a profile instead."""
    result = run_profile_refresh(
        db,
        profile_key="fresher_india",
        sources=payload.sources,
        run_type="manual",
        triggered_by=_triggered_by_label(admin),
    )
    return ScrapeSummary(
        searchTerm=result["profileLabel"],
        location=result["location"],
        totalFound=result["totalFound"],
        savedCount=result["savedCount"],
        skippedDuplicates=result["skippedDuplicates"],
        sourceBreakdown=result["sourceBreakdown"],
        errors=result["errors"],
        scrapeRunId=result["scrapeRunId"],
        status=result["status"],
        durationMs=result["durationMs"],
        totalJobsBefore=result["totalJobsBefore"],
        totalJobsAfter=result["totalJobsAfter"],
    )


@admin_router.post("/email-preview", response_model=EmailPreviewResponse)
def admin_email_preview(
    payload: EmailPreviewRequest,
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
):
    jobs = _load_jobs_for_digest(db, payload.jobIds)
    subject, html_body, text_body = build_digest(
        jobs,
        search_term=payload.searchTerm,
        location=FIXED_JOB_LOCATION,
    )
    return EmailPreviewResponse(subject=subject, html=html_body, text=text_body)


@admin_router.post("/send-digest", response_model=SendDigestResponse)
def admin_send_digest(
    payload: SendDigestRequest,
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
):
    mode = (payload.mode or "test").strip().lower()
    if mode != "test" and not settings.job_mail_enabled:
        raise HTTPException(
            status_code=403,
            detail="Real student digests are disabled. Set JOB_MAIL_ENABLED=true to allow.",
        )

    jobs = _load_jobs_for_digest(db, payload.jobIds)
    if not jobs:
        raise HTTPException(status_code=400, detail="No jobs available for digest")

    subject, html_body, text_body = build_digest(jobs)

    if mode == "test":
        recipient = (payload.testEmail or settings.job_mail_test_recipient or "").strip()
        if not recipient:
            raise HTTPException(status_code=400, detail="testEmail or JOB_MAIL_TEST_RECIPIENT required for test mode")
        try:
            sent, failed = send_email(
                to_addrs=[recipient],
                subject=subject,
                html_body=html_body,
                text_body=text_body,
            )
        except ValueError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        return SendDigestResponse(
            sentCount=sent,
            failedCount=len(failed),
            failedEmails=failed,
            mode="test",
            message=f"Test digest sent to {recipient}" if sent else "Test send failed",
        )

    recipients = _student_recipient_emails(db)
    if not recipients:
        raise HTTPException(
            status_code=400,
            detail="No student emails in database. Test mode only until student roster is available.",
        )
    cap = settings.job_mail_max_recipients_per_run
    recipients = recipients[:cap]
    try:
        sent, failed = send_email(
            to_addrs=recipients,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return SendDigestResponse(
        sentCount=sent,
        failedCount=len(failed),
        failedEmails=failed,
        mode="live",
        message=f"Digest sent to {sent} of {len(recipients)} students",
    )


def _load_jobs_for_digest(db: Session, job_ids: list[str]) -> list[dict]:
    if job_ids:
        rows = db.query(ScrapedJob).filter(ScrapedJob.id.in_(job_ids)).all()
    else:
        rows = (
            db.query(ScrapedJob)
            .filter(ScrapedJob.link_status == "active")
            .order_by(ScrapedJob.created_at.desc())
            .limit(20)
            .all()
        )
    return [scraped_job_to_dict(r) for r in rows]


def _student_recipient_emails(db: Session) -> list[str]:
    rows = (
        db.query(User.email)
        .filter(User.role == UserRole.STUDENT)
        .order_by(User.id.asc())
        .all()
    )
    return [r[0] for r in rows if r[0]]
