"""Experience filter must not match senior roles via 'internal' / 'international'."""

from __future__ import annotations

import sys
import unittest
import uuid
from datetime import datetime
from pathlib import Path

from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, SessionLocal, engine
from app.main import app
from app.models.models import ScrapedJob


class JobExperienceFilterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)
        cls.marker = f"exp-filter-{uuid.uuid4().hex[:10]}"

    def setUp(self) -> None:
        self.db = SessionLocal()
        self.ids: list[str] = []

    def tearDown(self) -> None:
        if self.ids:
            self.db.query(ScrapedJob).filter(ScrapedJob.id.in_(self.ids)).delete(synchronize_session=False)
            self.db.commit()
        self.db.close()

    def _add_job(self, **kwargs) -> ScrapedJob:
        job_id = f"{self.marker}-{uuid.uuid4().hex[:8]}"
        row = ScrapedJob(
            id=job_id,
            source=kwargs.get("source", "indeed"),
            title=kwargs["title"],
            company=kwargs.get("company", "Test Co"),
            location=kwargs.get("location", "India"),
            job_type=kwargs.get("job_type"),
            description=kwargs.get("description"),
            job_url=f"https://example.com/jobs/{job_id}",
            link_status="active",
            ingest_profile=kwargs.get("ingest_profile"),
            created_at=datetime.utcnow(),
        )
        self.db.add(row)
        self.db.commit()
        self.ids.append(job_id)
        return row

    def test_internship_excludes_senior_with_internal_in_description(self) -> None:
        senior = self._add_job(
            title=f"{self.marker} Customer Success Manager, Sr Manager",
            job_type="5-6 Yrs",
            description="Own internal stakeholders and international expansion for enterprise CS.",
            ingest_profile="role_family:unknown",
        )
        intern = self._add_job(
            title=f"{self.marker} Software Engineer Intern",
            job_type="internship",
            description="Join our internship program for freshers.",
            ingest_profile="internship_india",
        )

        r = self.client.get("/api/jobs", params={"experience": "internship", "search": self.marker, "limit": 50})
        self.assertEqual(r.status_code, 200, r.text)
        ids = {job["id"] for job in r.json()["jobs"]}
        self.assertIn(intern.id, ids)
        self.assertNotIn(senior.id, ids)

    def test_internship_includes_title_match_even_with_years_job_type(self) -> None:
        # Rare but valid: title says Intern, job_type may be noisy.
        intern = self._add_job(
            title=f"{self.marker} Data Analyst Intern",
            job_type="0-1 Yrs",
            description="Paid internship.",
            ingest_profile=None,
        )
        r = self.client.get("/api/jobs", params={"experience": "internship", "search": self.marker, "limit": 50})
        self.assertEqual(r.status_code, 200, r.text)
        ids = {job["id"] for job in r.json()["jobs"]}
        self.assertIn(intern.id, ids)


if __name__ == "__main__":
    unittest.main()
