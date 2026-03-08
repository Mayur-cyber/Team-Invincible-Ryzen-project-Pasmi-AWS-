import logging
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from alembic import context
from app.core.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set sync database URL from settings if present
sync_url = getattr(settings, "SYNC_DATABASE_URL", None)
if sync_url:
    config.set_main_option("sqlalchemy.url", sync_url)

# For async connection (Postgres) — only create engine if configured
async_url = getattr(settings, "DATABASE_URL", None)
connectable = None
if async_url:
    connectable = create_async_engine(
        async_url,
        poolclass=NullPool,
        connect_args={"ssl": "require"},
    )

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=None,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    if connectable is None:
        raise RuntimeError("No async database configured for Alembic migrations.")
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=None
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
