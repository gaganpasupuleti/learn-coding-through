"""drop resumes table

Revision ID: drop_resumes_20260505
Revises: 
Create Date: 2026-05-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'drop_resumes_20260505'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Drop the resumes table if it exists.

    This migration is intentionally defensive and uses raw SQL `IF EXISTS`
    to avoid failing on databases where the table is already gone.
    """
    # Drop singular/plural names just in case
    op.execute("DROP TABLE IF EXISTS resumes CASCADE;")
    op.execute("DROP TABLE IF EXISTS resume CASCADE;")


def downgrade():
    # Downgrade is a no-op because recreating the original schema
    # reliably requires the original model definition and constraints.
    pass
