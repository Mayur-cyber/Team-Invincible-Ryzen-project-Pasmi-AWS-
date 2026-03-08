"""Database initialization utilities for creating tables."""
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session

from app.models.user import User
from app.core import mysql_database


def create_users_table() -> None:
    """Create the users table in the database if it doesn't exist.
    
    Uses raw SQL to create the table with proper MySQL-specific settings
    like charset and collation.
    """
    engine = mysql_database._get_engine(writer=True)
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """
    
    with engine.connect() as conn:
        conn.execute(text(create_table_sql))
        conn.commit()
        print("Users table ensured to exist")


def table_exists(table_name: str) -> bool:
    """Check if a table exists in the database.
    
    Args:
        table_name: Name of the table to check
        
    Returns:
        True if table exists, False otherwise
    """
    engine = mysql_database._get_engine(writer=True)
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def init_db() -> None:
    """Initialize all database tables needed by the application."""
    if not table_exists("users"):
        create_users_table()
    else:
        print("Users table already exists")
