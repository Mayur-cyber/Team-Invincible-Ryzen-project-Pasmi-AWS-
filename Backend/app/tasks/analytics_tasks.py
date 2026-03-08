from __future__ import annotations

from contextlib import asynccontextmanager
import asyncio
from typing import AsyncIterator

from sqlalchemy.orm import sessionmaker, Session

from app.core import mysql_database


@asynccontextmanager
async def get_db_with_retry(max_retries: int = 3, backoff: float = 1.0) -> AsyncIterator[Session]:
    """Async context manager that yields a SQLAlchemy `Session` with retries.

    Mirrors `publish_tasks.get_db_with_retry` so Celery/async tasks can obtain
    a session against the Aurora MySQL cluster.
    """
    attempt = 0
    while True:
        try:
            engine = mysql_database._get_engine(writer=True)
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            session = SessionLocal()
            try:
                yield session
            finally:
                try:
                    session.close()
                except Exception:
                    pass
            return
        except Exception:
            attempt += 1
            if attempt >= max_retries:
                raise
            await asyncio.sleep(backoff * attempt)
