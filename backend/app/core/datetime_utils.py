"""
Reusable date/time helpers for Code Quest backend.

Timestamps are stored as naive UTC in Postgres (Railway servers run UTC).
Admin APIs expose `*_ist` display strings and UTC ISO (`…Z`) for the frontend.
Use `ist_date_yyyymmdd` for job IDs and other IST calendar-day labels.
"""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


def now_utc() -> datetime:
    """Naive UTC now — use for DB writes."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_ist(dt: datetime) -> datetime:
    """Return dt converted to IST. Assumes UTC if dt is naive."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST)


def ist_date_yyyymmdd(dt: datetime) -> str:
    """IST calendar date as YYYYMMDD (job IDs, export filenames)."""
    return to_ist(dt).strftime("%Y%m%d")


def utc_iso_z(dt: datetime | None) -> str | None:
    """Serialize naive UTC datetime as ISO-8601 with Z suffix."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None).isoformat() + "Z"
    return dt.isoformat() + "Z"


def format_ist(dt: datetime | None) -> str | None:
    """
    Format a UTC datetime for IST display.

    Returns e.g. "04 Jul 2026, 06:06 PM IST"
    Returns None if dt is None.
    """
    if dt is None:
        return None
    ist_dt = to_ist(dt)
    # strftime %d zero-pads; strip leading zero for "4 Jul" not "04 Jul"
    day = ist_dt.strftime("%d").lstrip("0") or "0"
    return f"{day} {ist_dt.strftime('%b %Y, %I:%M %p')} IST"
