"""Add super_admin label to userrole enum for admin metrics/overview.

Revision ID: 20260709_22
Revises: 20260705_21
Create Date: 2026-07-09 16:45:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260709_22"
down_revision = "20260705_21"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = 'userrole' AND e.enumlabel = 'super_admin'
                ) THEN
                    ALTER TYPE userrole ADD VALUE 'super_admin';
                END IF;
            END $$;
            """
        )
    )


def downgrade() -> None:
    # ponytail: PostgreSQL cannot drop a single enum value without recreating the type.
    pass
