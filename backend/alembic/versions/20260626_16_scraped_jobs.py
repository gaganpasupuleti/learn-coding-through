"""scraped_jobs table for python-jobspy listings

Revision ID: 20260626_16
Revises: 20260530_15_quiz_catalog_attempts
Create Date: 2026-06-26 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260626_16"
down_revision = "20260530_15_quiz_catalog_attempts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "scraped_jobs",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("company", sa.String(length=200), nullable=True),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.Column("job_type", sa.String(length=80), nullable=True),
        sa.Column("date_posted", sa.DateTime(), nullable=True),
        sa.Column("salary_min", sa.Numeric(12, 2), nullable=True),
        sa.Column("salary_max", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(length=8), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("job_url", sa.String(length=2048), nullable=False),
        sa.Column("apply_url", sa.String(length=2048), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source", "job_url", name="uq_scraped_jobs_source_url"),
    )
    op.create_index("ix_scraped_jobs_created", "scraped_jobs", ["created_at"], unique=False)
    op.create_index("ix_scraped_jobs_source", "scraped_jobs", ["source"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_scraped_jobs_source", table_name="scraped_jobs")
    op.drop_index("ix_scraped_jobs_created", table_name="scraped_jobs")
    op.drop_table("scraped_jobs")
