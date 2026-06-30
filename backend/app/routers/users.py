from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_password_hash, get_current_user, verify_admin
from app.core.database import get_user_collection
from app.models.auth import UserResponse, UserCreate, UserUpdate, UserInDB

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
async def create_user(user: UserCreate):
    """
    **Public endpoint** — No authentication required.
    Register a new user account with username and password.
    """
    users_collection = get_user_collection()
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict.pop("password")

    user_in_db = UserInDB(**user_dict, hashed_password=hashed_password)
    db_user_dict = user_in_db.model_dump()
    result = await users_collection.insert_one(db_user_dict)

    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))

    return created_user


@admin_router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users (admin only)"
)
async def get_all_users(admin: dict = Depends(verify_admin)):
    """
    **Admin only** — Requires Bearer token.
    Retrieve all registered users.
    """
    users_collection = get_user_collection()
    users = await users_collection.find().to_list(1000)
    for user in users:
        user["id"] = str(user.pop("_id"))
    return users


@admin_router.get(
    "/{username}",
    response_model=UserResponse,
    summary="Get a user by username (admin only)"
)
async def get_user(username: str, admin: dict = Depends(verify_admin)):
    """
    **Admin only** — Requires Bearer token.
    Get a specific user by username.
    """
    users_collection = get_user_collection()
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user["id"] = str(user.pop("_id"))
    return user


@admin_router.put(
    "/{username}",
    response_model=UserResponse,
    summary="Update a user (admin or self)"
)
@admin_router.patch(
    "/{username}",
    response_model=UserResponse,
    summary="Partially update a user (admin or self)"
)
async def update_user(username: str, user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """
    **Requires Bearer token.**
    Update a user profile. Users can only update their own profile.
    Admins can update any profile.
    """
    if current_user.get("username") != username and not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    users_collection = get_user_collection()
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_data = user_update.model_dump(exclude_unset=True)

    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]

    if update_data:
        await users_collection.update_one({"username": username}, {"$set": update_data})

    updated_user = await users_collection.find_one({"username": username})
    updated_user["id"] = str(updated_user.pop("_id"))
    return updated_user


@admin_router.delete(
    "/{username}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user (admin or self)"
)
async def delete_user(username: str, current_user: dict = Depends(get_current_user)):
    """
    **Requires Bearer token.**
    Delete a user. Users can only delete their own account. Admins can delete any.
    """
    if current_user.get("username") != username and not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user"
        )

    users_collection = get_user_collection()
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    await users_collection.delete_one({"username": username})
    return None


# Include both sub-routers
router.include_router(public_router)
router.include_router(admin_router)
