"""Smoke tests for public job board overview."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, engine
from app.main import app


class JobBoardOverviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_public_overview_returns_kpis(self) -> None:
        r = self.client.get("/api/jobs/overview")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        for key in (
            "totalJobs",
            "activeJobs",
            "loadedToday",
            "loadedLast24Hours",
            "loadedLast7Days",
            "profileBreakdown",
            "sourceBreakdown",
        ):
            self.assertIn(key, data)


if __name__ == "__main__":
    unittest.main()
