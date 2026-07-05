"""Public and admin job board routes (python-jobspy integration)."""

from __future__ import annotations

import csv
import io
import secrets
import time
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_jobs_admin
from app.api.deps import get_optional_user, oauth2_scheme
from app.core.config import settings
from app.core.database import get_db
from app.core.datetime_utils import format_ist
from app.models.models import ScrapedJob, User, UserRole
from app.schemas.job_enrichment import (
    JobEnrichmentListResponse,
    JobEnrichmentReviewResponse,
    JobEnrichmentRow,
    JobEnrichmentSummaryResponse,
)
from app.schemas.job_enrichment_import import (
    JobEnrichmentImportCommitResponse,
    JobEnrichmentImportPreviewResponse,
)
from app.schemas.scraped_jobs import (
    CleanupLinksResponse,
    DigestSummary,
    EmailDigestFields,
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
from app.services.job_enrichment_import import (
    commit_job_enrichment_import,
    preview_job_enrichment_import,
)
from app.services.job_enrichment_read import (
    get_job_enrichment_by_id,
    get_job_enrichment_review_rows,
    get_job_enrichment_summary,
    list_job_enrichments,
)
from app.services.job_email import build_digest, send_email
from app.services.job_link_checker import cleanup_job_links
from app.services.job_profiles import get_profile
from app.services.job_refresh import (
    compute_auto_hours_old,
    resolve_manual_hours_old,
    run_profile_refresh,
)
from app.services.job_scraper import scrape_jobs_safe
from app.services.job_store import (
    count_active_jobs,
    count_jobs_by_link_status,
    count_jobs_since,
    count_total_jobs,
    create_scrape_run,
    get_expired_jobs,
    get_last_successful_auto_run,
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
    last_auto = get_last_successful_auto_run(db)
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
        if run_type == "auto":
            hours_old, range_label = compute_auto_hours_old(db)
            date_range_days = None
        else:
            hours_old, date_range_days, range_label = resolve_manual_hours_old(
                hours_old=payload.hoursOld,
                date_range_days=payload.dateRangeDays,
            )
        result = run_profile_refresh(
            db,
            profile_key=payload.profile,
            sources=payload.sources,
            run_type=run_type,
            triggered_by=_triggered_by_label(admin),
            hours_old=hours_old,
            date_range_days=date_range_days,
            range_label=range_label,
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
    content = _build_digest_content(db, payload)
    return EmailPreviewResponse(
        subject=content.subject,
        html=content.html,
        text=content.text,
        jobCount=content.job_count,
        summary=_summary_to_schema(content.summary),
    )


@admin_router.post("/send-digest", response_model=SendDigestResponse)
def admin_send_digest(
    payload: SendDigestRequest,
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
):
    mode = (payload.mode or "test").strip().lower()
    if mode not in {"test", "dry_run", "live"}:
        raise HTTPException(status_code=400, detail="mode must be test, dry_run, or live")
    if mode == "live" and not settings.job_mail_enabled:
        raise HTTPException(
            status_code=403,
            detail="Live student digests are disabled. Set JOB_MAIL_ENABLED=true to allow.",
        )

    content = _build_digest_content(db, payload)
    if not content.job_count:
        raise HTTPException(status_code=400, detail="No jobs available for digest")

    subject, html_body, text_body = content.subject, content.html, content.text
    job_count = content.job_count

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
            recipientCount=1,
            jobCount=job_count,
        )

    if mode == "dry_run":
        recipients = _student_recipient_emails(db)
        cap = settings.job_mail_max_recipients_per_run
        capped = recipients[:cap]
        return SendDigestResponse(
            sentCount=0,
            failedCount=0,
            failedEmails=[],
            mode="dry_run",
            message=(
                f"Dry run: {len(capped)} registered student(s) would receive digest "
                f"({len(recipients)} unique emails in roster; cap {cap}). No emails sent."
            ),
            recipientCount=len(capped),
            jobCount=job_count,
        )

    recipients = _student_recipient_emails(db)
    if not recipients:
        raise HTTPException(
            status_code=400,
            detail="No student emails in database. Use test or dry_run mode until student roster is available.",
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
        recipientCount=len(recipients),
        jobCount=job_count,
    )


def _count_active_jobs(db: Session) -> int:
    return (
        db.query(ScrapedJob)
        .filter(ScrapedJob.link_status == "active")
        .count()
    )


def _count_recent_by_category(db: Session, *, hours: int = 24) -> tuple[int, int]:
    """Count active internship and fresher jobs opened within the last `hours`.

    Classification uses the ingest profile first, then title/job_type keyword fallbacks.
    Returns (internships_count, freshers_count).
    """
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    base = db.query(ScrapedJob).filter(
        ScrapedJob.link_status == "active",
        ScrapedJob.created_at >= cutoff,
    )

    title_lower = func.lower(func.coalesce(ScrapedJob.title, ""))
    type_lower = func.lower(func.coalesce(ScrapedJob.job_type, ""))

    internships = base.filter(
        or_(
            ScrapedJob.ingest_profile == "internship_india",
            title_lower.like("%intern%"),
            type_lower.like("%intern%"),
        )
    ).count()

    freshers = base.filter(
        or_(
            ScrapedJob.ingest_profile == "fresher_india",
            title_lower.like("%fresher%"),
            title_lower.like("%graduate%"),
            title_lower.like("%entry level%"),
            title_lower.like("%entry-level%"),
            title_lower.like("%trainee%"),
        )
    ).count()

    return internships, freshers


def _summary_to_schema(summary) -> DigestSummary:
    d = summary.as_dict()
    return DigestSummary(**d)


def _build_digest_content(db: Session, payload: EmailDigestFields):
    jobs = _load_jobs_for_digest(db, payload.jobIds, max_jobs=payload.maxJobs)
    internships_24h, freshers_24h = _count_recent_by_category(db, hours=24)
    return build_digest(
        jobs,
        search_term=payload.searchTerm,
        location=FIXED_JOB_LOCATION,
        max_jobs=payload.maxJobs,
        total_active_jobs=_count_active_jobs(db),
        internships_24h=internships_24h,
        freshers_24h=freshers_24h,
        subject_override=payload.subjectOverride,
        intro_message=payload.introMessage,
        cta_label=payload.ctaLabel,
        cta_url=payload.ctaUrl,
    )


def _load_jobs_for_digest(db: Session, job_ids: list[str], *, max_jobs: int = 20) -> list[dict]:
    limit = max(1, min(max_jobs, 50))
    if job_ids:
        rows = db.query(ScrapedJob).filter(ScrapedJob.id.in_(job_ids)).all()
    else:
        rows = (
            db.query(ScrapedJob)
            .filter(ScrapedJob.link_status == "active")
            .order_by(ScrapedJob.created_at.desc())
            .limit(limit)
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
    seen: set[str] = set()
    unique: list[str] = []
    for row in rows:
        raw = (row[0] or "").strip()
        if not raw:
            continue
        key = raw.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(raw)
    return unique


# ---------------------------------------------------------------------------
# CSV export — admin only
# Browser-friendly: accepts admin_key as query param so native file downloads work.
# ---------------------------------------------------------------------------

def _check_export_auth(
    token_user: User | None,
    x_admin_key: str | None,
    admin_key_query: str | None,
) -> None:
    """Accepts JWT admin role, X-Admin-Key header, or admin_key query param."""
    if token_user is not None and token_user.role in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        return
    expected = (settings.admin_job_key or "").strip()
    if settings.environment == "production" and not expected:
        raise HTTPException(status_code=403, detail="ADMIN_JOB_KEY must be set in production")
    provided = (x_admin_key or admin_key_query or "").strip()
    if expected and provided and secrets.compare_digest(provided, expected):
        return
    raise HTTPException(status_code=403, detail="Admin access required (JWT admin or admin_key)")


@admin_router.get("/export")
def export_jobs_csv(
    limit: int = Query(500, ge=1, le=5000),
    include_inactive: bool = Query(False),
    admin_key: str | None = Query(None),
    db: Session = Depends(get_db),
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    token: str | None = Depends(oauth2_scheme),
) -> StreamingResponse:
    """Stream active scraped jobs as a downloadable CSV file."""
    user = get_optional_user(db, token)  # type: ignore[arg-type]
    _check_export_auth(user, x_admin_key, admin_key)

    query = db.query(ScrapedJob)
    if not include_inactive:
        query = query.filter(ScrapedJob.link_status == "active")
    rows = query.order_by(ScrapedJob.created_at.desc()).limit(limit).all()

    def _salary(row: ScrapedJob) -> str:
        lo = float(row.salary_min) if row.salary_min else None
        hi = float(row.salary_max) if row.salary_max else None
        cur = row.currency or ""
        if lo and hi:
            return f"{cur} {int(lo):,} – {int(hi):,}".strip()
        if lo:
            return f"{cur} {int(lo):,}+".strip()
        if hi:
            return f"up to {cur} {int(hi):,}".strip()
        return ""

    def _date(v: datetime | None) -> str:
        return v.strftime("%Y-%m-%d") if v else ""

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "#", "Job ID", "Title", "Company", "Location", "Source",
        "Type", "Date Posted", "Salary", "Status", "Profile",
        "Apply Link", "Job URL", "Added (IST)",
    ])
    for seq, row in enumerate(rows, start=1):
        job_id = getattr(row, "job_id", None) or row.id
        apply = row.apply_url or row.job_url or ""
        writer.writerow([
            seq,
            job_id,
            row.title,
            row.company or "",
            row.location or "",
            row.source,
            row.job_type or "",
            _date(row.date_posted),
            _salary(row),
            getattr(row, "link_status", "active") or "active",
            getattr(row, "ingest_profile", "") or "",
            apply,
            row.job_url or "",
            format_ist(row.created_at) or "",
        ])

    buf.seek(0)
    filename = f"jobs_export_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@admin_router.get("/enrichment/summary", response_model=JobEnrichmentSummaryResponse)
def admin_job_enrichment_summary(
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
) -> JobEnrichmentSummaryResponse:
    """Aggregate counts for saved job enrichment rows."""
    return get_job_enrichment_summary(db)


@admin_router.get("/enrichment/review", response_model=JobEnrichmentReviewResponse)
def admin_job_enrichment_review(
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
) -> JobEnrichmentReviewResponse:
    """Rows needing admin review (NEEDS_REVIEW or manual_review_needed)."""
    return get_job_enrichment_review_rows(db)


@admin_router.get("/enrichment", response_model=JobEnrichmentListResponse)
def admin_job_enrichment_list(
    approved_status: str | None = Query(None),
    actual_role_id: str | None = Query(None),
    experience_level: str | None = Query(None),
    job_live_status: str | None = Query(None),
    manual_review_needed: bool | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
) -> JobEnrichmentListResponse:
    """Paginated list of saved job enrichment rows."""
    return list_job_enrichments(
        db,
        approved_status=approved_status,
        actual_role_id=actual_role_id,
        experience_level=experience_level,
        job_live_status=job_live_status,
        manual_review_needed=manual_review_needed,
        limit=limit,
        offset=offset,
    )


@admin_router.get("/enrichment/{job_id}", response_model=JobEnrichmentRow)
def admin_job_enrichment_detail(
    job_id: str,
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
) -> JobEnrichmentRow:
    """One saved job enrichment row by job_id."""
    row = get_job_enrichment_by_id(db, job_id)
    if not row:
        raise HTTPException(status_code=404, detail="Job enrichment not found")
    return row


@admin_router.post("/enrichment/import-preview", response_model=JobEnrichmentImportPreviewResponse)
async def admin_job_enrichment_import_preview(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
) -> JobEnrichmentImportPreviewResponse:
    """Validate enriched job CSV without writing to job_enrichments or quiz tables."""
    filename = (file.filename or "").strip().lower()
    if not filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a .csv file")

    raw = await file.read()
    if not raw.strip():
        raise HTTPException(status_code=400, detail="CSV file is empty")

    try:
        return preview_job_enrichment_import(db, raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@admin_router.post("/enrichment/import-commit", response_model=JobEnrichmentImportCommitResponse)
async def admin_job_enrichment_import_commit(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: User | None = Depends(require_jobs_admin),
) -> JobEnrichmentImportCommitResponse:
    """Validate and upsert enriched job rows into job_enrichments."""
    filename = (file.filename or "").strip().lower()
    if not filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a .csv file")

    raw = await file.read()
    if not raw.strip():
        raise HTTPException(status_code=400, detail="CSV file is empty")

    try:
        return commit_job_enrichment_import(db, raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

