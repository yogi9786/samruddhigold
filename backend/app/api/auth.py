from datetime import timedelta
import os
import re

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import authenticate_user, create_access_token, get_current_user, verify_admin
from app.core.config import settings
from app.core.database import get_db
from app.models.auth import Token, UserResponse

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
