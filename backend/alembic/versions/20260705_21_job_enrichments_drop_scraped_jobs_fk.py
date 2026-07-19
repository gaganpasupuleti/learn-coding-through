"""Drop scraped_jobs FK on job_enrichments.job_id for manual import with warning-only job IDs.

Revision ID: 20260705_21
Revises: 20260705_20
Create Date: 2026-07-05 12:00:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260705_21"
down_revision = "20260705_20"
branch_labels = None
depends_on = None

_JOB_ENRICHMENT_INDEXES = (
    "ix_job_enrichments_actual_role",
    "ix_job_enrichments_role_level",
    "ix_job_enrichments_approved_status",
    "ix_job_enrichments_quiz_pack_id",
)


def _create_job_enrichments_table(include_scraped_jobs_fk: bool) -> None:
    fk_constraints = [
        sa.ForeignKeyConstraint(["actual_role_id"], ["job_roles.role_id"]),
        sa.ForeignKeyConstraint(["role_level_id"], ["job_role_levels.role_level_id"]),
        sa.ForeignKeyConstraint(["quiz_pack_id"], ["quiz_packs.quiz_pack_id"]),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"]),
    ]
    if include_scraped_jobs_fk:
        fk_constraints.insert(0, sa.ForeignKeyConstraint(["job_id"], ["scraped_jobs.job_id"]))

    op.create_table(
        "job_enrichments",
        sa.Column("job_id", sa.String(length=32), nullable=False),
        sa.Column("actual_role_id", sa.String(length=64), nullable=False),
        sa.Column("actual_role_name", sa.String(length=120), nullable=False),
        sa.Column("role_level_id", sa.String(length=80), nullable=False),
        sa.Column("experience_level", sa.String(length=32), nullable=False),
        sa.Column(
            "job_live_status",
            sa.String(length=16),
            nullable=False,
            server_default="UNKNOWN",
        ),
        sa.Column(
            "jd_fetch_status",
            sa.String(length=16),
            nullable=False,
            server_default="UNKNOWN",
        ),
        sa.Column("jd_summary", sa.Text(), nullable=True),
        sa.Column("required_skills", sa.JSON(), nullable=True),
        sa.Column("good_to_have_skills", sa.JSON(), nullable=True),
        sa.Column("tools", sa.JSON(), nullable=True),
        sa.Column("programming_languages", sa.JSON(), nullable=True),
        sa.Column("databases", sa.JSON(), nullable=True),
        sa.Column("frameworks", sa.JSON(), nullable=True),
        sa.Column("student_preparation_topics", sa.JSON(), nullable=True),
        sa.Column("quiz_pack_id", sa.String(length=80), nullable=True),
        sa.Column("mapping_confidence", sa.Numeric(4, 3), nullable=True),
        sa.Column(
            "manual_review_needed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "approved_status",
            sa.String(length=20),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        *fk_constraints,
        sa.PrimaryKeyConstraint("job_id"),
    )
    op.create_index("ix_job_enrichments_actual_role", "job_enrichments", ["actual_role_id"], unique=False)
    op.create_index("ix_job_enrichments_role_level", "job_enrichments", ["role_level_id"], unique=False)
    op.create_index(
        "ix_job_enrichments_approved_status",
        "job_enrichments",
        ["approved_status"],
        unique=False,
    )
    op.create_index("ix_job_enrichments_quiz_pack_id", "job_enrichments", ["quiz_pack_id"], unique=False)


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        for index_name in _JOB_ENRICHMENT_INDEXES:
            op.drop_index(index_name, table_name="job_enrichments")
        op.rename_table("job_enrichments", "job_enrichments_old")
        _create_job_enrichments_table(include_scraped_jobs_fk=False)
        op.execute(
            """
            INSERT INTO job_enrichments (
                job_id, actual_role_id, actual_role_name, role_level_id, experience_level,
                job_live_status, jd_fetch_status, jd_summary, required_skills, good_to_have_skills,
                tools, programming_languages, databases, frameworks, student_preparation_topics,
                quiz_pack_id, mapping_confidence, manual_review_needed, approved_status,
                approved_by, approved_at, created_at, updated_at
            )
            SELECT
                job_id, actual_role_id, actual_role_name, role_level_id, experience_level,
                job_live_status, jd_fetch_status, jd_summary, required_skills, good_to_have_skills,
                tools, programming_languages, databases, frameworks, student_preparation_topics,
                quiz_pack_id, mapping_confidence, manual_review_needed, approved_status,
                approved_by, approved_at, created_at, updated_at
            FROM job_enrichments_old
            """
        )
        op.drop_table("job_enrichments_old")
    else:
        op.drop_constraint("job_enrichments_job_id_fkey", "job_enrichments", type_="foreignkey")


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        for index_name in _JOB_ENRICHMENT_INDEXES:
            op.drop_index(index_name, table_name="job_enrichments")
        op.rename_table("job_enrichments", "job_enrichments_old")
        _create_job_enrichments_table(include_scraped_jobs_fk=True)
        op.execute(
            """
            INSERT INTO job_enrichments (
                job_id, actual_role_id, actual_role_name, role_level_id, experience_level,
                job_live_status, jd_fetch_status, jd_summary, required_skills, good_to_have_skills,
                tools, programming_languages, databases, frameworks, student_preparation_topics,
                quiz_pack_id, mapping_confidence, manual_review_needed, approved_status,
                approved_by, approved_at, created_at, updated_at
            )
            SELECT
                job_id, actual_role_id, actual_role_name, role_level_id, experience_level,
                job_live_status, jd_fetch_status, jd_summary, required_skills, good_to_have_skills,
                tools, programming_languages, databases, frameworks, student_preparation_topics,
                quiz_pack_id, mapping_confidence, manual_review_needed, approved_status,
                approved_by, approved_at, created_at, updated_at
            FROM job_enrichments_old
            WHERE job_id IN (SELECT job_id FROM scraped_jobs)
            """
        )
        op.drop_table("job_enrichments_old")
    else:
        op.create_foreign_key(
            "job_enrichments_job_id_fkey",
            "job_enrichments",
            "scraped_jobs",
            ["job_id"],
            ["job_id"],
        )
