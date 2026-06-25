from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import authenticate_user, create_access_token, get_current_user
from app.core.config import settings
from app.models.auth import Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/token", response_model=Token, summary="Login and get access token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    Accepts **username** and **password** as form data.
    Returns a JWT bearer token on success.
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


@router.get("/me", response_model=UserResponse, summary="Get current logged-in user")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    return current_user
