"""Admin job post tier quota (402 QuotaExceeded)."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, SessionLocal, engine
from app.core.security import create_access_token, get_password_hash
from app.main import _ensure_user_password_setup_column, app
from app.models.models import JobPost, User, UserRole


class AdminJobQuotaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        _ensure_user_password_setup_column()
        cls.client = TestClient(app)

    def tearDown(self) -> None:
        db = SessionLocal()
        try:
            db.query(JobPost).filter(JobPost.title.like("quota-test-%")).delete(synchronize_session=False)
            db.query(User).filter(User.email == "quota-test-admin@example.com").delete(synchronize_session=False)
            db.commit()
        finally:
            db.close()

    def _make_admin(self, *, role: UserRole = UserRole.ADMIN) -> tuple[User, str]:
        db = SessionLocal()
        try:
            user = User(
                email="quota-test-admin@example.com",
                full_name="Quota Admin",
                password_hash=get_password_hash("x"),
                role=role,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            token = create_access_token(str(user.id))
            return user, token
        finally:
            db.close()

    def test_create_job_402_when_over_free_cap(self) -> None:
        _, token = self._make_admin()
        headers = {"Authorization": f"Bearer {token}"}
        with patch("app.api.v1.admin.MAX_FREE_TIER_JOBS", 1):
            r1 = self.client.post(
                "/api/v1/admin/jobs",
                headers=headers,
                json={
                    "title": "quota-test-first",
                    "company_name": "Co",
                    "location": "Here",
                    "employment_type": "Full-time",
                    "description": "d",
                    "eligible_batch_id": None,
                },
            )
            self.assertEqual(r1.status_code, 200, r1.text)
            r2 = self.client.post(
                "/api/v1/admin/jobs",
                headers=headers,
                json={
                    "title": "quota-test-second",
                    "company_name": "Co",
                    "location": "Here",
                    "employment_type": "Full-time",
                    "description": "d",
                    "eligible_batch_id": None,
                },
            )
        self.assertEqual(r2.status_code, 402)
        body = r2.json()
        self.assertEqual(body["detail"]["error"], "QuotaExceeded")
        self.assertTrue(body["detail"]["upgrade_required"])

    def test_super_admin_unlimited(self) -> None:
        _, token = self._make_admin(role=UserRole.SUPER_ADMIN)
        headers = {"Authorization": f"Bearer {token}"}
        with patch("app.api.v1.admin.MAX_FREE_TIER_JOBS", 1):
            for i in range(2):
                r = self.client.post(
                    "/api/v1/admin/jobs",
                    headers=headers,
                    json={
                        "title": f"quota-test-sa-{i}",
                        "company_name": "Co",
                        "location": "Here",
                        "employment_type": "Full-time",
                        "description": "d",
                        "eligible_batch_id": None,
                    },
                )
                self.assertEqual(r.status_code, 200, r.text)


if __name__ == "__main__":
    unittest.main()
