"""job link status + scrape run profile fields

Revision ID: 20260626_18
Revises: 20260626_17
Create Date: 2026-06-26 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260626_18"
down_revision = "20260626_17"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("scraped_jobs") as batch_op:
        batch_op.add_column(sa.Column("link_status", sa.String(length=32), nullable=False, server_default="active"))
        batch_op.add_column(sa.Column("link_checked_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("ingest_profile", sa.String(length=64), nullable=True))

    with op.batch_alter_table("job_scrape_runs") as batch_op:
        batch_op.add_column(sa.Column("source_breakdown_json", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("run_type", sa.String(length=32), nullable=False, server_default="manual"))
        batch_op.add_column(sa.Column("profile", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("expired_count", sa.Integer(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("failed_link_count", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    with op.batch_alter_table("job_scrape_runs") as batch_op:
        batch_op.drop_column("failed_link_count")
        batch_op.drop_column("expired_count")
        batch_op.drop_column("profile")
        batch_op.drop_column("run_type")
        batch_op.drop_column("source_breakdown_json")

    with op.batch_alter_table("scraped_jobs") as batch_op:
        batch_op.drop_column("ingest_profile")
        batch_op.drop_column("link_checked_at")
        batch_op.drop_column("link_status")
