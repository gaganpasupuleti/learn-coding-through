"""Add SUPER_ADMIN label to userrole enum (matches SQLAlchemy name binding).

Revision ID: 20260709_23
Revises: 20260709_22
Create Date: 2026-07-09 17:20:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260709_23"
down_revision = "20260709_22"
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
                    WHERE t.typname = 'userrole' AND e.enumlabel = 'SUPER_ADMIN'
                ) THEN
                    ALTER TYPE userrole ADD VALUE 'SUPER_ADMIN';
                END IF;
            END $$;
            """
        )
    )


def downgrade() -> None:
    pass
