"""Add typing attempts table

Revision ID: 20260327_08
Revises: 20260316_07
Create Date: 2026-03-27 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision = "20260327_08"
down_revision = "20260316_07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    typing_mode_enum = sa.Enum("SENTENCE", "CODE", name="typingmode")
    typing_test_type_enum = sa.Enum("TIMED", "LENGTH", name="typingtesttype")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        typing_mode_enum.create(bind, checkfirst=True)
        typing_test_type_enum.create(bind, checkfirst=True)

    op.create_table(
        "typing_attempts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("mode", typing_mode_enum, nullable=False),
        sa.Column("test_type", typing_test_type_enum, nullable=False),
        sa.Column("test_option", sa.String(length=20), nullable=False),
        sa.Column("language", sa.String(length=30), nullable=True),
        sa.Column("prompt_text", sa.Text(), nullable=False),
        sa.Column("typed_text", sa.Text(), nullable=False),
        sa.Column("wpm", sa.Numeric(6, 2), nullable=False),
        sa.Column("raw_wpm", sa.Numeric(6, 2), nullable=False),
        sa.Column("accuracy", sa.Numeric(5, 2), nullable=False),
        sa.Column("error_count", sa.Integer(), nullable=False),
        sa.Column("elapsed_seconds", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_typing_attempts_user_id"), "typing_attempts", ["user_id"], unique=False)
    op.create_index("ix_typing_attempts_user_created", "typing_attempts", ["user_id", "created_at"], unique=False)
    op.create_index("ix_typing_attempts_mode_test", "typing_attempts", ["mode", "test_type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_typing_attempts_mode_test", table_name="typing_attempts")
    op.drop_index("ix_typing_attempts_user_created", table_name="typing_attempts")
    op.drop_index(op.f("ix_typing_attempts_user_id"), table_name="typing_attempts")
    op.drop_table("typing_attempts")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        sa.Enum(name="typingtesttype").drop(bind, checkfirst=True)
        sa.Enum(name="typingmode").drop(bind, checkfirst=True)
