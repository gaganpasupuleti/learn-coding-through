"""Regression: batch scraped-job inserts must not reuse the same public job_id."""

from __future__ import annotations

import unittest
from datetime import datetime
from unittest.mock import MagicMock

from app.services.job_store import _format_job_id, _next_job_id_seq, save_scraped_jobs


class JobStoreJobIdTests(unittest.TestCase):
    def test_format_job_id(self) -> None:
        self.assertEqual(_format_job_id("20260707", 1), "CQJ-20260707-0001")
        self.assertEqual(_format_job_id("20260707", 59), "CQJ-20260707-0059")

    def test_next_job_id_seq_from_existing_rows(self) -> None:
        db = MagicMock()
        db.query.return_value.filter.return_value.all.return_value = [
            ("CQJ-20260707-0003",),
            ("CQJ-20260707-0001",),
        ]
        self.assertEqual(_next_job_id_seq(db, "20260707"), 4)

    def test_save_scraped_jobs_assigns_unique_job_ids_in_one_batch(self) -> None:
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        db.query.return_value.filter.return_value.all.return_value = []

        jobs = [
            {
                "id": f"hash-{i}",
                "source": "indeed",
                "title": f"Role {i}",
                "jobUrl": f"https://example.com/jobs/{i}",
                "createdAt": datetime(2026, 7, 7, 12, 0, 0),
            }
            for i in range(3)
        ]

        saved, skipped = save_scraped_jobs(db, jobs, profile_key="entry_level_india")

        self.assertEqual(saved, 3)
        self.assertEqual(skipped, 0)
        added = [call.args[0] for call in db.add.call_args_list]
        job_ids = [row.job_id for row in added]
        self.assertEqual(
            job_ids,
            ["CQJ-20260707-0001", "CQJ-20260707-0002", "CQJ-20260707-0003"],
        )
        db.commit.assert_called_once()


if __name__ == "__main__":
    unittest.main()
