"""add project_step_completions table

Revision ID: 20260314_05
Revises: 20260314_04
Create Date: 2026-03-14
"""
from alembic import op
import sqlalchemy as sa

revision = "20260314_05"
down_revision = "20260314_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "project_step_completions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("project_slug", sa.String(120), nullable=False),
        sa.Column("step_id", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "project_slug", "step_id", name="uq_psc_user_project_step"),
    )
    op.create_index("ix_psc_user_project", "project_step_completions", ["user_id", "project_slug"])


def downgrade() -> None:
    op.drop_index("ix_psc_user_project", table_name="project_step_completions")
    op.drop_table("project_step_completions")
