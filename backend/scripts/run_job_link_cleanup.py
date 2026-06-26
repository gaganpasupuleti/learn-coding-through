#!/usr/bin/env python3
"""
Railway Cron (daily): check job links and mark expired/failed without deleting.

Usage (from backend/):
  python scripts/run_job_link_cleanup.py
"""

from __future__ import annotations

import logging
import sys
import time
from datetime import datetime
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal
from app.schemas.scraped_jobs import FIXED_JOB_LOCATION
from app.services.job_link_checker import cleanup_job_links
from app.services.job_store import create_scrape_run, update_scrape_run

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("run_job_link_cleanup")

CHECK_LIMIT = 50


def main() -> int:
    db = SessionLocal()
    try:
        started = time.perf_counter()
        run = create_scrape_run(
            db,
            search_term="link cleanup",
            location=FIXED_JOB_LOCATION,
            sources=[],
            results_wanted=0,
            hours_old=0,
            triggered_by="cron",
            run_type="cleanup",
        )
        summary = cleanup_job_links(db, limit=CHECK_LIMIT)
        duration_ms = max(0, int((time.perf_counter() - started) * 1000))
        update_scrape_run(
            db,
            run,
            total_found=summary["checkedCount"],
            saved_count=0,
            skipped_duplicates=0,
            errors=[],
            finished_at=datetime.utcnow(),
            duration_ms=duration_ms,
            expired_count=summary["markedExpired"],
            failed_link_count=summary["markedLinkFailed"],
        )
        logger.info(
            "cleanup checked=%s active=%s expired=%s failed=%s unknown=%s",
            summary["checkedCount"],
            summary["totalActive"],
            summary["totalExpired"],
            summary["totalLinkFailed"],
            summary["totalUnknown"],
        )
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
