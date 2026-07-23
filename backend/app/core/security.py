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
import asyncio

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── OAuth2 scheme ─────────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

# ── Helper functions ──────────────────────────────────────────────────────────

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    return await asyncio.to_thread(pwd_context.verify, plain_password, hashed_password)


async def get_password_hash(password: str) -> str:
    return await asyncio.to_thread(pwd_context.hash, password)


from sqlalchemy import or_

async def authenticate_user(db: AsyncSession, username_or_email_or_phone: str, password: str):
    identifier = username_or_email_or_phone.strip()
    
    # Check if this is the admin user
    if identifier == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
        return {"username": settings.ADMIN_USERNAME, "is_admin": True}

    # Extract digits for flexible phone number matching
    digits = "".join(filter(str.isdigit, identifier))

    conditions = [
        DBUser.username == identifier,
        DBUser.email == identifier,
        DBUser.phone == identifier
    ]
    
    if len(digits) >= 10:
        # Match phone with or without country code prefix (e.g. last 10 digits)
        conditions.append(DBUser.phone.endswith(digits[-10:]))

    result = await db.execute(select(DBUser).where(or_(*conditions)))
    user = result.scalars().first()
    if not user:
        return None
    if not await verify_password(password, user.hashed_password):
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

    # First search database for this user (by username, email, or id)
    result = await db.execute(
        select(DBUser).where(
            or_(
                DBUser.username == username,
                DBUser.email == username,
                DBUser.id == username
            )
        )
    )
    user = result.scalars().first()
    if user:
        return user

    # If no DB record exists yet and this is the admin username, create admin DB user record
    if username == settings.ADMIN_USERNAME:
        admin_user = DBUser(
            username=settings.ADMIN_USERNAME,
            email="admin@sirisamruddhigold.com",
            full_name="Admin",
            hashed_password=await get_password_hash(settings.ADMIN_PASSWORD),
            disabled=False
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        return admin_user
        
    raise credentials_exception


async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: AsyncSession = Depends(get_db)):
    if not token:
        return None
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None


async def verify_admin(current_user = Depends(get_current_user)):
    """Dependency to check if the current user is an admin."""
    is_admin = False
    if isinstance(current_user, dict):
        is_admin = current_user.get("is_admin", False)
    elif hasattr(current_user, "username"):
        is_admin = (current_user.username == settings.ADMIN_USERNAME)
        
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can perform this action"
        )
    return current_user

