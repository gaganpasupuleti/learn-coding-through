"""Phase 24B/24C: job digest preview, test, dry_run, live-block, and Brevo transport tests."""

from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

os.environ.setdefault("ADMIN_JOB_KEY", "test-jobs-admin-key")

from app.core.config import settings
from app.main import app
from app.services.email_brevo import send_brevo_email


class JobEmailFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.headers = {"X-Admin-Key": os.environ["ADMIN_JOB_KEY"]}

    def test_email_preview_includes_job_count(self) -> None:
        r = self.client.post(
            "/api/admin/jobs/email-preview",
            headers=self.headers,
            json={"jobIds": [], "searchTerm": "python developer", "location": "India"},
        )
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertIn("subject", data)
        self.assertIn("jobCount", data)
        self.assertIsInstance(data["jobCount"], int)

    @patch("app.api.jobs.send_email", return_value=(1, []))
    def test_send_digest_test_mode(self, mock_send) -> None:
        r = self.client.post(
            "/api/admin/jobs/send-digest",
            headers=self.headers,
            json={"mode": "test", "testEmail": "admin-test@example.com", "jobIds": []},
        )
        if r.status_code == 400 and "No jobs" in r.text:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertEqual(data["mode"], "test")
        self.assertEqual(data["sentCount"], 1)
        self.assertEqual(data["recipientCount"], 1)
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args.kwargs["to_addrs"], ["admin-test@example.com"])

    def test_send_digest_dry_run_sends_zero(self) -> None:
        with patch("app.api.jobs.send_email") as mock_send:
            r = self.client.post(
                "/api/admin/jobs/send-digest",
                headers=self.headers,
                json={"mode": "dry_run", "jobIds": []},
            )
        if r.status_code == 400 and "No jobs" in r.text:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertEqual(data["mode"], "dry_run")
        self.assertEqual(data["sentCount"], 0)
        self.assertIsNotNone(data["recipientCount"])
        mock_send.assert_not_called()

    def test_send_digest_live_blocked_when_disabled(self) -> None:
        with patch.object(settings, "job_mail_enabled", False):
            r = self.client.post(
                "/api/admin/jobs/send-digest",
                headers=self.headers,
                json={"mode": "live", "jobIds": []},
            )
        self.assertEqual(r.status_code, 403, r.text)
        self.assertIn("JOB_MAIL_ENABLED", r.json()["detail"])


class BrevoEmailTransportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.headers = {"X-Admin-Key": os.environ["ADMIN_JOB_KEY"]}

    @patch("app.services.job_email.send_brevo_email", return_value=(1, []))
    @patch.object(settings, "email_provider", "brevo")
    @patch.object(settings, "brevo_api_key", "test-brevo-key")
    @patch.object(settings, "email_from_address", "sender@example.com")
    def test_brevo_test_mode_calls_provider_once(self, mock_brevo) -> None:
        r = self.client.post(
            "/api/admin/jobs/send-digest",
            headers=self.headers,
            json={"mode": "test", "testEmail": "admin-test@example.com", "jobIds": []},
        )
        if r.status_code == 400 and "No jobs" in r.text:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertEqual(data["sentCount"], 1)
        self.assertEqual(data["failedCount"], 0)
        mock_brevo.assert_called_once()
        self.assertEqual(mock_brevo.call_args.kwargs["to_addrs"], ["admin-test@example.com"])

    @patch("app.services.job_email.send_brevo_email")
    @patch.object(settings, "email_provider", "brevo")
    def test_brevo_dry_run_does_not_call_provider(self, mock_brevo) -> None:
        with patch("app.api.jobs.send_email") as mock_send:
            r = self.client.post(
                "/api/admin/jobs/send-digest",
                headers=self.headers,
                json={"mode": "dry_run", "jobIds": []},
            )
        if r.status_code == 400 and "No jobs" in r.text:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        self.assertEqual(r.json()["sentCount"], 0)
        mock_send.assert_not_called()
        mock_brevo.assert_not_called()

    @patch.object(settings, "email_provider", "brevo")
    @patch.object(settings, "brevo_api_key", None)
    @patch.object(settings, "email_from_address", "sender@example.com")
    def test_missing_brevo_api_key_returns_safe_error(self) -> None:
        r = self.client.post(
            "/api/admin/jobs/send-digest",
            headers=self.headers,
            json={"mode": "test", "testEmail": "admin-test@example.com", "jobIds": []},
        )
        if r.status_code == 400 and "No jobs" in r.text:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 503, r.text)
        detail = r.json()["detail"]
        self.assertIn("BREVO_API_KEY", detail)
        self.assertNotIn("test-brevo", detail.lower())

    @patch("app.services.job_email.send_brevo_email", return_value=(1, []))
    @patch.object(settings, "email_provider", "brevo")
    @patch.object(settings, "brevo_api_key", "test-brevo-key")
    @patch.object(settings, "email_from_address", "sender@example.com")
    def test_brevo_test_mode_single_recipient_only(self, mock_brevo) -> None:
        r = self.client.post(
            "/api/admin/jobs/send-digest",
            headers=self.headers,
            json={"mode": "test", "testEmail": "only-test@example.com", "jobIds": []},
        )
        if r.status_code == 400 and "No jobs" in r.text:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        to_addrs = mock_brevo.call_args.kwargs["to_addrs"]
        self.assertEqual(to_addrs, ["only-test@example.com"])
        self.assertEqual(len(to_addrs), 1)


class BrevoUnitTests(unittest.TestCase):
    def test_send_brevo_raises_without_api_key(self) -> None:
        with patch.object(settings, "brevo_api_key", None):
            with self.assertRaises(ValueError) as ctx:
                send_brevo_email(
                    to_addrs=["a@example.com"],
                    subject="s",
                    html_body="<p>h</p>",
                    text_body="t",
                )
        self.assertIn("BREVO_API_KEY", str(ctx.exception))
        self.assertNotIn("secret", str(ctx.exception).lower())


if __name__ == "__main__":
    unittest.main()
