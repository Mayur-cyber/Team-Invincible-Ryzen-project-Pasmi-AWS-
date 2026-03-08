from pydantic import BaseModel, EmailStr, Field


class SyncUserRequest(BaseModel):
    """
    Validated request body for the /api/auth/sync-user endpoint.
    All fields are constrained to prevent oversized or malformed input.
    """
    id: str = Field(..., min_length=1, max_length=255, description="Neon Auth user ID")
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(default="", max_length=255, description="User display name")
    provider: str = Field(default="email", max_length=50, description="Auth provider (email, google, facebook)")
