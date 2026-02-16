from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings


REQUIRED_TABLES = {
    "users",
    "roles",
    "stages",
    "topics",
    "lessons",
    "exercises",
    "quizzes",
    "quiz_questions",
    "submissions",
    "projects",
    "resumes",
    "progress_tracking",
    "credit_transactions",
}


def mask_database_url(database_url: str) -> str:
    if "@" not in database_url:
        return database_url
    prefix, suffix = database_url.split("@", 1)
    if "://" not in prefix:
        return f"***@{suffix}"
    scheme, creds = prefix.split("://", 1)
    if ":" in creds:
        username, _ = creds.split(":", 1)
        return f"{scheme}://{username}:***@{suffix}"
    return f"{scheme}://***@{suffix}"


def get_scalar(connection: Any, query: str, fallback: str = "unknown") -> str:
    try:
        value = connection.execute(text(query)).scalar()
        if value is None:
            return fallback
        return str(value)
    except Exception:
        return fallback


def main() -> int:
    database_url = settings.database_url
    print(f"DB URL: {mask_database_url(database_url)}")

    if "supabase.com" in database_url:
        print("Detected Supabase database URL")

    engine = create_engine(database_url, pool_pre_ping=True)

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

            db_name = get_scalar(connection, "SELECT current_database()")
            db_user = get_scalar(connection, "SELECT current_user")
            alembic_version = get_scalar(connection, "SELECT version_num FROM alembic_version LIMIT 1", fallback="not-applied")

            inspector = inspect(connection)
            existing_tables = set(inspector.get_table_names())
            missing_tables = sorted(REQUIRED_TABLES - existing_tables)

            print(f"Database: {db_name}")
            print(f"User: {db_user}")
            print(f"Alembic version: {alembic_version}")
            print(f"Table count: {len(existing_tables)}")

            if missing_tables:
                print("Missing required tables:")
                for table_name in missing_tables:
                    print(f" - {table_name}")
                return 2

            print("All required tables are present")
            return 0

    except SQLAlchemyError as exc:
        print(f"DB preflight failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
