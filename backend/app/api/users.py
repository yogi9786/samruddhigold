from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_password_hash, get_current_user, verify_admin
from app.core.database import get_db
from app.models.auth import UserResponse, UserCreate, UserUpdate
from app.db.models import User as DBUser, Order as DBOrder, Payment as DBPayment, CartItem as DBCartItem, WishlistItem as DBWishlistItem

# ──────────────────────────────────────────────────────────────────────────────
# Public User routes — No authentication required
# ──────────────────────────────────────────────────────────────────────────────
public_router = APIRouter(prefix="/users", tags=["👤 User — Public"])

# ──────────────────────────────────────────────────────────────────────────────
# Admin User management routes — Authentication required
# ──────────────────────────────────────────────────────────────────────────────
admin_router = APIRouter(prefix="/users", tags=["🔐 Admin — User Management"])

router = APIRouter()


import secrets

@public_router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (public)"
)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Register a new user account with Email, Phone, Full Name, and Password.
    """
    # Check email duplicate
    if user.email:
        res_email = await db.execute(select(DBUser).where(DBUser.email == user.email))
        if res_email.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this Email is already registered. Please Sign In."
            )

    # Check phone duplicate
    if user.phone:
        cleaned_p = "".join(filter(str.isdigit, user.phone))
        if len(cleaned_p) >= 10:
            res_phone = await db.execute(select(DBUser).where(DBUser.phone.endswith(cleaned_p[-10:])))
            if res_phone.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this Phone Number is already registered. Please Sign In."
                )

    user_dict = user.model_dump(exclude={"password"})

    # Auto-generate unique username if not provided
    if not user_dict.get("username"):
        if user.email:
            base_un = user.email.split('@')[0]
        elif user.phone:
            base_un = f"user_{user.phone[-10:] if len(user.phone) >= 10 else user.phone}"
        else:
            base_un = f"user_{secrets.token_hex(4)}"

        check_unq = await db.execute(select(DBUser).where(DBUser.username == base_un))
        if check_unq.scalars().first():
            base_un = f"{base_un}_{secrets.token_hex(3)}"
        user_dict["username"] = base_un

    hashed_password = await get_password_hash(user.password)
    db_user = DBUser(**user_dict, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user



@public_router.put(
    "/me/profile",
    response_model=UserResponse,
    summary="Update current user's profile"
)
async def update_my_profile(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    **Requires Bearer token.**
    Allows the logged-in user to update their own full_name, email, phone, and username.
    """
    if isinstance(current_user, dict):
        username = current_user.get("username")
        result = await db.execute(select(DBUser).where(DBUser.username == username))
        user = result.scalars().first()
        if not user:
            user = DBUser(
                username=username or "admin",
                email="admin@sirisamruddhigold.com",
                full_name="Admin User",
                hashed_password=await get_password_hash("adminpassword")
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
    else:
        user = current_user

    user_id = user.id


    update_data = user_update.model_dump(exclude_unset=True)

    # Check for username conflict if changed
    if "username" in update_data and update_data["username"] and update_data["username"] != user.username:
        unq_check = await db.execute(
            select(DBUser).where(DBUser.username == update_data["username"], DBUser.id != user_id)
        )
        if unq_check.scalars().first():
            raise HTTPException(status_code=400, detail="Username is already taken by another user")

    # Check for email conflict if changed
    if "email" in update_data and update_data["email"] and update_data["email"] != user.email:
        unq_check = await db.execute(
            select(DBUser).where(DBUser.email == update_data["email"], DBUser.id != user_id)
        )
        if unq_check.scalars().first():
            raise HTTPException(status_code=400, detail="Email is already registered by another user")

    if "password" in update_data:
        hashed_password = await get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]

    for key, value in update_data.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return user



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


@admin_router.get(
    "/{user_id}/comprehensive",
    summary="Get comprehensive user details (admin only)"
)
async def get_user_comprehensive(user_id: str, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    """
    **Admin only** — Requires Bearer token.
    Get a specific user's full details including orders, payments, cart, and wishlist.
    """
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    username = user.username
    
    # Fetch Orders
    orders_result = await db.execute(select(DBOrder).where(DBOrder.user_username == username))
    orders = orders_result.scalars().all()
    
    # Fetch Payments (Joined with Orders where possible, but we'll fetch via order IDs)
    order_ids = [order.id for order in orders]
    payments = []
    if order_ids:
        payments_result = await db.execute(select(DBPayment).where(DBPayment.order_id.in_(order_ids)))
        payments = payments_result.scalars().all()
        
    # Fetch Cart Items (using session_id as user_id for logged in users)
    cart_result = await db.execute(select(DBCartItem).where(DBCartItem.user_id == user_id))
    cart_items = cart_result.scalars().all()
    
    # Fetch Wishlist Items
    wishlist_result = await db.execute(select(DBWishlistItem).where(DBWishlistItem.user_id == user_id))
    wishlist_items = wishlist_result.scalars().all()
    
    return jsonable_encoder({
        "user": user,
        "orders": orders,
        "payments": payments,
        "cart": cart_items,
        "wishlist": wishlist_items
    })


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
        hashed_password = await get_password_hash(update_data["password"])
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


# ──────────────────────────────────────────────────────────────────────────────
# Authenticated User routes
# ──────────────────────────────────────────────────────────────────────────────
me_router = APIRouter(prefix="/users/me", tags=["👤 User — Authenticated"])

@me_router.put(
    "/addresses",
    summary="Update saved addresses"
)
async def update_my_addresses(
    addresses: List[dict],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    **Requires Bearer token.**
    Update the user's saved addresses array.
    """
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    result = await db.execute(select(DBUser).where(DBUser.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.addresses = addresses
    await db.commit()
    return {"message": "Addresses updated successfully", "addresses": user.addresses}


@me_router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile details"
)
async def update_my_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    **Requires Bearer token.**
    Update the user's profile info (full_name, email, phone).
    """
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    result = await db.execute(select(DBUser).where(DBUser.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name
    if profile_data.email is not None:
        user.email = profile_data.email
    if profile_data.phone is not None:
        user.phone = profile_data.phone
    if profile_data.password:
        user.hashed_password = await get_password_hash(profile_data.password)

    await db.commit()
    await db.refresh(user)
    return user


# Include all sub-routers
router.include_router(public_router)
router.include_router(admin_router)
router.include_router(me_router)
