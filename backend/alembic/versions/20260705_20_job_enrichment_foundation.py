"""Job enrichment foundation tables and role taxonomy seed.

Revision ID: 20260705_20
Revises: 20260704_19
Create Date: 2026-07-05 00:00:00.000000
"""

from __future__ import annotations

import json
from datetime import datetime

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

from app.data.job_role_seed import JOB_ROLES, job_role_levels_seed


revision = "20260705_20"
down_revision = "20260704_19"
branch_labels = None
depends_on = None


def _seed_job_roles(conn) -> None:
    now = datetime.utcnow()
    empty_json = json.dumps([])
    for role in JOB_ROLES:
        conn.execute(
            text(
                """
                INSERT INTO job_roles (
                    role_id, role_name, role_family, description,
                    core_skills, active, created_at, updated_at
                ) VALUES (
                    :role_id, :role_name, :role_family, :description,
                    :core_skills, :active, :created_at, :updated_at
                )
                ON CONFLICT (role_id) DO NOTHING
                """
            ),
            {
                "role_id": role["role_id"],
                "role_name": role["role_name"],
                "role_family": role["role_family"],
                "description": role["description"],
                "core_skills": empty_json,
                "active": True,
                "created_at": now,
                "updated_at": now,
            },
        )


def _seed_job_role_levels(conn) -> None:
    now = datetime.utcnow()
    empty_json = json.dumps([])
    for level in job_role_levels_seed():
        conn.execute(
            text(
                """
                INSERT INTO job_role_levels (
                    role_level_id, role_id, experience_level,
                    min_years, max_years, readiness_topics,
                    active, created_at, updated_at
                ) VALUES (
                    :role_level_id, :role_id, :experience_level,
                    :min_years, :max_years, :readiness_topics,
                    :active, :created_at, :updated_at
                )
                ON CONFLICT (role_level_id) DO NOTHING
                """
            ),
            {
                "role_level_id": level["role_level_id"],
                "role_id": level["role_id"],
                "experience_level": level["experience_level"],
                "min_years": level["min_years"],
                "max_years": level["max_years"],
                "readiness_topics": empty_json,
                "active": True,
                "created_at": now,
                "updated_at": now,
            },
        )


