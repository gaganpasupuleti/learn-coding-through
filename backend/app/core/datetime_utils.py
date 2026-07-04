"""
Reusable date/time helpers for Code Quest backend.

All timestamps are stored in UTC.
These helpers convert UTC datetimes to human-readable IST strings for
display-only contexts: admin API responses, Excel exports, log labels.

Do NOT mutate stored timestamps. Do NOT call these in DB queries.
"""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


def to_ist(dt: datetime) -> datetime:
    """Return dt converted to IST. Assumes UTC if dt is naive."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST)


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
