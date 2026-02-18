"""add admin student fields and activity logs

Revision ID: 20260217_02
Revises: 20260216_01
Create Date: 2026-02-17 00:00:00

"""

from typing import Sequence, Union

import alembic.op as op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260217_02"
down_revision: Union[str, Sequence[str], None] = "20260216_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(inspector: sa.Inspector, table_name: str) -> set[str]:
    return {col["name"] for col in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "users" in tables:
        user_columns = _column_names(inspector, "users")

        if "cohort_name" not in user_columns:
            op.add_column("users", sa.Column("cohort_name", sa.String(length=120), nullable=True))

        if "batch_name" not in user_columns:
            op.add_column("users", sa.Column("batch_name", sa.String(length=120), nullable=True))

        if "is_active" not in user_columns:
            op.add_column(
                "users",
                sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            )

        if "updated_at" not in user_columns:
            op.add_column(
                "users",
                sa.Column(
                    "updated_at",
                    sa.DateTime(),
                    nullable=False,
                    server_default=sa.text("CURRENT_TIMESTAMP"),
                ),
            )

    if "admin_activity_logs" not in tables and "users" in tables:
        op.create_table(
            "admin_activity_logs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("admin_user_id", sa.Integer(), nullable=False),
            sa.Column("target_user_id", sa.Integer(), nullable=True),
            sa.Column("action", sa.String(length=100), nullable=False),
            sa.Column("details", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["admin_user_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["target_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_admin_activity_logs_created", "admin_activity_logs", ["created_at"], unique=False)
        op.create_index(
            "ix_admin_activity_logs_admin_target",
            "admin_activity_logs",
            ["admin_user_id", "target_user_id"],
            unique=False,
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "admin_activity_logs" in tables:
        op.drop_table("admin_activity_logs")

    if "users" in tables:
        user_columns = _column_names(inspector, "users")
        if "updated_at" in user_columns:
            op.drop_column("users", "updated_at")
        if "is_active" in user_columns:
            op.drop_column("users", "is_active")
        if "batch_name" in user_columns:
            op.drop_column("users", "batch_name")
        if "cohort_name" in user_columns:
            op.drop_column("users", "cohort_name")
