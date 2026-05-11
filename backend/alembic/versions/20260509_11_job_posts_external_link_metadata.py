"""job_posts: external_apply_url and listing_metadata

Revision ID: 20260509_11
Revises: 20260413_10
Create Date: 2026-05-09 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260509_11"
down_revision = "20260413_10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("job_posts", sa.Column("external_apply_url", sa.String(length=2048), nullable=True))
    op.add_column("job_posts", sa.Column("listing_metadata", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("job_posts", "listing_metadata")
    op.drop_column("job_posts", "external_apply_url")
