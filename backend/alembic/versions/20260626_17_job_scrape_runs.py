"""job_scrape_runs table for scrape audit and load stats

Revision ID: 20260626_17
Revises: 20260626_16
Create Date: 2026-06-26 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260626_17"
down_revision = "20260626_16"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "job_scrape_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("search_term", sa.String(length=200), nullable=False),
        sa.Column("location", sa.String(length=120), nullable=False),
        sa.Column("sources_json", sa.Text(), nullable=False),
        sa.Column("results_wanted", sa.Integer(), nullable=False),
        sa.Column("hours_old", sa.Integer(), nullable=False),
        sa.Column("total_found", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("saved_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("skipped_duplicates", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("errors_json", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("triggered_by", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="failed"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_job_scrape_runs_started", "job_scrape_runs", ["started_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_job_scrape_runs_started", table_name="job_scrape_runs")
    op.drop_table("job_scrape_runs")
