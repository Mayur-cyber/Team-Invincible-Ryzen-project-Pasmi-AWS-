"""JWT authentication module using HS256 with bcrypt password hashing.

This module provides:
- Password hashing and verification using bcrypt
- JWT token generation and verification
- FastAPI dependency for protected routes
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.config import settings

from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.mysql_database import get_db
import requests as std_requests
from google.auth.transport import requests


# Get JWT secret from environment variable
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60

# Configure bcrypt context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Google OAuth2 Settings
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

# auto_error=False so the dependency returns None (instead of raising 401)
# when no Bearer token is in the header — allowing cookie-based auth to work.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt.
    
    Args:
        password: Plaintext password to hash
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash.
    
    Args:
        plain_password: Plaintext password to verify
        hashed_password: Previously hashed password
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a JWT access token with HS256 algorithm.
    
    Args:
        data: Dictionary containing claims (e.g., {"sub": "user_id"})
        expires_delta: Optional custom expiration time; defaults to JWT_EXPIRATION_HOURS
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token and return its claims.
    
    Args:
        token: JWT token string to verify
        
    Returns:
        Token claims (payload) if valid, None if expired or invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

from fastapi import Request

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    """FastAPI dependency to get the current authenticated user.
    Supports both Authorization header (via oauth2_scheme) and 'access_token' cookie.
    """
    from app.models.user import User
    
    # Try to get token from header (oauth2_scheme) or cookie
    final_token = token
    if not final_token:
        final_token = request.cookies.get("access_token")
        
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not final_token:
        raise credentials_exception
        
    payload = verify_token(final_token)
    if payload is None:
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def verify_google_token(token: str) -> Optional[dict]:
    """Verify Google OAuth2 Access token by fetching user profile."""
    try:
        resp = std_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo", 
            headers={"Authorization": f"Bearer {token}"}
        )
        if resp.status_code == 200:
            return resp.json()
        return None
    except Exception:
        return None
