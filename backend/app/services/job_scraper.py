"""Safe wrapper around python-jobspy for Code Quest jobs feature."""

from __future__ import annotations

import hashlib
import logging
from datetime import datetime
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

FIXED_SCRAPE_LOCATION = "India"
FIXED_COUNTRY_INDEED = "India"
DEFAULT_SOURCES = ["indeed", "google", "linkedin"]


def _job_id(source: str, job_url: str) -> str:
    raw = f"{source}:{job_url}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:32]


def _parse_date(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    try:
        import pandas as pd

        parsed = pd.to_datetime(value, errors="coerce")
        if pd.isna(parsed):
            return None
        return parsed.to_pydatetime()
    except Exception:
        return None


def _row_to_normalized(row: Any, source: str) -> dict[str, Any] | None:
    try:
        job_url = str(row.get("job_url") or row.get("job_url_direct") or "").strip()
        if not job_url:
            return None
        title = str(row.get("title") or "Untitled role").strip()
        company = row.get("company")
        location = row.get("location")
        job_type = row.get("job_type")
        min_amount = row.get("min_amount")
        max_amount = row.get("max_amount")
        currency = row.get("currency")
        description = row.get("description")
        apply_url = row.get("job_url_direct") or job_url
        date_posted = _parse_date(row.get("date_posted"))

        return {
            "id": _job_id(source, job_url),
            "source": source,
            "title": title,
            "company": str(company).strip() if company else None,
            "location": str(location).strip() if location else None,
            "jobType": str(job_type).strip() if job_type else None,
            "datePosted": date_posted,
            "salaryMin": float(min_amount) if min_amount is not None and str(min_amount) != "nan" else None,
            "salaryMax": float(max_amount) if max_amount is not None and str(max_amount) != "nan" else None,
            "currency": str(currency).strip() if currency else None,
            "description": str(description).strip() if description else None,
            "jobUrl": job_url,
            "applyUrl": str(apply_url).strip() if apply_url else job_url,
            "createdAt": datetime.utcnow(),
        }
    except Exception as exc:
        logger.warning("Failed to normalize job row from %s: %s", source, exc)
        return None


def scrape_jobs_safe(
    *,
    search_term: str | None = None,
    location: str | None = None,
    results_wanted: int | None = None,
    hours_old: int | None = None,
    sources: list[str] | None = None,
    country_indeed: str | None = None,
) -> tuple[list[dict[str, Any]], dict[str, int], list[str]]:
    """
    Run python-jobspy with safe defaults. Never raises — returns (jobs, source_breakdown, errors).
    """
    if not settings.jobspy_enabled:
        return [], {}, ["JobSpy scraping is disabled (JOBSPY_ENABLED=false)"]

    search_term = (search_term or "python developer").strip()
    # Code Quest job alerts are India-only; ignore any other location from callers.
    location = FIXED_SCRAPE_LOCATION
    results_wanted = min(results_wanted or settings.jobspy_results_wanted, 50)
    hours_old = hours_old or settings.jobspy_hours_old
    country_indeed = FIXED_COUNTRY_INDEED
    site_names = [s.strip().lower() for s in (sources or DEFAULT_SOURCES) if s.strip()]
    if not site_names:
        site_names = DEFAULT_SOURCES

    all_jobs: list[dict[str, Any]] = []
    source_breakdown: dict[str, int] = {s: 0 for s in site_names}
    errors: list[str] = []
    seen_ids: set[str] = set()

    try:
        from jobspy import scrape_jobs
    except ImportError:
        msg = "python-jobspy is not installed"
        logger.error(msg)
        return [], {}, [msg]

    for site in site_names:
        try:
            logger.info(
                "JobSpy scrape start: site=%s term=%r location=%r results=%s hours_old=%s",
                site,
                search_term,
                location,
                results_wanted,
                hours_old,
            )
            df = scrape_jobs(
                site_name=[site],
                search_term=search_term,
                location=location,
                results_wanted=results_wanted,
                hours_old=hours_old,
                country_indeed=country_indeed,
            )
            if df is None or df.empty:
                logger.info("JobSpy scrape: site=%s returned 0 rows", site)
                continue
            count = 0
            for _, row in df.iterrows():
                site_val = str(row.get("site") or site).lower()
                normalized = _row_to_normalized(row, site_val)
                if not normalized or normalized["id"] in seen_ids:
                    continue
                seen_ids.add(normalized["id"])
                all_jobs.append(normalized)
                count += 1
            source_breakdown[site] = count
            logger.info("JobSpy scrape done: site=%s found=%s", site, count)
        except Exception as exc:
            msg = f"{site}: {exc}"
            logger.exception("JobSpy scrape failed for %s", site)
            errors.append(msg)

    return all_jobs, source_breakdown, errors
