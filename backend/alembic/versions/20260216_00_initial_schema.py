"""initial schema

Revision ID: 20260216_00
Revises:
Create Date: 2026-02-16 00:10:00

"""

from typing import Sequence, Union

import alembic.op as op

from app.core.database import Base
from app.models import models  # noqa: F401


# revision identifiers, used by Alembic.
revision: str = "20260216_00"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
