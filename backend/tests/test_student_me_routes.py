"""Student-facing GET /enrollment/me."""

from __future__ import annotations

import sys
import unittest
from datetime import date
from pathlib import Path

from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, SessionLocal, engine
from app.main import _ensure_user_password_setup_column, app
from app.models.models import (
    BatchEnrollment,
    BatchMode,
    EnrollmentRole,
    LearningBatch,
    RegistrationWaitlist,
    User,
)


class StudentMeRoutesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        _ensure_user_password_setup_column()
        cls.client = TestClient(app)

    def tearDown(self) -> None:
        db = SessionLocal()
        try:
            uids = [u.id for u in db.query(User).filter(User.email.like("smoke-kpi-%@example.com")).all()]
            if uids:
                db.query(BatchEnrollment).filter(BatchEnrollment.user_id.in_(uids)).delete(synchronize_session=False)
            db.query(LearningBatch).filter(LearningBatch.name.like("smoke-kpi-batch%")).delete(
                synchronize_session=False,
            )
            db.query(User).filter(User.email.like("smoke-kpi-%@example.com")).delete(synchronize_session=False)
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email.like("smoke-kpi-%@example.com")).delete(
                synchronize_session=False,
            )
            db.commit()
        finally:
            db.close()

    def _register_and_token(self, email: str) -> str:
        db = SessionLocal()
        try:
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == email).delete(
                synchronize_session=False,
            )
            db.add(
                RegistrationWaitlist(
                    email=email,
                    full_name="Smoke KPI Student",
                    source="test",
                    status="approved",
                ),
            )
            db.commit()
        finally:
            db.close()

        reg = self.client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Smoke KPI Student",
                "email": email,
                "password": "StrongPass@123",
            },
        )
        self.assertEqual(reg.status_code, 200, reg.text)

        login = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "StrongPass@123"},
        )
        self.assertEqual(login.status_code, 200, login.text)
        return login.json()["access_token"]

    def test_enrollment_me_empty(self) -> None:
        email = "smoke-kpi-enroll-empty@example.com"
        token = self._register_and_token(email)
        res = self.client.get("/api/v1/enrollment/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertIsNone(data["attendance_pct"])
        self.assertEqual(data["batch_names"], [])

    def test_enrollment_me_averages_attendance(self) -> None:
        email = "smoke-kpi-enroll-avg@example.com"
        token = self._register_and_token(email)

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).one()
            b1 = LearningBatch(
                name="smoke-kpi-batch-a",
                track="fullstack",
                days="weekdays",
                time_ist="10:00",
                mode=BatchMode.ONLINE,
                start_date=date.today(),
            )
            b2 = LearningBatch(
                name="smoke-kpi-batch-b",
                track="fullstack",
                days="weekdays",
                time_ist="10:00",
                mode=BatchMode.ONLINE,
                start_date=date.today(),
            )
            db.add_all([b1, b2])
            db.flush()
            db.add_all(
                [
                    BatchEnrollment(
                        batch_id=b1.id,
                        user_id=user.id,
                        enrollment_role=EnrollmentRole.STUDENT,
                        attendance_pct=70,
                    ),
                    BatchEnrollment(
                        batch_id=b2.id,
                        user_id=user.id,
                        enrollment_role=EnrollmentRole.STUDENT,
                        attendance_pct=90,
                    ),
                ],
            )
            db.commit()
        finally:
            db.close()

        res = self.client.get("/api/v1/enrollment/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertEqual(data["attendance_pct"], 80)
        self.assertEqual(sorted(data["batch_names"]), ["smoke-kpi-batch-a", "smoke-kpi-batch-b"])


if __name__ == "__main__":
    unittest.main()
