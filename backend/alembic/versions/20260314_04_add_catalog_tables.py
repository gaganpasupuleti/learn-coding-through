"""add catalog tables

Revision ID: 20260314_04
Revises: 20260218_03
Create Date: 2026-03-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '20260314_04'
down_revision = '20260218_03'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())
    existing_indexes = {
        table: {idx["name"] for idx in inspector.get_indexes(table)}
        for table in existing_tables
    }

    # ── quiz_catalog ────────────────────────────────────────────────────────
    if 'quiz_catalog' not in existing_tables:
        op.create_table(
            'quiz_catalog',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('slug', sa.String(120), nullable=False),
            sa.Column('title', sa.String(255), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('difficulty', sa.String(50), nullable=False, server_default='beginner'),
            sa.Column('estimated_time', sa.String(80), nullable=False),
        )
    if 'ix_quiz_catalog_slug' not in existing_indexes.get('quiz_catalog', set()):
        op.create_index('ix_quiz_catalog_slug', 'quiz_catalog', ['slug'], unique=True)

    # ── quiz_catalog_questions ───────────────────────────────────────────────
    if 'quiz_catalog_questions' not in existing_tables:
        op.create_table(
            'quiz_catalog_questions',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('quiz_id', sa.Integer(), sa.ForeignKey('quiz_catalog.id'), nullable=False),
            sa.Column('order', sa.Integer(), nullable=False),
            sa.Column('question_type', sa.String(30), nullable=False),
            sa.Column('title', sa.String(255), nullable=False),
            sa.Column('prompt', sa.Text(), nullable=False),
            sa.Column('options_json', sa.Text(), nullable=True),
            sa.Column('correct_index', sa.Integer(), nullable=True),
            sa.Column('answer', sa.Text(), nullable=True),
            sa.Column('acceptable_answers_json', sa.Text(), nullable=True),
            sa.Column('expected_output', sa.Text(), nullable=True),
            sa.Column('code_snippet', sa.Text(), nullable=True),
            sa.Column('language', sa.String(50), nullable=True),
            sa.Column('explanation', sa.Text(), nullable=False),
        )
    if 'ix_quiz_catalog_questions_quiz_id' not in existing_indexes.get('quiz_catalog_questions', set()):
        op.create_index('ix_quiz_catalog_questions_quiz_id', 'quiz_catalog_questions', ['quiz_id'])

    # ── project_catalog ──────────────────────────────────────────────────────
    if 'project_catalog' not in existing_tables:
        op.create_table(
            'project_catalog',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('slug', sa.String(120), nullable=False),
            sa.Column('title', sa.String(255), nullable=False),
            sa.Column('short_description', sa.String(500), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('difficulty', sa.String(50), nullable=False, server_default='beginner'),
            sa.Column('estimated_time', sa.String(80), nullable=False),
        )
    if 'ix_project_catalog_slug' not in existing_indexes.get('project_catalog', set()):
        op.create_index('ix_project_catalog_slug', 'project_catalog', ['slug'], unique=True)

    # ── project_catalog_steps ────────────────────────────────────────────────
    if 'project_catalog_steps' not in existing_tables:
        op.create_table(
            'project_catalog_steps',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('project_id', sa.Integer(), sa.ForeignKey('project_catalog.id'), nullable=False),
            sa.Column('order', sa.Integer(), nullable=False),
            sa.Column('step_type', sa.String(30), nullable=False),
            sa.Column('title', sa.String(255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('points_json', sa.Text(), nullable=True),
            sa.Column('code', sa.Text(), nullable=True),
            sa.Column('language', sa.String(50), nullable=True),
            sa.Column('challenge', sa.Text(), nullable=True),
            sa.Column('hint', sa.Text(), nullable=True),
            sa.Column('walkthrough_gif', sa.String(500), nullable=True),
            sa.Column('walkthrough_caption', sa.Text(), nullable=True),
        )
    if 'ix_project_catalog_steps_project_id' not in existing_indexes.get('project_catalog_steps', set()):
        op.create_index('ix_project_catalog_steps_project_id', 'project_catalog_steps', ['project_id'])


def downgrade() -> None:
    op.drop_table('project_catalog_steps')
    op.drop_index('ix_project_catalog_slug', table_name='project_catalog')
    op.drop_table('project_catalog')
    op.drop_table('quiz_catalog_questions')
    op.drop_index('ix_quiz_catalog_slug', table_name='quiz_catalog')
    op.drop_table('quiz_catalog')
