from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.mysql_database import get_db
from app.core.auth import hash_password, create_access_token, verify_password, get_current_user, verify_google_token
from app.models.user import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None  # optional display name


class GoogleAuth(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Helper ────────────────────────────────────────────────────────────────────

def _build_token_response(response: Response, user: User) -> dict:
    """Create access token, set cookie, and return the full token payload."""
    access_token = create_access_token(data={"sub": str(user.id)})

    # Set httpOnly cookie for browser / OAuth redirect support
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set True in production with HTTPS
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
        },
    }


# ── Register ──────────────────────────────────────────────────────────────────

def _register_user(user_data: UserCreate, db: Session) -> dict:
    """Shared registration logic."""
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Called by auth.ts → POST /api/register"""
    return _register_user(user_data, db)


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def auth_register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register alias. Called by api.ts → POST /api/auth/register"""
    return _register_user(user_data, db)


# ── Login ─────────────────────────────────────────────────────────────────────

def _authenticate_user(username: str, password: str, db: Session) -> User:
    """Look up user by email and verify password."""
    user = db.query(User).filter(User.email == username).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login endpoint (form-urlencoded). Called by auth.ts → POST /api/login"""
    user = _authenticate_user(form_data.username, form_data.password, db)
    return _build_token_response(response, user)


@router.post("/auth/token", response_model=TokenResponse)
def auth_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login alias (form-urlencoded). Called by api.ts → POST /api/auth/token"""
    user = _authenticate_user(form_data.username, form_data.password, db)
    return _build_token_response(response, user)


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.post("/auth/google", response_model=TokenResponse)
def google_auth(response: Response, auth_data: GoogleAuth, db: Session = Depends(get_db)):
    """Google OAuth login / sign‑up."""
    idinfo = verify_google_token(auth_data.token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    full_name = idinfo.get("name")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create new user from Google profile
        user = User(email=email, google_id=google_id, full_name=full_name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Link Google ID and update name if missing
        changed = False
        if not user.google_id:
            user.google_id = google_id
            changed = True
        if not user.full_name and full_name:
            user.full_name = full_name
            changed = True
        if changed:
            db.commit()

    return _build_token_response(response, user)


# ── Current user ──────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the authenticated user."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
    }
