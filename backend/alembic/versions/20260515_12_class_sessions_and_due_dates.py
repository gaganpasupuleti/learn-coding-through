"""class_sessions table and due_date on quizzes/stages

Revision ID: 20260515_12
Revises: 20260509_11
Create Date: 2026-05-15 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260515_12"
down_revision = "20260509_11"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "class_sessions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("batch_id", sa.Integer, sa.ForeignKey("learning_batches.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("topic", sa.String(300), nullable=True),
        sa.Column("session_date", sa.Date, nullable=False),
        sa.Column("start_time", sa.Time, nullable=False),
        sa.Column("end_time", sa.Time, nullable=False),
        sa.Column(
            "status",
            sa.Enum("scheduled", "completed", "cancelled", name="classsessionstatus"),
            nullable=False,
            server_default="scheduled",
        ),
        sa.Column("created_by_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_class_sessions_batch_date", "class_sessions", ["batch_id", "session_date"])
    op.create_index("ix_class_sessions_status_date", "class_sessions", ["status", "session_date"])

    op.add_column("quizzes", sa.Column("due_date", sa.Date, nullable=True))
    op.add_column("stages", sa.Column("due_date", sa.Date, nullable=True))


def downgrade() -> None:
    op.drop_column("stages", "due_date")
    op.drop_column("quizzes", "due_date")
    op.drop_index("ix_class_sessions_status_date", table_name="class_sessions")
    op.drop_index("ix_class_sessions_batch_date", table_name="class_sessions")
    op.drop_table("class_sessions")
    op.execute("DROP TYPE IF EXISTS classsessionstatus")
