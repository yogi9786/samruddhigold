from typing import Optional
from pydantic import BaseModel, EmailStr


# ── Auth Models ───────────────────────────────────────────────────────────────

class Token(BaseModel):
    """Response model for successful login."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data decoded from a JWT token."""
    username: Optional[str] = None


class GoogleLoginRequest(BaseModel):
    """Payload received from Google Sign-In button on the frontend."""
    credential: str


# ── User Models ───────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = False


class UserInDB(UserBase):
    """User model as stored in the database (includes hashed password)."""
    hashed_password: str


class UserResponse(UserBase):
    """Safe user model returned to the client (no password)."""
    id: str
    auth_provider: str = "local"

    class Config:
        populate_by_name = True
        from_attributes = True


class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str


class AdminUpdateUser(BaseModel):
    """Admin endpoint payload to update a user's details."""
    full_name: Optional[str] = None
    email: Optional[str] = None
    disabled: Optional[bool] = None
    password: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class UserUpdate(BaseModel):
    """Model for updating an existing user."""
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    disabled: Optional[bool] = None
