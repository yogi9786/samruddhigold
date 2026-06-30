from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.core.security import verify_admin, get_current_user
from app.core.database import get_order_collection
from app.models.order import OrderCreate, OrderUpdate, OrderResponse

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
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    collection = get_order_collection()
    order_dict = order.model_dump()
    order_dict["created_at"] = datetime.now(timezone.utc)
    order_dict["updated_at"] = order_dict["created_at"]
    order_dict["user_username"] = current_user["username"] # associate with user
    
    result = await collection.insert_one(order_dict)
    created = await collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created.pop("_id"))
    return created

@user_router.get(
    "/my-orders",
    response_model=List[OrderResponse],
    summary="Get current user's orders"
)
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    collection = get_order_collection()
    orders = await collection.find({"user_username": current_user["username"]}).to_list(1000)
    for o in orders:
        o["id"] = str(o.pop("_id"))
    return orders

# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.get(
    "",
    response_model=List[OrderResponse],
    summary="Get all orders (admin only)"
)
async def get_all_orders(admin: dict = Depends(verify_admin)):
    collection = get_order_collection()
    orders = await collection.find().to_list(1000)
    for o in orders:
        o["id"] = str(o.pop("_id"))
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
async def update_order(order_id: str, order_update: OrderUpdate, admin: dict = Depends(verify_admin)):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    collection = get_order_collection()
    update_data = order_update.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
    
    updated = await collection.find_one({"_id": ObjectId(order_id)})
    updated["id"] = str(updated.pop("_id"))
    return updated

router.include_router(user_router)
router.include_router(admin_router)
