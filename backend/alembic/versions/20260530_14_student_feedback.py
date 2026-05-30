"""student_feedback table

Revision ID: 20260530_14
Revises: 20260516_13
Create Date: 2026-05-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260530_14"
down_revision = "20260516_13"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "student_feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("reviewed_by_user_id", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_student_feedback_user_id", "student_feedback", ["user_id"], unique=False)
    op.create_index(
        "ix_student_feedback_status_created",
        "student_feedback",
        ["status", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_student_feedback_user_created",
        "student_feedback",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_student_feedback_user_created", table_name="student_feedback")
    op.drop_index("ix_student_feedback_status_created", table_name="student_feedback")
    op.drop_index("ix_student_feedback_user_id", table_name="student_feedback")
    op.drop_table("student_feedback")
