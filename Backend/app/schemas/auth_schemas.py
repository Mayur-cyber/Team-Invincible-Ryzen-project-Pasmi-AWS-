"""Pydantic schemas for authentication."""
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str


class UserResponse(UserBase):
    """Schema for user response (excludes password)."""
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response after login."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: int
    username: str
