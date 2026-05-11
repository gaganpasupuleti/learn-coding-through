"""Auth smoke tests for register/login/google-login and password reset flows."""

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
from app.core.security import create_password_reset_token
from app.main import _ensure_user_password_setup_column, app
from app.models.models import RegistrationWaitlist, User


class AuthSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)
        _ensure_user_password_setup_column()
        cls.client = TestClient(app)

    def test_auth_public_config(self) -> None:
        res = self.client.get("/api/v1/auth/config")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("google_auth_enabled", data)
        self.assertIsInstance(data["google_auth_enabled"], bool)
        self.assertIn("google_client_id", data)

    def tearDown(self) -> None:
        # Keep tests idempotent by removing only test users.
        db = SessionLocal()
        try:
            db.query(User).filter(User.email.like("smoke-auth-%@example.com")).delete(synchronize_session=False)
            db.query(User).filter(User.email == "smoke-google@example.com").delete(synchronize_session=False)
            db.query(RegistrationWaitlist).filter(
                RegistrationWaitlist.email.in_(
                    ["smoke-google@example.com", "smoke-auth-register@example.com", "smoke-auth-reset@example.com"]
                )
            ).delete(synchronize_session=False)
            db.commit()
        finally:
            db.close()

    def test_register_then_login(self) -> None:
        email = "smoke-auth-register@example.com"
        db = SessionLocal()
        try:
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == email).delete(synchronize_session=False)
            db.add(
                RegistrationWaitlist(
                    email=email,
                    full_name="Smoke Register",
                    source="test",
                    status="approved",
                )
            )
            db.commit()
        finally:
            db.close()

        payload = {
            "full_name": "Smoke Register",
            "email": email,
            "password": "StrongPass@123",
        }

        register_res = self.client.post("/api/v1/auth/register", json=payload)
        self.assertEqual(register_res.status_code, 200)
        self.assertEqual(register_res.json()["email"], email)

        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": payload["password"]},
        )
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("access_token", login_res.json())

    def test_google_login(self) -> None:
        db = SessionLocal()
        try:
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == "smoke-google@example.com").delete(
                synchronize_session=False
            )
            db.add(
                RegistrationWaitlist(
                    email="smoke-google@example.com",
                    full_name="Smoke Google",
                    source="test",
                    status="approved",
                )
            )
            db.commit()
        finally:
            db.close()

        with patch("app.api.v1.auth.settings.google_oauth_client_id", "google-client-id"), patch(
            "app.api.v1.auth.google_id_token.verify_oauth2_token"
        ) as mocked_verify:
            mocked_verify.return_value = {
                "email": "smoke-google@example.com",
                "sub": "google-user-123",
                "name": "Smoke Google",
                "email_verified": True,
            }

            response = self.client.post(
                "/api/v1/auth/google-login",
                json={"id_token": "fake-token"},
            )

            self.assertEqual(response.status_code, 200)
            self.assertIn("access_token", response.json())
            token = response.json()["access_token"]
            me = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
            self.assertEqual(me.status_code, 200)
            self.assertTrue(me.json().get("password_setup_required"))

            set_pw = self.client.post(
                "/api/v1/auth/complete-password-setup",
                headers={"Authorization": f"Bearer {token}"},
                json={"password": "NewGooglePass@999"},
            )
            self.assertEqual(set_pw.status_code, 200)
            self.assertFalse(set_pw.json().get("password_setup_required"))

    def test_password_reset_roundtrip(self) -> None:
        email = "smoke-auth-reset@example.com"
        original_password = "OriginalPass@123"
        new_password = "UpdatedPass@123"

        db = SessionLocal()
        try:
            db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == email).delete(synchronize_session=False)
            db.add(
                RegistrationWaitlist(
                    email=email,
                    full_name="Reset User",
                    source="test",
                    status="approved",
                )
            )
            db.commit()
        finally:
            db.close()

        register_res = self.client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Reset User",
                "email": email,
                "password": original_password,
            },
        )
        self.assertEqual(register_res.status_code, 200)

        forgot_res = self.client.post("/api/v1/auth/forgot-password", json={"email": email})
        self.assertEqual(forgot_res.status_code, 200)

        reset_token = forgot_res.json().get("reset_token") or create_password_reset_token(email)
        reset_res = self.client.post(
            "/api/v1/auth/reset-password",
            json={"reset_token": reset_token, "new_password": new_password},
        )
        self.assertEqual(reset_res.status_code, 200)

        login_old = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": original_password},
        )
        self.assertEqual(login_old.status_code, 401)

        login_new = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": new_password},
        )
        self.assertEqual(login_new.status_code, 200)
        self.assertIn("access_token", login_new.json())


if __name__ == "__main__":
    unittest.main(verbosity=2)
