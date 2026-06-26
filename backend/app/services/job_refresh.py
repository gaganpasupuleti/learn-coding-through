"""Profile-based India job refresh orchestration."""

from __future__ import annotations

import json
import logging
import math
import time
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.scraped_jobs import FIXED_JOB_LOCATION
from app.services.job_profiles import (
    ALLOWED_MANUAL_RANGE_DAYS,
    AUTO_OVERLAP_BUFFER_HOURS,
    DEFAULT_HOURS_OLD,
    DEFAULT_MANUAL_RANGE_DAYS,
    DEFAULT_SOURCES,
    MAX_HOURS_OLD,
    MAX_PER_SOURCE_PER_QUERY,
    MAX_TOTAL_JOBS_PER_RUN,
    get_profile,
)
from app.services.job_scraper import scrape_jobs_safe
from app.services.job_store import (
    count_total_jobs,
    create_scrape_run,
    get_last_successful_auto_run,
    save_scraped_jobs,
    update_scrape_run,
)

logger = logging.getLogger(__name__)


def _fallback_hours_old() -> int:
    return max(1, min(settings.jobspy_hours_old, MAX_HOURS_OLD))


def compute_auto_hours_old(db: Session) -> tuple[int, str]:
    """
    Derive scrape window from last successful auto run + overlap buffer.
    Falls back to JOBSPY_HOURS_OLD when no prior successful auto run exists.
    """
    fallback = _fallback_hours_old()
    last = get_last_successful_auto_run(db)
    if last is None or last.finished_at is None:
        return fallback, f"Fallback: last {fallback}h (no prior successful auto run)"

    elapsed_hours = (datetime.utcnow() - last.finished_at).total_seconds() / 3600.0
    hours = int(math.ceil(elapsed_hours)) + AUTO_OVERLAP_BUFFER_HOURS
    hours = max(AUTO_OVERLAP_BUFFER_HOURS, min(hours, MAX_HOURS_OLD))
    return (
        hours,
        f"Auto range: since last run + {AUTO_OVERLAP_BUFFER_HOURS}h overlap ({hours}h)",
    )


def resolve_manual_hours_old(
    *,
    hours_old: int | None,
    date_range_days: int | None,
) -> tuple[int, int | None, str]:
    """Resolve manual refresh window. Default: last 3 days."""
    if date_range_days is not None:
        if date_range_days not in ALLOWED_MANUAL_RANGE_DAYS:
            allowed = ", ".join(str(d) for d in ALLOWED_MANUAL_RANGE_DAYS)
            raise ValueError(f"dateRangeDays must be one of: {allowed}")
        hours = date_range_days * 24
        if date_range_days == 1:
            label = "Range: last 24 hours"
        else:
            label = f"Range: last {date_range_days} days"
        return hours, date_range_days, label

    if hours_old is not None:
        if hours_old < 1 or hours_old > MAX_HOURS_OLD:
            raise ValueError(f"hoursOld must be between 1 and {MAX_HOURS_OLD}")
        days = max(1, round(hours_old / 24))
        if hours_old <= 24:
            label = "Range: last 24 hours"
        else:
            label = f"Range: last {days} days"
        return hours_old, None, label

    days = DEFAULT_MANUAL_RANGE_DAYS
    return days * 24, days, f"Range: last {days} days"


