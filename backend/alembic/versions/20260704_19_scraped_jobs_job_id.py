"""Add job_id to scraped_jobs and backfill existing rows.

job_id format: CQJ-YYYYMMDD-NNNN  (e.g. CQJ-20260704-0001)
  - YYYYMMDD is taken from the row's created_at date (UTC)
  - NNNN is a sequential counter within that calendar day, zero-padded to 4 digits

Rules:
  - Column is nullable on add; backfill assigns all existing rows; unique constraint added after.
  - Existing rows are ordered by created_at ASC so earlier jobs get lower numbers.
  - New rows assigned job_id by job_store.save_scraped_jobs before insert.
  - The stored primary key (id) is never changed.

Revision ID: 20260704_19
Revises: 20260626_18
Create Date: 2026-07-04 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


revision = "20260704_19"
down_revision = "20260626_18"
branch_labels = None
depends_on = None


def _generate_job_id(date_str: str, seq: int) -> str:
    """CQJ-YYYYMMDD-NNNN"""
    return f"CQJ-{date_str}-{seq:04d}"


def upgrade() -> None:
    # 1. Add nullable column (SQLite requires nullable for ADD COLUMN)
    with op.batch_alter_table("scraped_jobs", schema=None) as batch_op:
        batch_op.add_column(sa.Column("job_id", sa.String(length=32), nullable=True))

    # 2. Python backfill — assign job_ids ordered by created_at within each date
    conn = op.get_bind()
    rows = conn.execute(
        text("SELECT id, created_at FROM scraped_jobs ORDER BY created_at ASC")
    ).fetchall()

    # Track per-date sequence counters
    date_counters: dict[str, int] = {}
    updates: list[tuple[str, str]] = []

    for row_id, created_at_raw in rows:
        # Parse the date portion — created_at may be a datetime or string
        if created_at_raw is None:
            date_str = "19700101"
        elif isinstance(created_at_raw, str):
            date_str = created_at_raw[:10].replace("-", "")
        else:
            date_str = created_at_raw.strftime("%Y%m%d")

        date_counters[date_str] = date_counters.get(date_str, 0) + 1
        job_id = _generate_job_id(date_str, date_counters[date_str])
        updates.append((job_id, row_id))

    for job_id, row_id in updates:
        conn.execute(
            text("UPDATE scraped_jobs SET job_id = :job_id WHERE id = :id"),
            {"job_id": job_id, "id": row_id},
        )

    # 3. Add unique index after backfill (batch mode for SQLite compat)
    with op.batch_alter_table("scraped_jobs", schema=None) as batch_op:
        batch_op.create_unique_constraint("uq_scraped_jobs_job_id", ["job_id"])
        batch_op.create_index("ix_scraped_jobs_job_id", ["job_id"])


def downgrade() -> None:
    with op.batch_alter_table("scraped_jobs", schema=None) as batch_op:
        batch_op.drop_index("ix_scraped_jobs_job_id")
        batch_op.drop_constraint("uq_scraped_jobs_job_id", type_="unique")
        batch_op.drop_column("job_id")
