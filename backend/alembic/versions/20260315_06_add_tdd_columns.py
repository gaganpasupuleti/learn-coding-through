"""add TDD columns to project_catalog_steps and project_step_completions

Revision ID: 20260315_06
Revises: 20260314_05
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_06"
down_revision = "20260314_05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── project_catalog_steps – TDD fields ───────────────────────────────────
    op.add_column("project_catalog_steps", sa.Column("slug", sa.String(120), nullable=True))
    op.add_column("project_catalog_steps", sa.Column("callable_name", sa.String(120), nullable=True))
    op.add_column("project_catalog_steps", sa.Column("initial_code", sa.Text(), nullable=True))
    op.add_column("project_catalog_steps", sa.Column("test_cases", sa.Text(), nullable=True))

    # ── project_step_completions – richer completion record ──────────────────
    op.add_column("project_step_completions", sa.Column("code_snapshot", sa.Text(), nullable=True))
    op.add_column("project_step_completions", sa.Column("passed", sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column("project_step_completions", "passed")
    op.drop_column("project_step_completions", "code_snapshot")
    op.drop_column("project_catalog_steps", "test_cases")
    op.drop_column("project_catalog_steps", "initial_code")
    op.drop_column("project_catalog_steps", "callable_name")
    op.drop_column("project_catalog_steps", "slug")