def run_profile_refresh(
    db: Session,
    *,
    profile_key: str,
    sources: list[str] | None,
    run_type: str,
    triggered_by: str | None,
    hours_old: int = DEFAULT_HOURS_OLD,
    date_range_days: int | None = None,
    range_label: str | None = None,
) -> dict[str, Any]:
    profile = get_profile(profile_key)
    if profile is None:
        raise ValueError(f"Unknown profile: {profile_key}")

    site_list = [s.strip().lower() for s in (sources or DEFAULT_SOURCES) if s.strip()]
    if not site_list:
        site_list = list(DEFAULT_SOURCES)

    total_before = count_total_jobs(db)
    search_label = ", ".join(profile.search_terms[:3])
    if len(profile.search_terms) > 3:
        search_label += "…"

    run = create_scrape_run(
        db,
        search_term=search_label,
        location=FIXED_JOB_LOCATION,
        sources=site_list,
        results_wanted=MAX_PER_SOURCE_PER_QUERY,
        hours_old=hours_old,
        triggered_by=triggered_by,
        run_type=run_type,
        profile=profile_key,
    )
    started = time.perf_counter()

    all_jobs: list[dict[str, Any]] = []
    merged_breakdown: dict[str, int] = {s: 0 for s in site_list}
    all_errors: list[str] = []
    seen_ids: set[str] = set()

    for term in profile.search_terms:
        if len(all_jobs) >= MAX_TOTAL_JOBS_PER_RUN:
            logger.info("Profile %s hit max jobs cap (%s)", profile_key, MAX_TOTAL_JOBS_PER_RUN)
            break
        remaining = MAX_TOTAL_JOBS_PER_RUN - len(all_jobs)
        per_query_cap = min(MAX_PER_SOURCE_PER_QUERY, remaining)

        jobs, breakdown, errors = scrape_jobs_safe(
            search_term=term,
            results_wanted=per_query_cap,
            hours_old=hours_old,
            sources=site_list,
        )
        for job in jobs:
            if job["id"] not in seen_ids:
                seen_ids.add(job["id"])
                job["ingestProfile"] = profile_key
                all_jobs.append(job)
        for src, cnt in breakdown.items():
            merged_breakdown[src] = merged_breakdown.get(src, 0) + cnt
        all_errors.extend(errors)

        if len(all_jobs) >= MAX_TOTAL_JOBS_PER_RUN:
            break

    saved_count, skipped = save_scraped_jobs(db, all_jobs, profile_key=profile_key)
    total_after = count_total_jobs(db)

    finished_at = datetime.utcnow()
    duration_ms = max(0, int((time.perf_counter() - started) * 1000))
    run = update_scrape_run(
        db,
        run,
        total_found=len(all_jobs),
        saved_count=saved_count,
        skipped_duplicates=skipped,
        errors=all_errors,
        finished_at=finished_at,
        duration_ms=duration_ms,
        source_breakdown=merged_breakdown,
    )

    return {
        "profile": profile_key,
        "profileLabel": profile.label,
        "location": FIXED_JOB_LOCATION,
        "runType": run_type,
        "hoursOld": hours_old,
        "dateRangeDays": date_range_days,
        "rangeLabel": range_label,
        "totalFound": len(all_jobs),
        "savedCount": saved_count,
        "skippedDuplicates": skipped,
        "sourceBreakdown": merged_breakdown,
        "errors": all_errors,
        "scrapeRunId": run.id,
        "status": run.status,
        "durationMs": duration_ms,
        "totalJobsBefore": total_before,
        "totalJobsAfter": total_after,
        "expiredCount": run.expired_count,
        "failedLinkCount": run.failed_link_count,
    }


def run_auto_refresh_profiles(db: Session, *, triggered_by: str = "cron") -> list[dict[str, Any]]:
    from app.services.job_profiles import auto_profile_keys

    hours_old, range_label = compute_auto_hours_old(db)
    logger.info("Auto refresh hours_old=%s (%s)", hours_old, range_label)

    results = []
    for key in auto_profile_keys():
        try:
            results.append(
                run_profile_refresh(
                    db,
                    profile_key=key,
                    sources=list(DEFAULT_SOURCES),
                    run_type="auto",
                    triggered_by=triggered_by,
                    hours_old=hours_old,
                    range_label=range_label,
                )
            )
        except Exception as exc:
            logger.exception("Auto refresh failed for profile %s", key)
            results.append({"profile": key, "status": "failed", "errors": [str(exc)]})
    return results
