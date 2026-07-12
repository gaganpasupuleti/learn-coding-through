#!/usr/bin/env python3
"""
Railway Cron (daily): check job apply URLs, then delete expired/dead rows.

Usage (from backend/):
  python scripts/run_job_link_cleanup.py
  python scripts/run_job_link_cleanup.py --all --limit 100
  python scripts/run_job_link_cleanup.py --purge-only
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
from app.models.models import ScrapedJob
from app.services.job_link_checker import cleanup_job_links
from app.services.job_store import create_scrape_run, delete_non_active_scraped_jobs, update_scrape_run

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("run_job_link_cleanup")

CHECK_LIMIT = 50


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Check job apply URLs and purge dead/expired rows")
    parser.add_argument("--limit", type=int, default=CHECK_LIMIT, help="Max jobs per batch (default 50)")
    parser.add_argument("--all", action="store_true", help="Check all active/unknown jobs in batches")
    parser.add_argument(
        "--purge-only",
        action="store_true",
        help="Delete expired/link_failed/unknown rows without checking URLs",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.purge_only:
            purge = delete_non_active_scraped_jobs(db)
            logger.info(
                "purge-only deleted_jobs=%s deleted_enrichments=%s active=%s expired=%s failed=%s unknown=%s",
                purge["deletedJobs"],
                purge["deletedEnrichments"],
                db.query(ScrapedJob).filter(ScrapedJob.link_status == "active").count(),
                db.query(ScrapedJob).filter(ScrapedJob.link_status == "expired").count(),
                db.query(ScrapedJob).filter(ScrapedJob.link_status == "link_failed").count(),
                db.query(ScrapedJob).filter(ScrapedJob.link_status == "unknown").count(),
            )
            return 0

        started = time.perf_counter()
        run = create_scrape_run(
            db,
            search_term="link cleanup",
            location=FIXED_JOB_LOCATION,
            sources=[],
            results_wanted=0,
            hours_old=0,
            triggered_by="cron" if not args.all else "manual_full_cleanup",
            run_type="cleanup",
        )
        totals = {"checkedCount": 0, "markedExpired": 0, "markedLinkFailed": 0, "markedUnknown": 0}
        batch_limit = max(1, args.limit)
        while True:
            summary = cleanup_job_links(db, limit=batch_limit)
            totals["checkedCount"] += summary["checkedCount"]
            totals["markedExpired"] += summary["markedExpired"]
            totals["markedLinkFailed"] += summary["markedLinkFailed"]
            totals["markedUnknown"] += summary["markedUnknown"]
            logger.info(
                "batch checked=%s active=%s expired=%s failed=%s unknown=%s",
                summary["checkedCount"],
                summary["totalActive"],
                summary["totalExpired"],
                summary["totalLinkFailed"],
                summary["totalUnknown"],
            )
            if not args.all or summary["checkedCount"] < batch_limit:
                break

        purge = delete_non_active_scraped_jobs(db)
        summary = totals
        summary.update(purge)
        summary.update(
            {
                "totalActive": db.query(ScrapedJob).filter(ScrapedJob.link_status == "active").count(),
                "totalExpired": db.query(ScrapedJob).filter(ScrapedJob.link_status == "expired").count(),
                "totalLinkFailed": db.query(ScrapedJob).filter(ScrapedJob.link_status == "link_failed").count(),
                "totalUnknown": db.query(ScrapedJob).filter(ScrapedJob.link_status == "unknown").count(),
            }
        )
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
            "cleanup checked=%s deleted=%s enrichments=%s active=%s expired=%s failed=%s unknown=%s",
            summary["checkedCount"],
            summary["deletedJobs"],
            summary["deletedEnrichments"],
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
