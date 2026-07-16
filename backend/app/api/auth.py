from datetime import timedelta
import os
import re

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import authenticate_user, create_access_token, get_current_user, verify_admin, get_password_hash
from app.core.config import settings
from app.core.database import get_db
from app.models.auth import Token, UserResponse, GoogleLoginRequest
from app.db.models import User
from sqlalchemy import select
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# ──────────────────────────────────────────────────────────────────────────────
# Public auth routes
# ──────────────────────────────────────────────────────────────────────────────
public_router = APIRouter(prefix="/auth", tags=["🔑 Auth — Login"])

# ──────────────────────────────────────────────────────────────────────────────
# Protected auth routes (requires valid token)
# ──────────────────────────────────────────────────────────────────────────────
protected_router = APIRouter(prefix="/auth", tags=["🔐 Admin — Auth"])

router = APIRouter()


@public_router.post(
    "/token",
    response_model=Token,
    summary="Login — get access token (public)"
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    **Public endpoint** — No authentication required.
    Submit `username` and `password` as form data.
    Returns a JWT Bearer token on success. Use this token in the **Authorize** button above.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = user.username if not isinstance(user, dict) else user["username"]

    access_token = create_access_token(
        data={"sub": username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@public_router.get(
    "/google-client-id",
    summary="Get Google Client ID"
)
async def get_google_client_id():
    """
    Returns the public Google Client ID for the frontend.
    """
    return {"client_id": settings.GOOGLE_CLIENT_ID or ""}



@public_router.post(
    "/google",
    response_model=Token,
    summary="Login with Google"
)
async def login_with_google(
    request: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    **Public endpoint** — Authenticate using a Google ID token.
    If the user does not exist, they are automatically registered.
    Returns our standard JWT access token.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Sign-In is not configured on the server."
        )

    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            request.credential, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        # ID token is valid. Extract user info.
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email.")
            
        full_name = idinfo.get("name", "")
        
        # Check if user exists by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            # Create a new user automatically
            # We use the email as the username since usernames must be unique
            base_username = email.split('@')[0]
            # Ensure unique username
            check_unq = await db.execute(select(User).where(User.username == base_username))
            if check_unq.scalars().first():
                base_username = f"{base_username}_{secrets.token_hex(4)}"
                
            new_user = User(
                username=base_username,
                email=email,
                full_name=full_name,
                hashed_password=await get_password_hash(secrets.token_urlsafe(32)),
                auth_provider="google"
            )
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            user = new_user
        else:
            # If user exists but is not marked as a google user, update them
            if getattr(user, "auth_provider", None) != "google":
                user.auth_provider = "google"
                await db.commit()
                await db.refresh(user)
            
        # Issue our standard JWT access token
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@protected_router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current logged-in user profile"
)
async def read_current_user(current_user = Depends(get_current_user)):
    """
    **Requires Bearer token.**
    Returns the profile of the currently authenticated user.
    """
    return current_user

@protected_router.post(
    "/update-password",
    summary="Update user password"
)
async def update_user_password(
    new_password: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    **Requires Bearer token.**
    Updates the password for the current user.
    """
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    result = await db.execute(select(User).where(User.username == username))
    user_record = result.scalars().first()
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_record.hashed_password = await get_password_hash(new_password)
    await db.commit()
    return {"message": "Password updated successfully"}


# Include both sub-routers
router.include_router(public_router)
router.include_router(protected_router)



@protected_router.post(
    "/change-password",
    summary="Change admin password"
)
async def change_admin_password(
    current_password: str = Body(...),
    new_password: str = Body(...),
    current_user = Depends(get_current_user)
):
    """
    **Requires Bearer token.**
    Change the admin account password. Updates the .env file with the new password.
    """
    # Verify caller is admin
    is_admin = current_user.get("is_admin") if isinstance(current_user, dict) else False
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin can change admin password")

    # Verify current password
    if current_password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if len(new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters")

    # Update .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env")
    try:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                content = f.read()
            # Replace or append ADMIN_PASSWORD
            if "ADMIN_PASSWORD" in content:
                content = re.sub(r"ADMIN_PASSWORD=.*", f"ADMIN_PASSWORD={new_password}", content)
            else:
                content += f"\nADMIN_PASSWORD={new_password}"
            with open(env_path, "w") as f:
                f.write(content)

        # Update in-memory setting for current session
        settings.ADMIN_PASSWORD = new_password
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update password: {str(e)}")

    return {"message": "Password updated successfully. Please restart the server for changes to persist across restarts."}