def upgrade() -> None:
    op.create_table(
        "job_roles",
        sa.Column("role_id", sa.String(length=64), nullable=False),
        sa.Column("role_name", sa.String(length=120), nullable=False),
        sa.Column("role_family", sa.String(length=64), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("core_skills", sa.JSON(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("role_id"),
    )
    op.create_index("ix_job_roles_role_family", "job_roles", ["role_family"], unique=False)

    op.create_table(
        "job_role_levels",
        sa.Column("role_level_id", sa.String(length=80), nullable=False),
        sa.Column("role_id", sa.String(length=64), nullable=False),
        sa.Column("experience_level", sa.String(length=32), nullable=False),
        sa.Column("min_years", sa.Integer(), nullable=True),
        sa.Column("max_years", sa.Integer(), nullable=True),
        sa.Column("readiness_topics", sa.JSON(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["role_id"], ["job_roles.role_id"]),
        sa.PrimaryKeyConstraint("role_level_id"),
    )
    op.create_index("ix_job_role_levels_role_id", "job_role_levels", ["role_id"], unique=False)

    op.create_table(
        "quiz_packs",
        sa.Column("quiz_pack_id", sa.String(length=80), nullable=False),
        sa.Column("role_id", sa.String(length=64), nullable=False),
        sa.Column("role_level_id", sa.String(length=80), nullable=False),
        sa.Column("week_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("difficulty", sa.String(length=20), nullable=False, server_default="easy"),
        sa.Column("question_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("linked_jobs_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["role_id"], ["job_roles.role_id"]),
        sa.ForeignKeyConstraint(["role_level_id"], ["job_role_levels.role_level_id"]),
        sa.PrimaryKeyConstraint("quiz_pack_id"),
    )
    op.create_index("ix_quiz_packs_role_id", "quiz_packs", ["role_id"], unique=False)
    op.create_index("ix_quiz_packs_role_level_id", "quiz_packs", ["role_level_id"], unique=False)

    op.create_table(
        "job_enrichments",
        sa.Column("job_id", sa.String(length=32), nullable=False),
        sa.Column("actual_role_id", sa.String(length=64), nullable=False),
        sa.Column("actual_role_name", sa.String(length=120), nullable=False),
        sa.Column("role_level_id", sa.String(length=80), nullable=False),
        sa.Column("experience_level", sa.String(length=32), nullable=False),
        sa.Column("job_live_status", sa.String(length=16), nullable=False, server_default="UNKNOWN"),
        sa.Column("jd_fetch_status", sa.String(length=16), nullable=False, server_default="UNKNOWN"),
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
        sa.Column("manual_review_needed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("approved_status", sa.String(length=20), nullable=False, server_default="PENDING"),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["scraped_jobs.job_id"]),
        sa.ForeignKeyConstraint(["actual_role_id"], ["job_roles.role_id"]),
        sa.ForeignKeyConstraint(["role_level_id"], ["job_role_levels.role_level_id"]),
        sa.ForeignKeyConstraint(["quiz_pack_id"], ["quiz_packs.quiz_pack_id"]),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("job_id"),
    )
    op.create_index("ix_job_enrichments_actual_role", "job_enrichments", ["actual_role_id"], unique=False)
    op.create_index("ix_job_enrichments_role_level", "job_enrichments", ["role_level_id"], unique=False)
    op.create_index("ix_job_enrichments_approved_status", "job_enrichments", ["approved_status"], unique=False)
    op.create_index("ix_job_enrichments_quiz_pack_id", "job_enrichments", ["quiz_pack_id"], unique=False)

    op.create_table(
        "quiz_pack_questions",
        sa.Column("question_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("quiz_pack_id", sa.String(length=80), nullable=False),
        sa.Column("question_type", sa.String(length=32), nullable=False),
        sa.Column("skill_tag", sa.String(length=64), nullable=False),
        sa.Column("difficulty", sa.String(length=20), nullable=False, server_default="easy"),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("option_a", sa.Text(), nullable=True),
        sa.Column("option_b", sa.Text(), nullable=True),
        sa.Column("option_c", sa.Text(), nullable=True),
        sa.Column("option_d", sa.Text(), nullable=True),
        sa.Column("correct_option", sa.String(length=1), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("workbench_type", sa.String(length=32), nullable=True),
        sa.Column("starter_code_or_query", sa.Text(), nullable=True),
        sa.Column("expected_output", sa.Text(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["quiz_pack_id"], ["quiz_packs.quiz_pack_id"]),
        sa.PrimaryKeyConstraint("question_id"),
    )
    op.create_index("ix_quiz_pack_questions_pack", "quiz_pack_questions", ["quiz_pack_id"], unique=False)

    conn = op.get_bind()
    _seed_job_roles(conn)
    _seed_job_role_levels(conn)


def downgrade() -> None:
    op.drop_index("ix_quiz_pack_questions_pack", table_name="quiz_pack_questions")
    op.drop_table("quiz_pack_questions")

    op.drop_index("ix_job_enrichments_quiz_pack_id", table_name="job_enrichments")
    op.drop_index("ix_job_enrichments_approved_status", table_name="job_enrichments")
    op.drop_index("ix_job_enrichments_role_level", table_name="job_enrichments")
    op.drop_index("ix_job_enrichments_actual_role", table_name="job_enrichments")
    op.drop_table("job_enrichments")

    op.drop_index("ix_quiz_packs_role_level_id", table_name="quiz_packs")
    op.drop_index("ix_quiz_packs_role_id", table_name="quiz_packs")
    op.drop_table("quiz_packs")

    op.drop_index("ix_job_role_levels_role_id", table_name="job_role_levels")
    op.drop_table("job_role_levels")

    op.drop_index("ix_job_roles_role_family", table_name="job_roles")
    op.drop_table("job_roles")
