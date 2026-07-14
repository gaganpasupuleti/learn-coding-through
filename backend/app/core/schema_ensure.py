"""Runtime schema patches when Alembic did not run on deploy."""

from __future__ import annotations

from sqlalchemy import inspect, text

from app.core.database import engine
from app.models.models import ClassSession, LoginAttempt, QuizCatalogAttempt, StudentFeedback, TypingAttempt


def ensure_job_posts_fixture_columns() -> None:
    try:
        inspector = inspect(engine)
        if not inspector.has_table("job_posts"):
            return
        cols = {c["name"] for c in inspector.get_columns("job_posts")}
        dialect = engine.dialect.name
        with engine.begin() as conn:
            if "is_fixture" not in cols:
                if dialect == "sqlite":
                    conn.execute(
                        text(
                            "ALTER TABLE job_posts ADD COLUMN is_fixture BOOLEAN NOT NULL DEFAULT 0"
                        )
                    )
                else:
                    conn.execute(
                        text(
                            "ALTER TABLE job_posts ADD COLUMN is_fixture BOOLEAN NOT NULL DEFAULT false"
                        )
                    )
            if "sort_order" not in cols:
                conn.execute(
                    text("ALTER TABLE job_posts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0")
                )
    except Exception as exc:
        print(f"Warning: unable to ensure job_posts fixture/sort columns: {exc}")


def ensure_schedule_schema() -> None:
    try:
        ClassSession.__table__.create(bind=engine, checkfirst=True)
        inspector = inspect(engine)
        dialect = engine.dialect.name
        with engine.begin() as conn:
            if inspector.has_table("stages"):
                stage_cols = {c["name"] for c in inspector.get_columns("stages")}
                if "due_date" not in stage_cols:
                    conn.execute(text("ALTER TABLE stages ADD COLUMN due_date DATE"))
            if inspector.has_table("quizzes"):
                quiz_cols = {c["name"] for c in inspector.get_columns("quizzes")}
                if "due_date" not in quiz_cols:
                    conn.execute(text("ALTER TABLE quizzes ADD COLUMN due_date DATE"))
            if dialect == "postgresql":
                conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS ix_class_sessions_batch_date "
                        "ON class_sessions (batch_id, session_date)"
                    )
                )
                conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS ix_class_sessions_status_date "
                        "ON class_sessions (status, session_date)"
                    )
                )
    except Exception as exc:
        print(f"Warning: unable to ensure schedule schema (class_sessions / due_date): {exc}")


def ensure_admin_api_schema() -> None:
    """Called before admin routes so job board queries never hit missing columns."""
    ensure_job_posts_fixture_columns()
    ensure_login_attempts_table()


def ensure_typing_attempts_table() -> None:
    try:
        TypingAttempt.__table__.create(bind=engine, checkfirst=True)
    except Exception as exc:
        print(f"Warning: unable to ensure typing_attempts table exists: {exc}")


def ensure_student_feedback_table() -> None:
    try:
        StudentFeedback.__table__.create(bind=engine, checkfirst=True)
    except Exception as exc:
        print(f"Warning: unable to ensure student_feedback table exists: {exc}")


def ensure_quiz_catalog_attempts_table() -> None:
    try:
        QuizCatalogAttempt.__table__.create(bind=engine, checkfirst=True)
    except Exception as exc:
        print(f"Warning: unable to ensure quiz_catalog_attempts table exists: {exc}")


def ensure_login_attempts_table() -> None:
    try:
        LoginAttempt.__table__.create(bind=engine, checkfirst=True)
    except Exception as exc:
        print(f"Warning: unable to ensure login_attempts table exists: {exc}")
