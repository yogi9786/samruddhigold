from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import authenticate_user, create_access_token, get_current_user
from app.core.config import settings
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
):
    """
    **Public endpoint** — No authentication required.
    Submit `username` and `password` as form data.
    Returns a JWT Bearer token on success. Use this token in the **Authorize** button above.
    """
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@protected_router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current logged-in user profile"
)
async def read_current_user(current_user: dict = Depends(get_current_user)):
    """
    **Requires Bearer token.**
    Returns the profile of the currently authenticated user.
    """
    return current_user


# Include both sub-routers
router.include_router(public_router)
router.include_router(protected_router)
