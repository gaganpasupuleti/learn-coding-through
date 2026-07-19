"""Smoke test: purge removes non-active scraped jobs."""

from __future__ import annotations

import sys
import unittest
from datetime import datetime
from pathlib import Path
from uuid import uuid4

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal, Base, engine
from app.models.models import ScrapedJob
from app.services.job_store import delete_non_active_scraped_jobs


class DeleteNonActiveJobsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)

    def test_delete_non_active_scraped_jobs(self) -> None:
        db = SessionLocal()
        active_id = f"active-{uuid4().hex[:12]}"
        dead_id = f"dead-{uuid4().hex[:12]}"
        suffix = uuid4().hex[:8]
        try:
            now = datetime.utcnow()
            db.add(
                ScrapedJob(
                    id=active_id,
                    job_id=f"CQJ-TEST-{suffix}-0001",
                    source="indeed",
                    title="Active role",
                    job_url=f"https://example.com/jobs/{active_id}",
                    created_at=now,
                    link_status="active",
                )
            )
            db.add(
                ScrapedJob(
                    id=dead_id,
                    job_id=f"CQJ-TEST-{suffix}-0002",
                    source="indeed",
                    title="Dead role",
                    job_url=f"https://example.com/jobs/{dead_id}",
                    created_at=now,
                    link_status="link_failed",
                )
            )
            db.commit()

            active_before = db.query(ScrapedJob).filter(ScrapedJob.link_status == "active").count()
            failed_before = db.query(ScrapedJob).filter(ScrapedJob.link_status == "link_failed").count()

            result = delete_non_active_scraped_jobs(db)
            self.assertEqual(result["deletedJobs"], 1)
            self.assertEqual(
                db.query(ScrapedJob).filter(ScrapedJob.link_status == "active").count(),
                active_before,
            )
            self.assertEqual(
                db.query(ScrapedJob).filter(ScrapedJob.link_status == "link_failed").count(),
                failed_before - 1,
            )
            self.assertIsNone(db.query(ScrapedJob).filter(ScrapedJob.id == dead_id).first())
        finally:
            db.query(ScrapedJob).filter(ScrapedJob.id.in_([active_id, dead_id])).delete(
                synchronize_session=False
            )
            db.commit()
            db.close()


if __name__ == "__main__":
    unittest.main()
