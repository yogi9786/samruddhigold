from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_password_hash, get_current_user, verify_admin
from app.core.database import get_db
from app.models.auth import UserResponse, UserCreate, UserUpdate
from app.db.models import User as DBUser

# ──────────────────────────────────────────────────────────────────────────────
# Public User routes — No authentication required
# ──────────────────────────────────────────────────────────────────────────────
public_router = APIRouter(prefix="/users", tags=["👤 User — Public"])

# ──────────────────────────────────────────────────────────────────────────────
# Admin User management routes — Authentication required
# ──────────────────────────────────────────────────────────────────────────────
admin_router = APIRouter(prefix="/users", tags=["🔐 Admin — User Management"])

router = APIRouter()


@public_router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (public)"
)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Register a new user account with username and password.
    """
    result = await db.execute(select(DBUser).where(DBUser.username == user.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump(exclude={"password"})

    db_user = DBUser(**user_dict, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user


@admin_router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users (admin only)"
)
async def get_all_users(admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    """
    **Admin only** — Requires Bearer token.
    Retrieve all registered users.
    """
    result = await db.execute(select(DBUser).limit(1000))
    users = result.scalars().all()
    return users


@admin_router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get a user by ID (admin only)"
)
async def get_user(user_id: str, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    """
    **Admin only** — Requires Bearer token.
    Get a specific user by ID.
    """
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@admin_router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user (admin or self)"
)
@admin_router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Partially update a user (admin or self)"
)
async def update_user(user_id: str, user_update: UserUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    **Requires Bearer token.**
    Update a user profile. Users can only update their own profile.
    Admins can update any profile.
    """
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if current_user.get("username") != user.username and not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    update_data = user_update.model_dump(exclude_unset=True)

    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]

    for key, value in update_data.items():
        setattr(user, key, value)
        
    await db.commit()
    await db.refresh(user)
    return user


@admin_router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user (admin or self)"
)
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    **Requires Bearer token.**
    Delete a user. Users can only delete their own account. Admins can delete any.
    """
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if current_user.get("username") != user.username and not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user"
        )

    await db.delete(user)
    await db.commit()
    return None


# Include both sub-routers
router.include_router(public_router)
router.include_router(admin_router)
