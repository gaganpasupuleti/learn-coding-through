#!/usr/bin/env python3
"""
Railway Cron entrypoint: scrape jobs, build digest, send only when JOB_MAIL_ENABLED=true.

Usage (from backend/):
  python scripts/send_job_digest.py
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.database import SessionLocal
from app.services.job_email import build_digest, send_email
from app.services.job_scraper import scrape_jobs_safe
from app.services.job_store import save_scraped_jobs

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("send_job_digest")


def main() -> int:
    logger.info("Job digest cron starting (JOB_MAIL_ENABLED=%s)", settings.job_mail_enabled)

    jobs, breakdown, errors = scrape_jobs_safe()
    logger.info("Scrape complete: found=%s breakdown=%s errors=%s", len(jobs), breakdown, errors)

    db = SessionLocal()
    try:
        saved, skipped = save_scraped_jobs(db, jobs)
        logger.info("Persisted jobs: saved=%s skipped_duplicates=%s", saved, skipped)

        if not settings.job_mail_enabled:
            logger.info("JOB_MAIL_ENABLED is false — skipping email send")
            return 0

        if not jobs:
            logger.warning("No jobs to email — exiting")
            return 0

        subject, html_body, text_body = build_digest(jobs)
        recipient = (settings.job_mail_test_recipient or "").strip()
        if not recipient:
            logger.error("JOB_MAIL_ENABLED=true but JOB_MAIL_TEST_RECIPIENT is not set — aborting send")
            return 1

        sent, failed = send_email(
            to_addrs=[recipient],
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )
        logger.info("Email result: sent=%s failed=%s", sent, failed)
        return 0 if sent and not failed else 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
