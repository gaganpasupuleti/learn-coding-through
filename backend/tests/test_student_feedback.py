"""Student feedback submit and admin review."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.main import _ensure_user_password_setup_column, app
from app.models.models import RegistrationWaitlist, StudentFeedback, User, UserRole


class StudentFeedbackTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        _ensure_user_password_setup_column()
        cls.client = TestClient(app)

    def tearDown(self) -> None:
        db = SessionLocal()
        try:
            emails = ["fb-student-%@example.com", "fb-admin-%@example.com"]
            uids = [u.id for u in db.query(User).filter(User.email.like("fb-%@example.com")).all()]
            if uids:
                db.query(StudentFeedback).filter(StudentFeedback.user_id.in_(uids)).delete(
                    synchronize_session=False,
                )
            db.query(User).filter(User.email.like("fb-%@example.com")).delete(synchronize_session=False)
            db.query(RegistrationWaitlist).filter(
                RegistrationWaitlist.email.like("fb-%@example.com"),
            ).delete(synchronize_session=False)
            db.commit()
        finally:
            db.close()

    def _register_student(self, email: str) -> str:
        db = SessionLocal()
        try:
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == email).delete(
                synchronize_session=False,
            )
            db.add(
                RegistrationWaitlist(
                    email=email,
                    full_name="Feedback Student",
                    source="test",
                    status="approved",
                ),
            )
            db.commit()
        finally:
            db.close()

        reg = self.client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": "TestPass123!", "full_name": "Feedback Student"},
        )
        self.assertIn(reg.status_code, (200, 201), reg.text)
        login = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "TestPass123!"},
        )
        self.assertEqual(login.status_code, 200, login.text)
        return login.json()["access_token"]

    def _ensure_admin(self, email: str) -> str:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    full_name="Feedback Admin",
                    password_hash=get_password_hash("AdminPass123!"),
                    role=UserRole.ADMIN,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            elif user.role not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
                user.role = UserRole.ADMIN
                db.commit()
        finally:
            db.close()

        login = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "AdminPass123!"},
        )
        self.assertEqual(login.status_code, 200, login.text)
        return login.json()["access_token"]

    def test_student_submit_and_admin_review(self) -> None:
        student_token = self._register_student("fb-student-1@example.com")
        admin_token = self._ensure_admin("fb-admin-1@example.com")

        create = self.client.post(
            "/api/v1/feedback",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"category": "concern", "message": "I need help with my schedule this week."},
        )
        self.assertEqual(create.status_code, 201, create.text)
        feedback_id = create.json()["id"]

        pending = self.client.get(
            "/api/v1/admin/feedback?status=pending",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        self.assertEqual(pending.status_code, 200, pending.text)
        ids = [row["id"] for row in pending.json()]
        self.assertIn(feedback_id, ids)

        review = self.client.patch(
            f"/api/v1/admin/feedback/{feedback_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "reviewed", "admin_notes": "Will follow up by email."},
        )
        self.assertEqual(review.status_code, 200, review.text)
        self.assertEqual(review.json()["status"], "reviewed")
        self.assertEqual(review.json()["admin_notes"], "Will follow up by email.")


if __name__ == "__main__":
    unittest.main()
