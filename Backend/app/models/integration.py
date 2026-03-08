"""SQLAlchemy models for user integrations (connected social accounts)."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.models.user import Base # Use the existing declarative base

class Integration(Base):
    """Stores API keys or connection tokens for social media platforms."""
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True) # e.g., 'youtube', 'instagram'
    account_id = Column(String(255), nullable=True) # Subject/Account ID from the provider
    access_token = Column(String(1000), nullable=False) # Long string to handle JWTs or standard OAuth tokens
    refresh_token = Column(String(1000), nullable=True) # Optional refresh token
    expires_at = Column(DateTime, nullable=True) # Exact time the access_token expires
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
