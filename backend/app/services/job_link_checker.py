"""Check scraped job URLs and mark link availability status."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.models.models import ScrapedJob

logger = logging.getLogger(__name__)

LINK_STATUS_ACTIVE = "active"
LINK_STATUS_EXPIRED = "expired"
LINK_STATUS_LINK_FAILED = "link_failed"
LINK_STATUS_UNKNOWN = "unknown"

REQUEST_TIMEOUT = 8
USER_AGENT = "CodeQuest-JobLinkChecker/1.0"


def check_url(url: str) -> str:
    """Return link_status: active | expired | link_failed | unknown."""
    if not url or not url.startswith("http"):
        return LINK_STATUS_LINK_FAILED
    try:
        resp = requests.head(
            url,
            allow_redirects=True,
            timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
        )
        if resp.status_code == 404:
            return LINK_STATUS_EXPIRED
        if resp.status_code in (410, 451):
            return LINK_STATUS_EXPIRED
        if resp.status_code >= 400:
            return LINK_STATUS_LINK_FAILED
        return LINK_STATUS_ACTIVE
    except requests.exceptions.Timeout:
        return LINK_STATUS_UNKNOWN
    except requests.exceptions.RequestException:
        return LINK_STATUS_LINK_FAILED


def cleanup_job_links(db: Session, *, limit: int = 50) -> dict[str, Any]:
    """
    Check active/unknown jobs and update link_status. Does not delete rows.
    Returns counts summary.
    """
    rows = (
        db.query(ScrapedJob)
        .filter(ScrapedJob.link_status.in_([LINK_STATUS_ACTIVE, LINK_STATUS_UNKNOWN, None]))
        .order_by(ScrapedJob.link_checked_at.asc().nullsfirst(), ScrapedJob.created_at.desc())
        .limit(limit)
        .all()
    )
    active = 0
    expired = 0
    link_failed = 0
    unknown = 0
    now = datetime.utcnow()

    for row in rows:
        url = row.apply_url or row.job_url
        status = check_url(url)
        row.link_status = status
        row.link_checked_at = now
        if status == LINK_STATUS_ACTIVE:
            active += 1
        elif status == LINK_STATUS_EXPIRED:
            expired += 1
        elif status == LINK_STATUS_LINK_FAILED:
            link_failed += 1
        else:
            unknown += 1

    if rows:
        db.commit()

    total_active = db.query(ScrapedJob).filter(ScrapedJob.link_status == LINK_STATUS_ACTIVE).count()
    total_expired = db.query(ScrapedJob).filter(ScrapedJob.link_status == LINK_STATUS_EXPIRED).count()
    total_failed = db.query(ScrapedJob).filter(ScrapedJob.link_status == LINK_STATUS_LINK_FAILED).count()
    total_unknown = db.query(ScrapedJob).filter(ScrapedJob.link_status == LINK_STATUS_UNKNOWN).count()

    return {
        "checkedCount": len(rows),
        "markedActive": active,
        "markedExpired": expired,
        "markedLinkFailed": link_failed,
        "markedUnknown": unknown,
        "totalActive": total_active,
        "totalExpired": total_expired,
        "totalLinkFailed": total_failed,
        "totalUnknown": total_unknown,
    }
