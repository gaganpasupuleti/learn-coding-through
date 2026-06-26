#!/usr/bin/env python3
"""
Railway Cron (every 8 hours): auto-refresh internship/fresher/entry-level India jobs.

Usage (from backend/):
  python scripts/run_job_auto_refresh.py
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal
from app.services.job_refresh import run_auto_refresh_profiles

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("run_job_auto_refresh")


def main() -> int:
    db = SessionLocal()
    try:
        results = run_auto_refresh_profiles(db, triggered_by="cron")
        for r in results:
            logger.info(
                "profile=%s status=%s found=%s saved=%s dupes=%s location=%s",
                r.get("profile"),
                r.get("status"),
                r.get("totalFound"),
                r.get("savedCount"),
                r.get("skippedDuplicates"),
                r.get("location", "India"),
            )
        failed = [r for r in results if r.get("status") == "failed"]
        return 1 if failed and len(failed) == len(results) else 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
