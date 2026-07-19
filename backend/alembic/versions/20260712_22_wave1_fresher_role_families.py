"""Wave 1 fresher role families: cyber security, Salesforce, Dynamics CRM, Power Platform.

Revision ID: 20260712_22
Revises: 20260705_21
Create Date: 2026-07-12 00:00:00.000000
"""

from __future__ import annotations

import json
from datetime import datetime

from alembic import op
from sqlalchemy import text

from app.data.job_role_seed import JOB_ROLES, job_role_levels_seed

revision = "20260712_22"
down_revision = "20260705_21"
branch_labels = None
depends_on = None

WAVE1_ROLE_IDS = frozenset(
    {
        "ROLE_CYBER_SECURITY",
        "ROLE_SALESFORCE",
        "ROLE_DYNAMICS_CRM",
        "ROLE_POWER_PLATFORM",
    }
)


def upgrade() -> None:
    conn = op.get_bind()
    now = datetime.utcnow()
    empty_json = json.dumps([])

    for role in JOB_ROLES:
        if role["role_id"] not in WAVE1_ROLE_IDS:
            continue
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

    for level in job_role_levels_seed():
        if level["role_id"] not in WAVE1_ROLE_IDS:
            continue
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


def downgrade() -> None:
    conn = op.get_bind()
    for role_id in WAVE1_ROLE_IDS:
        conn.execute(
            text("DELETE FROM job_role_levels WHERE role_id = :role_id"),
            {"role_id": role_id},
        )
        conn.execute(
            text("DELETE FROM job_roles WHERE role_id = :role_id"),
            {"role_id": role_id},
        )
