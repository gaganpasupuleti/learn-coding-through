"""Phase 24B/24C/24E: job digest preview, transport, and client-ready template tests."""

from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

os.environ.setdefault("ADMIN_JOB_KEY", "test-jobs-admin-key")

from app.core.config import settings
from app.main import app
from app.services.job_email import build_digest, sanitize_plain_text, validate_safe_https_url


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
        self.assertIn("summary", data)
        summary = data["summary"]
        self.assertIn("totalActiveJobs", summary)
        self.assertIn("selectedJobsCount", summary)
        self.assertIn("recentJobsCount", summary)
        self.assertIn("internships24h", summary)
        self.assertIn("freshers24h", summary)
        self.assertIsInstance(summary["internships24h"], int)
        self.assertIsInstance(summary["freshers24h"], int)

    def test_email_preview_accepts_editable_fields(self) -> None:
        r = self.client.post(
            "/api/admin/jobs/email-preview",
            headers=self.headers,
            json={
                "jobIds": [],
                "searchTerm": "data analyst",
                "location": "India",
                "subjectOverride": "Custom Subject Line",
                "introMessage": "Hello from Code Quest.",
                "maxJobs": 5,
            },
        )
        if r.status_code == 400:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertEqual(data["subject"], "Custom Subject Line")
        self.assertIn("Hello from Code Quest.", data["text"])
        self.assertLessEqual(data["jobCount"], 5)

    def test_email_preview_strips_html_injection(self) -> None:
        r = self.client.post(
            "/api/admin/jobs/email-preview",
            headers=self.headers,
            json={
                "jobIds": [],
                "searchTerm": "developer",
                "introMessage": "<script>alert(1)</script>Safe text",
                "subjectOverride": "<b>Bad</b> Subject",
            },
        )
        if r.status_code == 400:
            self.skipTest("No active jobs in test database")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertNotIn("<script>", data["html"])
        self.assertNotIn("<b>", data["subject"])
        self.assertIn("Safe text", data["text"])

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


class DigestTemplateUnitTests(unittest.TestCase):
    def test_sanitize_plain_text_strips_tags(self) -> None:
        self.assertEqual(sanitize_plain_text("<img src=x onerror=1>Hi", max_len=50), "Hi")

    def test_validate_safe_https_url_rejects_javascript(self) -> None:
        self.assertIsNone(validate_safe_https_url("javascript:alert(1)"))

    def test_build_digest_summary_fields(self) -> None:
        jobs = [
            {
                "title": "Python Dev",
                "company": "Acme",
                "location": "Bengaluru",
                "source": "indeed",
                "applyUrl": "https://example.com/1",
                "createdAt": __import__("datetime").datetime.utcnow(),
            },
        ]
        content = build_digest(jobs, total_active_jobs=100, max_jobs=1)
        self.assertEqual(content.summary.total_active_jobs, 100)
        self.assertEqual(content.summary.selected_jobs_count, 1)
        self.assertIn("Acme", content.summary.top_companies)
        self.assertIn("Code Quest", content.html)

    def _sample_jobs(self, n: int = 4) -> list[dict]:
        now = __import__("datetime").datetime.utcnow()
        return [
            {
                "title": f"Backend Engineer {i}",
                "company": f"Company {i % 2}",
                "location": "Bengaluru" if i % 2 == 0 else "Pune",
                "source": "linkedin",
                "applyUrl": f"https://example.com/{i}",
                "description": "Build APIs and services.",
                "createdAt": now,
            }
            for i in range(n)
        ]

    def test_premium_summary_carries_24h_counts(self) -> None:
        content = build_digest(
            self._sample_jobs(2),
            total_active_jobs=200,
            max_jobs=2,
            internships_24h=7,
            freshers_24h=12,
        )
        self.assertEqual(content.summary.internships_24h, 7)
        self.assertEqual(content.summary.freshers_24h, 12)
        d = content.summary.as_dict()
        self.assertEqual(d["internships24h"], 7)
        self.assertEqual(d["freshers24h"], 12)

    def test_radar_kpi_labels(self) -> None:
        content = build_digest(
            self._sample_jobs(4),
            total_active_jobs=200,
            max_jobs=4,
            internships_24h=7,
            freshers_24h=12,
        )
        h = content.html
        self.assertIn("Active Jobs", h)
        self.assertIn("Handpicked Roles", h)
        self.assertIn("Fresh This Week", h)
        self.assertIn("Internships Today", h)
        self.assertIn("Fresher Roles Today", h)
        # Old 24F labels must be gone
        self.assertNotIn("In Digest", h)
        self.assertNotIn("New This Week", h)

    def test_radar_insight_cards(self) -> None:
        content = build_digest(self._sample_jobs(4), total_active_jobs=200, max_jobs=4)
        h = content.html
        self.assertIn("Top Roles", h)
        self.assertIn("Hot Cities", h)
        self.assertIn("Hiring Companies", h)
        self.assertIn("Market insights", h)
        self.assertIn("Featured roles", h)

    def test_radar_hero_and_why_section(self) -> None:
        content = build_digest(self._sample_jobs(4), total_active_jobs=200, max_jobs=4)
        h = content.html
        self.assertIn("Jobs Radar", h)
        self.assertIn("Active jobs scanned", h)
        self.assertIn("Handpicked roles", h)
        self.assertIn("Why these roles?", h)

    def test_radar_source_split_hidden(self) -> None:
        content = build_digest(self._sample_jobs(3), total_active_jobs=10, max_jobs=3)
        h = content.html
        self.assertNotIn("New (7d)", h)
        self.assertNotIn(">Sources<", h)
        self.assertNotIn("Sources</td>", h)
        self.assertNotIn("Source split", h)
        # source split data still present in summary payload
        self.assertIn("linkedin", content.summary.source_split)

    def test_radar_two_column_featured_with_badges(self) -> None:
        content = build_digest(self._sample_jobs(4), total_active_jobs=10, max_jobs=4)
        h = content.html
        self.assertIn("width:50%", h)
        # source badge rendered in job card
        self.assertIn("linkedin", h)

    def test_radar_featured_caps_at_eight(self) -> None:
        content = build_digest(self._sample_jobs(12), total_active_jobs=100, max_jobs=12)
        # summary still reflects all selected, but featured cards cap at 8
        self.assertEqual(content.summary.selected_jobs_count, 12)
        self.assertEqual(content.html.count("Apply &rarr;"), 8)

    def test_radar_text_fallback_readable(self) -> None:
        content = build_digest(
            self._sample_jobs(2),
            total_active_jobs=50,
            max_jobs=2,
            internships_24h=3,
            freshers_24h=5,
        )
        t = content.text
        self.assertIn("Jobs Radar", t)
        self.assertIn("Internships Today: 3", t)
        self.assertIn("Fresher Roles Today: 5", t)
        self.assertIn("Why these roles?", t)
        self.assertIn("Featured roles:", t)
        self.assertNotIn("<", t)


class BrevoUnitTests(unittest.TestCase):
    def test_send_brevo_raises_without_api_key(self) -> None:
        from app.services.email_brevo import send_brevo_email

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
