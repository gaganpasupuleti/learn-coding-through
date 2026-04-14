"""Revert resumes table to original 8-column schema.

Revision ID: 20260413_11
Revises: 20260413_10
Create Date: 2026-04-13 12:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision: str = "20260413_11"
down_revision: str = "20260413_10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "resumes" in tables:
        op.drop_table("resumes")

    op.create_table(
        "resumes",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("role_id", sa.Integer, sa.ForeignKey("roles.id"), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text, nullable=False),
        sa.Column("skills", sa.Text, nullable=False),
        sa.Column("experience", sa.Text, nullable=False),
        sa.Column("ats_score", sa.Integer, nullable=False, server_default="0"),
        sa.Column("pdf_url", sa.String(500), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("resumes")
