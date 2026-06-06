"""Add quiz catalog attempts table."""

from alembic import op
import sqlalchemy as sa

revision = "20260530_15_quiz_catalog_attempts"
down_revision = "20260530_14_student_feedback"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quiz_catalog_attempts",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("quiz_id", sa.Integer(), sa.ForeignKey("quiz_catalog.id"), nullable=False),
        sa.Column("quiz_slug", sa.String(length=120), nullable=False),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("passed", sa.Boolean(), nullable=True),
        sa.Column("time_taken_seconds", sa.Integer(), nullable=True),
        sa.Column("question_order_json", sa.Text(), nullable=False),
        sa.Column("option_orders_json", sa.Text(), nullable=True),
        sa.Column("answers_json", sa.Text(), nullable=True),
        sa.Column("wrong_answers_json", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="in_progress"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_quiz_catalog_attempts_user_id", "quiz_catalog_attempts", ["user_id"])
    op.create_index("ix_quiz_catalog_attempts_quiz_slug", "quiz_catalog_attempts", ["quiz_slug"])


def downgrade() -> None:
    op.drop_index("ix_quiz_catalog_attempts_quiz_slug", table_name="quiz_catalog_attempts")
    op.drop_index("ix_quiz_catalog_attempts_user_id", table_name="quiz_catalog_attempts")
    op.drop_table("quiz_catalog_attempts")
