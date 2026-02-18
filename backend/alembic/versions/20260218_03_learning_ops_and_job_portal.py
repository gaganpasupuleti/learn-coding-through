"""add learning ops and job portal tables

Revision ID: 20260218_03
Revises: 20260217_02
Create Date: 2026-02-18 00:00:00

"""

from typing import Sequence, Union

import alembic.op as op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "20260218_03"
down_revision: Union[str, Sequence[str], None] = "20260217_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _create_enum_if_missing(enum_name: str, values: list[str]) -> None:
    values_sql = ", ".join([f"'{value}'" for value in values])
    op.execute(
        sa.text(
            f"""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name.lower()}') THEN
                    CREATE TYPE {enum_name.lower()} AS ENUM ({values_sql});
                END IF;
            END$$;
            """
        )
    )


def _column_names(inspector: sa.Inspector, table_name: str) -> set[str]:
    return {col["name"] for col in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    _create_enum_if_missing("batchmode", ["ONLINE", "HYBRID"])
    _create_enum_if_missing("enrollmentrole", ["STUDENT", "FACULTY"])
    _create_enum_if_missing("projectworkstatus", ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "REVIEWED"])
    _create_enum_if_missing("jobpoststatus", ["OPEN", "CLOSED"])
    _create_enum_if_missing("jobapplicationstatus", ["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"])

    if "learning_batches" not in tables:
        op.create_table(
            "learning_batches",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=180), nullable=False),
            sa.Column("track", sa.String(length=180), nullable=False),
            sa.Column("days", sa.String(length=80), nullable=False),
            sa.Column("time_ist", sa.String(length=80), nullable=False),
            sa.Column("mode", postgresql.ENUM("ONLINE", "HYBRID", name="batchmode", create_type=False), nullable=False),
            sa.Column("mentor_user_id", sa.Integer(), nullable=True),
            sa.Column("start_date", sa.Date(), nullable=False),
            sa.Column("seats_total", sa.Integer(), nullable=False),
            sa.Column("seats_filled", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["mentor_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_learning_batches_start_date", "learning_batches", ["start_date"], unique=False)
        op.create_index("ix_learning_batches_track_mode", "learning_batches", ["track", "mode"], unique=False)

    tables = set(inspector.get_table_names())

    if "batch_enrollments" not in tables:
        op.create_table(
            "batch_enrollments",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("batch_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("enrollment_role", postgresql.ENUM("STUDENT", "FACULTY", name="enrollmentrole", create_type=False), nullable=False),
            sa.Column("attendance_pct", sa.Integer(), nullable=False),
            sa.Column("college_info", sa.String(length=255), nullable=True),
            sa.Column("year_or_grad", sa.String(length=80), nullable=True),
            sa.Column("project_title", sa.String(length=255), nullable=True),
            sa.Column(
                "project_status",
                postgresql.ENUM("NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "REVIEWED", name="projectworkstatus", create_type=False),
                nullable=False,
            ),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["batch_id"], ["learning_batches.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("batch_id", "user_id", name="uq_batch_enrollments_batch_user"),
        )
        op.create_index("ix_batch_enrollments_batch_role", "batch_enrollments", ["batch_id", "enrollment_role"], unique=False)

    if "job_posts" not in tables:
        op.create_table(
            "job_posts",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=200), nullable=False),
            sa.Column("company_name", sa.String(length=180), nullable=False),
            sa.Column("location", sa.String(length=120), nullable=False),
            sa.Column("employment_type", sa.String(length=80), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("status", postgresql.ENUM("OPEN", "CLOSED", name="jobpoststatus", create_type=False), nullable=False),
            sa.Column("eligible_batch_id", sa.Integer(), nullable=True),
            sa.Column("created_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["eligible_batch_id"], ["learning_batches.id"]),
            sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_job_posts_status_created", "job_posts", ["status", "created_at"], unique=False)
        op.create_index("ix_job_posts_batch", "job_posts", ["eligible_batch_id"], unique=False)

    if "job_applications" not in tables:
        op.create_table(
            "job_applications",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("job_post_id", sa.Integer(), nullable=False),
            sa.Column("student_user_id", sa.Integer(), nullable=False),
            sa.Column("status", postgresql.ENUM("APPLIED", "SHORTLISTED", "REJECTED", "HIRED", name="jobapplicationstatus", create_type=False), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["job_post_id"], ["job_posts.id"]),
            sa.ForeignKeyConstraint(["student_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("job_post_id", "student_user_id", name="uq_job_application_job_student"),
        )
        op.create_index("ix_job_applications_status", "job_applications", ["status"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "job_applications" in tables:
        op.drop_table("job_applications")
    if "job_posts" in tables:
        op.drop_table("job_posts")
    if "batch_enrollments" in tables:
        op.drop_table("batch_enrollments")
    if "learning_batches" in tables:
        op.drop_table("learning_batches")

    op.execute(sa.text("DROP TYPE IF EXISTS jobapplicationstatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS jobpoststatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS projectworkstatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS enrollmentrole"))
    op.execute(sa.text("DROP TYPE IF EXISTS batchmode"))
