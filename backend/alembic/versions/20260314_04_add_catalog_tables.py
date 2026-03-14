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
    # ── quiz_catalog ────────────────────────────────────────────────────────
    op.create_table(
        'quiz_catalog',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(120), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(50), nullable=False, server_default='beginner'),
        sa.Column('estimated_time', sa.String(80), nullable=False),
    )
    op.create_index('ix_quiz_catalog_slug', 'quiz_catalog', ['slug'], unique=True)

    # ── quiz_catalog_questions ───────────────────────────────────────────────
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
    op.create_index('ix_quiz_catalog_questions_quiz_id', 'quiz_catalog_questions', ['quiz_id'])

    # ── project_catalog ──────────────────────────────────────────────────────
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
    op.create_index('ix_project_catalog_slug', 'project_catalog', ['slug'], unique=True)

    # ── project_catalog_steps ────────────────────────────────────────────────
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
    op.create_index('ix_project_catalog_steps_project_id', 'project_catalog_steps', ['project_id'])


def downgrade() -> None:
    op.drop_table('project_catalog_steps')
    op.drop_index('ix_project_catalog_slug', table_name='project_catalog')
    op.drop_table('project_catalog')
    op.drop_table('quiz_catalog_questions')
    op.drop_index('ix_quiz_catalog_slug', table_name='quiz_catalog')
    op.drop_table('quiz_catalog')
