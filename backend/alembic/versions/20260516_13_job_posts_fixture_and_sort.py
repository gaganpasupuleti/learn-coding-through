"""job_posts is_fixture and sort_order

Revision ID: 20260516_13
Revises: 20260515_12
Create Date: 2026-05-16 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260516_13"
down_revision = "20260515_12"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "job_posts",
        sa.Column("is_fixture", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "job_posts",
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_job_posts_fixture_sort", "job_posts", ["is_fixture", "sort_order"])


def downgrade() -> None:
    op.drop_index("ix_job_posts_fixture_sort", table_name="job_posts")
    op.drop_column("job_posts", "sort_order")
    op.drop_column("job_posts", "is_fixture")
