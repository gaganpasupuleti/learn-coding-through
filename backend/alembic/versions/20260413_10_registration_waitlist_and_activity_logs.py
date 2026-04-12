"""Add registration waitlist and user activity logs.

Revision ID: 20260413_10
Revises: 20260405_09
Create Date: 2026-04-13 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260413_10"
down_revision = "20260405_09"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "registration_waitlist",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("first_attempted_at", sa.DateTime(), nullable=False),
        sa.Column("last_attempted_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_registration_waitlist_email", "registration_waitlist", ["email"], unique=True)
    op.create_index(
        "ix_registration_waitlist_status_created",
        "registration_waitlist",
        ["status", "first_attempted_at"],
        unique=False,
    )

    op.create_table(
        "user_activity_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=40), nullable=False),
        sa.Column("route", sa.String(length=300), nullable=False),
        sa.Column("method", sa.String(length=16), nullable=True),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_user_activity_logs_user_occurred",
        "user_activity_logs",
        ["user_id", "occurred_at"],
        unique=False,
    )
    op.create_index(
        "ix_user_activity_logs_event_occurred",
        "user_activity_logs",
        ["event_type", "occurred_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_user_activity_logs_event_occurred", table_name="user_activity_logs")
    op.drop_index("ix_user_activity_logs_user_occurred", table_name="user_activity_logs")
    op.drop_table("user_activity_logs")

    op.drop_index("ix_registration_waitlist_status_created", table_name="registration_waitlist")
    op.drop_index("ix_registration_waitlist_email", table_name="registration_waitlist")
    op.drop_table("registration_waitlist")
