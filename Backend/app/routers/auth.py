from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.mysql_database import get_db
from app.core.auth import hash_password, create_access_token, verify_password, get_current_user, verify_google_token
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str

class GoogleAuth(BaseModel):
    token: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email, 
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Set cookie for browser redirect support (Integrations)
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/google")
def google_auth(response: Response, auth_data: GoogleAuth, db: Session = Depends(get_db)):
    idinfo = verify_google_token(auth_data.token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    google_id = idinfo.get("sub")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create new user
        user = User(email=email, google_id=google_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        # Link existing email to Google
        user.google_id = google_id
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Set cookie for browser redirect support (Integrations)
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        samesite="lax",
        secure=False
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}
