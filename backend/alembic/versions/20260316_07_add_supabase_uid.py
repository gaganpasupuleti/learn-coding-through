"""Add supabase_uid to users table

Revision ID: 20260316_07
Revises: 20260315_06
Create Date: 2026-03-16 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "20260316_07"
down_revision = "20260315_06"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("supabase_uid", sa.String(36), nullable=True),
    )
    op.create_index(op.f("ix_users_supabase_uid"), "users", ["supabase_uid"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_supabase_uid"), table_name="users")
    op.drop_column("users", "supabase_uid")
