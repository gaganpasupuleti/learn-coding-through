import os
from logging.config import fileConfig

import alembic.context as context
from sqlalchemy import engine_from_config, pool

from app.core.database import Base
from app.models import models  # noqa: F401


config = context.config

# Prefer DATABASE_URL from the environment so Alembic works inside Docker/Railway
# without needing the full app settings module on PYTHONPATH.
_db_url = os.getenv("DATABASE_URL", "")
if not _db_url:
    # Fall back to the value baked into alembic.ini (local dev)
    _db_url = config.get_main_option("sqlalchemy.url") or ""

# SQLAlchemy 1.4+ requires postgresql:// not postgres://
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

# psycopg2 driver prefix is needed when the URL uses the plain postgresql:// scheme
if _db_url.startswith("postgresql://") and "+" not in _db_url.split("//")[0]:
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

config.set_main_option("sqlalchemy.url", _db_url.replace("%", "%%"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
