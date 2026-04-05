"""Neutralize auth uid column naming from supabase_uid to external_auth_uid.

Revision ID: 20260405_09
Revises: 20260327_08
Create Date: 2026-04-05 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260405_09"
down_revision = "20260327_08"
branch_labels = None
depends_on = None


def _column_names(bind) -> set[str]:
    inspector = sa.inspect(bind)
    return {col["name"] for col in inspector.get_columns("users")}


def _index_names(bind) -> set[str]:
    inspector = sa.inspect(bind)
    return {idx["name"] for idx in inspector.get_indexes("users")}


def upgrade() -> None:
    bind = op.get_bind()
    columns = _column_names(bind)
    indexes = _index_names(bind)

    # Rename legacy provider-specific column when present.
    if "supabase_uid" in columns and "external_auth_uid" not in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column(
                "supabase_uid",
                new_column_name="external_auth_uid",
                existing_type=sa.String(length=36),
                type_=sa.String(length=64),
                existing_nullable=True,
            )
    elif "external_auth_uid" not in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.add_column(sa.Column("external_auth_uid", sa.String(length=64), nullable=True))

    # Normalize index name for the neutral column.
    if "ix_users_supabase_uid" in indexes:
        op.drop_index("ix_users_supabase_uid", table_name="users")

    # Refresh index list after potential changes.
    indexes = _index_names(bind)
    if "ix_users_external_auth_uid" not in indexes:
        op.create_index("ix_users_external_auth_uid", "users", ["external_auth_uid"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    columns = _column_names(bind)
    indexes = _index_names(bind)

    if "ix_users_external_auth_uid" in indexes:
        op.drop_index("ix_users_external_auth_uid", table_name="users")

    if "external_auth_uid" in columns and "supabase_uid" not in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column(
                "external_auth_uid",
                new_column_name="supabase_uid",
                existing_type=sa.String(length=64),
                type_=sa.String(length=36),
                existing_nullable=True,
            )

    indexes = _index_names(bind)
    if "ix_users_supabase_uid" not in indexes and "supabase_uid" in _column_names(bind):
        op.create_index("ix_users_supabase_uid", "users", ["supabase_uid"], unique=True)
