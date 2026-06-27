"""Phase 24B: job digest preview, test, dry_run, and live-block tests."""

from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

os.environ.setdefault("ADMIN_JOB_KEY", "test-jobs-admin-key")

from app.core.config import settings
from app.main import app


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


if __name__ == "__main__":
    unittest.main()
