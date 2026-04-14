"""Rebuild resumes table with expanded columns for inline builder.

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
        sa.Column("role_id", sa.Integer, sa.ForeignKey("roles.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False, server_default="Untitled Resume"),
        sa.Column("template", sa.String(50), nullable=False, server_default="modern"),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("summary", sa.Text, nullable=False, server_default=""),
        sa.Column("skills", sa.Text, nullable=False, server_default="[]"),
        sa.Column("experience", sa.Text, nullable=False, server_default="[]"),
        sa.Column("education", sa.Text, nullable=False, server_default="[]"),
        sa.Column("projects", sa.Text, nullable=False, server_default="[]"),
        sa.Column("certifications", sa.Text, nullable=False, server_default="[]"),
        sa.Column("ats_score", sa.Integer, nullable=False, server_default="0"),
        sa.Column("pdf_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("resumes")
