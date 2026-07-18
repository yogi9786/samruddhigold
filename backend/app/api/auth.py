from datetime import timedelta, datetime, timezone
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
import httpx
from app.models.auth import Token, UserResponse, GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest

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
            detail=f"Invalid Google token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Catch and print database or network errors
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google Login error: {type(e).__name__} - {str(e)}"
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


@public_router.post(
    "/forgot-password",
    summary="Request a password reset link"
)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a password reset token and send an email via Brevo.
    """
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()

    if not user:
        # Prevent email enumeration by returning a generic success message
        return {"message": "If that email exists in our system, a reset link has been sent."}

    # Generate a secure token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    # Send Email via Brevo
    if settings.BREVO_API_KEY:
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        email_data = {
            "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
            "to": [{"email": user.email, "name": user.full_name or user.username}],
            "subject": "Password Reset Request",
            "htmlContent": f"""
            <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>Hi {user.full_name or user.username},</p>
                    <p>You requested to reset your password. Click the link below to set a new password. This link will expire in 15 minutes.</p>
                    <p><a href="{reset_link}" style="display:inline-block;padding:10px 20px;background-color:#5F1517;color:white;text-decoration:none;border-radius:5px;">Reset Password</a></p>
                    <p>If you did not request this, please ignore this email.</p>
                </body>
            </html>
            """
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.brevo.com/v3/smtp/email",
                    json=email_data,
                    headers={
                        "api-key": settings.BREVO_API_KEY,
                        "accept": "application/json",
                        "content-type": "application/json"
                    }
                )
                response.raise_for_status()
            except Exception as e:
                print(f"Failed to send email via Brevo: {e}")
                # We can choose to raise an error or just let the token generate
                # raise HTTPException(status_code=500, detail="Failed to send reset email.")

    return {"message": "If that email exists in our system, a reset link has been sent."}


@public_router.post(
    "/reset-password",
    summary="Reset password using a token"
)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify the reset token and update the user's password.
    """
    result = await db.execute(
        select(User).where(
            User.reset_token == request.token,
            User.reset_token_expires > datetime.now(timezone.utc)
        )
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Hash the new password and update user
    user.hashed_password = await get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()

    return {"message": "Password successfully reset"}



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
