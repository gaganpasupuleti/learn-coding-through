"""GET /api/v1/schedule/calendar aggregation."""

from __future__ import annotations

import sys
import unittest
from datetime import date, time, timedelta
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
    ClassSession,
    ClassSessionStatus,
    EnrollmentRole,
    LearningBatch,
    RegistrationWaitlist,
    Role,
    Stage,
    User,
)


class ScheduleCalendarTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        _ensure_user_password_setup_column()
        cls.client = TestClient(app)

    def tearDown(self) -> None:
        db = SessionLocal()
        try:
            uids = [
                u.id
                for u in db.query(User).filter(User.email.like("cal-test-%@example.com")).all()
            ]
            batch_ids = [
                b.id
                for b in db.query(LearningBatch).filter(LearningBatch.name.like("cal-test-batch%")).all()
            ]
            if batch_ids:
                db.query(ClassSession).filter(ClassSession.batch_id.in_(batch_ids)).delete(
                    synchronize_session=False,
                )
            if uids:
                db.query(BatchEnrollment).filter(BatchEnrollment.user_id.in_(uids)).delete(
                    synchronize_session=False,
                )
            db.query(LearningBatch).filter(LearningBatch.name.like("cal-test-batch%")).delete(
                synchronize_session=False,
            )
            db.query(User).filter(User.email.like("cal-test-%@example.com")).delete(
                synchronize_session=False,
            )
            db.query(RegistrationWaitlist).filter(
                RegistrationWaitlist.email.like("cal-test-%@example.com"),
            ).delete(synchronize_session=False)
            db.commit()
        finally:
            db.close()

    def _token_for(self, email: str) -> str:
        db = SessionLocal()
        try:
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == email).delete(
                synchronize_session=False,
            )
            db.add(
                RegistrationWaitlist(
                    email=email,
                    full_name="Calendar Test",
                    source="test",
                    status="approved",
                ),
            )
            db.commit()
        finally:
            db.close()

        reg = self.client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": "TestPass123!", "full_name": "Calendar Test"},
        )
        self.assertEqual(reg.status_code, 201, reg.text)
        login = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "TestPass123!"},
        )
        self.assertEqual(login.status_code, 200, login.text)
        return login.json()["access_token"]

    def test_calendar_returns_class_in_range(self) -> None:
        email = "cal-test-1@example.com"
        token = self._token_for(email)
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            assert user is not None
            role = db.query(Role).first()
            if role:
                user.selected_role_id = role.id
            batch = LearningBatch(
                name="cal-test-batch-1",
                mode=BatchMode.ONLINE,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=90),
            )
            db.add(batch)
            db.flush()
            db.add(
                BatchEnrollment(
                    user_id=user.id,
                    batch_id=batch.id,
                    enrollment_role=EnrollmentRole.STUDENT,
                ),
            )
            session_date = date.today() + timedelta(days=1)
            db.add(
                ClassSession(
                    batch_id=batch.id,
                    title="Calendar Smoke Class",
                    topic="Topics",
                    session_date=session_date,
                    start_time=time(10, 0),
                    end_time=time(12, 0),
                    status=ClassSessionStatus.SCHEDULED,
                ),
            )
            db.commit()
            start = session_date.isoformat()
            end = session_date.isoformat()
        finally:
            db.close()

        res = self.client.get(
            f"/api/v1/schedule/calendar?start_date={start}&end_date={end}",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200, res.text)
        body = res.json()
        self.assertEqual(body["start_date"], start)
        types = {e["event_type"] for e in body["events"]}
        self.assertIn("class", types)
        titles = [e["title"] for e in body["events"]]
        self.assertIn("Calendar Smoke Class", titles)


if __name__ == "__main__":
    unittest.main()
