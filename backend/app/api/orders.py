from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import verify_admin, get_current_user
from app.core.database import get_db
from app.models.order import OrderCreate, OrderUpdate, OrderResponse
from app.db.models import Order as DBOrder

user_router = APIRouter(prefix="/orders", tags=["📦 Orders — User"])
admin_router = APIRouter(prefix="/orders", tags=["🔐 Admin — Order Management"])
router = APIRouter()

# ── User Routes ─────────────────────────────────────────────────────────────

@user_router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order (requires auth)"
)
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order_dict = order.model_dump()
    order_dict["created_at"] = datetime.now(timezone.utc)
    order_dict["updated_at"] = order_dict["created_at"]
    
    # Extract username safely whether current_user is a dict (admin) or DBUser instance
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    order_dict["user_username"] = username
    
    # Nested items need to be converted to dicts to be stored in JSON column
    if "items" in order_dict:
        order_dict["items"] = [item if isinstance(item, dict) else item.model_dump() for item in order_dict.get("items", [])]
        
    db_order = DBOrder(**order_dict)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order

@user_router.get(
    "/my-orders",
    response_model=List[OrderResponse],
    summary="Get current user's orders"
)
async def get_my_orders(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    result = await db.execute(select(DBOrder).where(DBOrder.user_username == username))
    orders = result.scalars().all()
    return orders

# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.get(
    "",
    response_model=List[OrderResponse],
    summary="Get all orders (admin only)"
)
async def get_all_orders(admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBOrder).limit(1000))
    orders = result.scalars().all()
    return orders

@admin_router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update order status (admin only)"
)
@admin_router.patch(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Partially update order status (admin only)"
)
async def update_order(order_id: str, order_update: OrderUpdate, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBOrder).where(DBOrder.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    update_data = order_update.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        await db.commit()
        await db.refresh(db_order)
    
    return db_order

router.include_router(user_router)
router.include_router(admin_router)
