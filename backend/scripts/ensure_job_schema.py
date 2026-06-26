#!/usr/bin/env python3
"""Add job link/profile columns to SQLite when Alembic upgrade is unavailable."""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BACKEND_DIR / "career_portal.db"

ALTERS = [
    "ALTER TABLE scraped_jobs ADD COLUMN link_status TEXT NOT NULL DEFAULT 'active'",
    "ALTER TABLE scraped_jobs ADD COLUMN link_checked_at DATETIME",
    "ALTER TABLE scraped_jobs ADD COLUMN ingest_profile TEXT",
    "ALTER TABLE job_scrape_runs ADD COLUMN source_breakdown_json TEXT",
    "ALTER TABLE job_scrape_runs ADD COLUMN run_type TEXT NOT NULL DEFAULT 'manual'",
    "ALTER TABLE job_scrape_runs ADD COLUMN profile TEXT",
    "ALTER TABLE job_scrape_runs ADD COLUMN expired_count INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE job_scrape_runs ADD COLUMN failed_link_count INTEGER NOT NULL DEFAULT 0",
]


def main() -> int:
    if not DB_PATH.exists():
        print(f"DB not found: {DB_PATH}")
        return 1
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for sql in ALTERS:
        try:
            cur.execute(sql)
            print("OK:", sql[:70])
        except sqlite3.OperationalError as exc:
            print("SKIP:", exc)
    conn.commit()
    for table in ("scraped_jobs", "job_scrape_runs"):
        cur.execute(f"PRAGMA table_info({table})")
        print(table, [row[1] for row in cur.fetchall()])
    conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
