from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.db.models import User as DBUser

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── OAuth2 scheme ─────────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

# ── Helper functions ──────────────────────────────────────────────────────────

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def authenticate_user(db: AsyncSession, username: str, password: str):
    # Check if this is the admin user
    if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
        return {"username": settings.ADMIN_USERNAME, "is_admin": True}

    result = await db.execute(select(DBUser).where(DBUser.username == username))
    user = result.scalars().first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # If the user is the admin, return the mock admin profile
    if username == settings.ADMIN_USERNAME:
        return {"username": settings.ADMIN_USERNAME, "is_admin": True, "id": "admin"}
        
    result = await db.execute(select(DBUser).where(DBUser.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: AsyncSession = Depends(get_db)):
    if not token:
        return None
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None


async def verify_admin(current_user = Depends(get_current_user)):
    """Dependency to check if the current user is an admin."""
    # current_user might be a dict (admin) or a DBUser model
    is_admin = current_user.get("is_admin") if isinstance(current_user, dict) else False
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can perform this action"
        )
    return current_user
