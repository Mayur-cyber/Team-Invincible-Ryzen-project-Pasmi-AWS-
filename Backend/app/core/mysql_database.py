"""Database connectivity layer for AWS Aurora MySQL.

This module uses SQLAlchemy in combination with credential retrieval from
AWS Secrets Manager.  It creates two engines (writer and reader) so that the
application can easily perform read/write splitting.  The engines are configured
with sensible pooling defaults for Aurora and support TLS encryption.

Example usage within a FastAPI dependency:

```python
from app.core.mysql_database import get_db, test_connection

@app.get("/health")
def health(db: Session = Depends(get_db)):
    # simple query to ensure connectivity
    return {"ok": True}
```

All sensitive data is provided via environment variables and the AWS SDK
handles refreshing credentials when necessary.
"""
from __future__ import annotations

import logging
import time
from typing import Iterator, Optional, Tuple

from sqlalchemy import create_engine, text, event
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

# global caches for engines to avoid recreating them repeatedly
_writer_engine: Optional[Engine] = None
_reader_engine: Optional[Engine] = None


def _build_url(endpoint: str) -> str:
    """Construct a SQLAlchemy URL from endpoint and env settings."""
    user = settings.DB_USER
    password = settings.DB_PASSWORD
    dbname = settings.DB_NAME
    port = settings.DB_PORT or 3306
    if not all([user, password, dbname]):
        raise RuntimeError("Database credentials or configuration incomplete")

    # using PyMySQL dialect
    return f"mysql+pymysql://{user}:{password}@{endpoint}:{port}/{dbname}"


def _get_engine(writer: bool = True) -> Engine:
    """Return a cached SQLAlchemy engine for the writer or reader endpoint.

    Engines are initialized lazily and cached so that credential fetches and
    connection establishment happen once, not on every route.
    """
    global _writer_engine, _reader_engine

    if writer and _writer_engine is not None:
        return _writer_engine
    if not writer and _reader_engine is not None:
        return _reader_engine

    # Retrieve endpoint from environment
    endpoint = settings.DB_HOST
    if not endpoint:
        raise RuntimeError("DB_HOST not configured")

    url = _build_url(endpoint)

    # build SSL connect_args based on settings
    connect_args: dict[str, Any] = {}
    ssl_opts: dict[str, str] = {}
    if settings.DB_SSL_CA:
        ssl_opts["ca"] = settings.DB_SSL_CA
    if settings.DB_SSL_REQUIRE:
        ssl_opts.setdefault("check_hostname", True)
    if ssl_opts:
        connect_args["ssl"] = ssl_opts

    # connection pool settings tuned for Aurora; see pool_pre_ping and pool_recycle
    engine = create_engine(
        url,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_pre_ping=True,  # test connections before use
        connect_args=connect_args,
        echo=False,
    )

    # Add event listeners for connection monitoring and debugging
    @event.listens_for(engine, "connect")
    def receive_connect(dbapi_connection, connection_record):
        logger.debug(
            f"New {'writer' if writer else 'reader'} connection established to {endpoint}"
        )

    @event.listens_for(engine, "checkout")
    def receive_checkout(dbapi_connection, connection_record, connection_proxy):
        logger.debug(f"{'Writer' if writer else 'Reader'} connection checked out from pool")

    @event.listens_for(engine, "checkin")
    def receive_checkin(dbapi_connection, connection_record):
        logger.debug(f"{'Writer' if writer else 'Reader'} connection returned to pool")

    if writer:
        _writer_engine = engine
    else:
        _reader_engine = engine

    logger.info(
        f"Created {'writer' if writer else 'reader'} engine for endpoint: {endpoint} "
        f"(pool_size={settings.DB_POOL_SIZE}, max_overflow={settings.DB_MAX_OVERFLOW})"
    )
    return engine


def get_db(write: bool = True) -> Iterator[Session]:
    """FastAPI dependency that yields a database session.

    Parameters
    ----------
    write : bool
        If True, use the writer engine; otherwise use the reader engine.
    """
    engine = _get_engine(writer=write)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_connection(writer: bool = True, retries: int = 3, backoff: float = 1.0) -> bool:
    """Attempt to run a simple SELECT 1 using the specified engine, with retries.

    Returns
    -------
    bool
        True if the query succeeded, False otherwise.
    """
    engine = _get_engine(writer)
    attempt = 0
    while attempt < retries:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except OperationalError as exc:
            logger.warning("database connection attempt %d failed: %s", attempt, exc)
            attempt += 1
            time.sleep(backoff * attempt)
    return False


# Convenience utility for closing engines during shutdown

def close_engines() -> None:
    """Dispose of both writer and reader engines."""
    global _writer_engine, _reader_engine
    if _writer_engine is not None:
        _writer_engine.dispose()
        _writer_engine = None
    if _reader_engine is not None:
        _reader_engine.dispose()
        _reader_engine = None


def ensure_database_exists(db_name: str | None = None) -> None:
    """Make sure the specified database is present on the writer node.

    This function connects to the writer endpoint without selecting a
    database and executes a ``CREATE DATABASE IF NOT EXISTS`` statement.  It is
    intended to be invoked from application logic (for example, after a user
    successfully signs up) so that an empty schema is prepared automatically.

    Parameters
    ----------
    db_name : str | None
        Name of the database to create; defaults to ``settings.DB_NAME``.

    Raises
    ------
    RuntimeError
        If credentials are unavailable or if execution fails.
    """

    if not db_name:
        db_name = settings.DB_NAME
    if not db_name:
        raise RuntimeError("no database name configured")

    # We no longer read from secrets:
    username = settings.DB_USER
    password = settings.DB_PASSWORD
    if not username or not password:
        raise RuntimeError("no username or password configured")

    endpoint = settings.DB_HOST
    if not endpoint:
        raise RuntimeError("DB_HOST not configured")

    # build URL *without* a database
    url = f"mysql+pymysql://{username}:{password}@{endpoint}:{settings.DB_PORT}/"

    engine = create_engine(
        url,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
        future=True,
    )

    from sqlalchemy import text

    with engine.connect() as conn:
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        logger.info("ensuring database '%s' exists", db_name)
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARSET utf8mb4"))

    engine.dispose()
