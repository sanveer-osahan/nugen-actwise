from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User
from app.schemas import Credentials, Token, UserOut
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(creds: Credentials, db: Session = Depends(get_db)) -> User:
    if db.query(User).filter(User.username == creds.username).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")
    user = User(username=creds.username, password_hash=hash_password(creds.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(creds: Credentials, db: Session = Depends(get_db)) -> Token:
    user = db.query(User).filter(User.username == creds.username).first()
    if user is None or not verify_password(creds.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    return Token(access_token=create_access_token(user.username))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user
