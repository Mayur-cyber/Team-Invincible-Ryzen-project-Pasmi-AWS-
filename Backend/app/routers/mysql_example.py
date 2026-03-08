from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from app.core.mysql_database import get_db, test_connection, ensure_database_exists

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/db-test")
def db_test(write: bool = True, db: Session = Depends(get_db)):
    """Simple endpoint demonstrating read/write splitting.

    Pass `?write=false` to exercise the reader endpoint.
    """
    try:
        # run a trivial query
        result = db.execute(text("SELECT 1")).scalar()
        return {"ok": True, "result": result, "using_writer": write}
    except Exception as exc:
        logger.exception("database test query failed")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/init")
def init_database():
    """Create the configured database if it does not yet exist.

    Calling this endpoint is intended to happen once (for example, right after
    a user signs up on the frontend).  It is idempotent and safe to invoke
    multiple times.
    """
    try:
        ensure_database_exists()
        return {"message": "database ready"}
    except Exception as exc:
        logger.exception("database initialization failed")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/health")
def health_check():
    """Health endpoint that checks connectivity to both writer and reader endpoints.

    Returns 200 if both are healthy, 503 (Service Unavailable) if either is down.
    """
    writer_ok = test_connection(writer=True, retries=1)
    reader_ok = test_connection(writer=False, retries=1)
    
    status = {"writer": writer_ok, "reader": reader_ok}
    
    if not writer_ok:
        logger.error("Writer endpoint health check failed")
    if not reader_ok:
        logger.warning("Reader endpoint health check failed (check replication)")
    
    if not all(status.values()):
        raise HTTPException(
            status_code=503,
            detail={"message": "Database unavailable", "endpoints": status}
        )
    
    return {"status": "healthy", "endpoints": status}


# example CRUD operations using raw SQL; replace with ORM models in a real app

@router.post("/items")
def create_item(name: str, db: Session = Depends(get_db)):
    """Insert a row into the sample `items` table."""
    try:
        db.execute(text("INSERT INTO items (name) VALUES (:name)"), {"name": name})
        db.commit()
        return {"message": "created"}
    except Exception as exc:
        db.rollback()
        logger.exception("insert failed")
        raise HTTPException(status_code=500, detail="could not insert item")

@router.get("/items/{item_id}")
def read_item(item_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT id, name FROM items WHERE id = :id"), {"id": item_id}).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    return {"id": row[0], "name": row[1]}

@router.put("/items/{item_id}")
def update_item(item_id: int, name: str, db: Session = Depends(get_db)):
    try:
        res = db.execute(text("UPDATE items SET name = :name WHERE id = :id"), {"name": name, "id": item_id})
        db.commit()
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="not found")
        return {"message": "updated"}
    except Exception as exc:
        db.rollback()
        logger.exception("update failed")
        raise HTTPException(status_code=500, detail="could not update item")

@router.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    try:
        res = db.execute(text("DELETE FROM items WHERE id = :id"), {"id": item_id})
        db.commit()
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="not found")
        return {"message": "deleted"}
    except Exception as exc:
        db.rollback()
        logger.exception("delete failed")
        raise HTTPException(status_code=500, detail="could not delete item")
