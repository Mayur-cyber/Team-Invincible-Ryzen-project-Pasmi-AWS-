"""MySQL connection helper using PyMySQL.

This module exposes a FastAPI dependency `get_db` which yields a
PyMySQL connection for request handlers. It reads configuration from the
environment variables documented in the project README:

- `DB_HOST`
- `DB_PORT` (default: 3306)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL_REQUIRE` (true/false)
- `DB_SSL_CA` (path to CA bundle, optional)

The connection is created per-request and closed after the request finishes.
Using a lightweight per-request connection is simple and safe for many
development and low-throughput scenarios; for production you may replace this
with a pooled implementation.
"""
import os
from typing import Iterator, Any
import pymysql
from fastapi import Depends


def _get_db_config() -> dict[str, Any]:
    host = os.getenv("DB_HOST", os.getenv("DB_WRITER_ENDPOINT", "localhost"))
    port = int(os.getenv("DB_PORT", os.getenv("DB_PORT", "3306")))
    user = os.getenv("DB_USER", os.getenv("DB_USERNAME", ""))
    password = os.getenv("DB_PASSWORD", os.getenv("DB_PASSWORD", ""))
    db = os.getenv("DB_NAME", os.getenv("DB_NAME", ""))
    ssl_require = os.getenv("DB_SSL_REQUIRE", "False").lower() in ("1", "true", "yes")
    ca = os.getenv("DB_SSL_CA")

    connect_kwargs: dict[str, Any] = {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "database": db,
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": True,
    }

    if ssl_require:
        ssl_args: dict[str, Any] = {}
        if ca:
            ssl_args["ca"] = ca
        if ssl_args:
            connect_kwargs["ssl"] = ssl_args

    return connect_kwargs


def init_db() -> None:
    """Optional initializer hook (kept for compatibility)."""
    return


def close_db() -> None:
    """Optional shutdown hook (kept for compatibility)."""
    return


def get_db() -> Iterator[pymysql.connections.Connection]:
    """FastAPI dependency that yields a PyMySQL connection.

    Usage:
        db = Depends(get_db)
    """
    cfg = _get_db_config()
    conn = pymysql.connect(**cfg)
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass
