"""add credit ledger

Revision ID: 20260216_01
Revises:
Create Date: 2026-02-16 00:00:00

"""

from typing import Sequence, Union

import alembic.op as op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260216_01"
down_revision: Union[str, Sequence[str], None] = "20260216_00"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "users" in tables:
        user_columns = {col["name"] for col in inspector.get_columns("users")}
        if "credit_balance" not in user_columns:
            op.add_column(
                "users",
                sa.Column("credit_balance", sa.Integer(), nullable=False, server_default=sa.text("100")),
            )

    if "credit_transactions" not in tables and "users" in tables:
        op.create_table(
            "credit_transactions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("transaction_type", sa.Enum("CREDIT", "DEBIT", name="credittransactiontype"), nullable=False),
            sa.Column("amount", sa.Integer(), nullable=False),
            sa.Column("balance_after", sa.Integer(), nullable=False),
            sa.Column("reason", sa.String(length=255), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_credit_transactions_user_created", "credit_transactions", ["user_id", "created_at"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "credit_transactions" in tables:
        op.drop_table("credit_transactions")

    if "users" in tables:
        user_columns = {col["name"] for col in inspector.get_columns("users")}
        if "credit_balance" in user_columns:
            op.drop_column("users", "credit_balance")
