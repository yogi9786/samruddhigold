from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import json

from app.core.database import get_db
from app.core.config import settings
from app.db.models import CartItem as DBCartItem, Product as DBProduct, User as DBUser
from app.models.cart import CartItemCreate, CartItemUpdate, CartItemResponse
from app.models.product import ProductResponse
from app.core.pricing import calculate_dynamic_price, get_live_rates
from app.services.aisensy import send_add_to_cart_whatsapp

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/{user_id}", response_model=List[CartItemResponse])
async def get_cart(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all cart items for a specific user or guest session ID.
    """
    # Perform join query to fetch cart items + product details
    result = await db.execute(
        select(DBCartItem, DBProduct)
        .outerjoin(DBProduct, DBCartItem.product_id == DBProduct.id)
        .where(DBCartItem.user_id == user_id)
        .order_by(DBCartItem.created_at.desc())
    )
    items = result.all()
    
    rates = await get_live_rates(db)
    response_items = []
    for cart_item, product in items:
        prod_data = None
        if product:
            product.price = calculate_dynamic_price(product, rates)
            prod_data = ProductResponse.model_validate(product)
        
        response_items.append(
            CartItemResponse(
                id=cart_item.id,
                user_id=cart_item.user_id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                created_at=cart_item.created_at,
                product=prod_data
            )
        )
    return response_items

@router.post("", response_model=CartItemResponse)
@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Add a product to the user's cart (or increment quantity if already exists).
    Schedules a WhatsApp reminder message to the user via AiSensy.
    """
    # Check if product exists
    prod_check = await db.execute(select(DBProduct).where(DBProduct.id == item.product_id))
    product = prod_check.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if item already exists in cart for this user
    existing_check = await db.execute(
        select(DBCartItem)
        .where(DBCartItem.user_id == item.user_id)
        .where(DBCartItem.product_id == item.product_id)
    )
    existing_item = existing_check.scalars().first()

    if existing_item:
        existing_item.quantity += item.quantity
        await db.commit()
        await db.refresh(existing_item)
        target_item = existing_item
    else:
        new_item = DBCartItem(
            user_id=item.user_id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        target_item = new_item

    # Fetch product details for response & calculate price
    rates = await get_live_rates(db)
    product.price = calculate_dynamic_price(product, rates)
    prod_res = ProductResponse.model_validate(product)

    # ─── Trigger AiSensy WhatsApp Notification ────────────────────────────────
    recipient_phone = item.phone
    user_name = None

    # If phone was not explicitly passed in payload, look up user profile by user_id
    if not recipient_phone and item.user_id and not item.user_id.startswith("guest_"):
        user_check = await db.execute(
            select(DBUser).where((DBUser.id == item.user_id) | (DBUser.username == item.user_id))
        )
        user_rec = user_check.scalars().first()
        if user_rec:
            recipient_phone = user_rec.phone
            user_name = user_rec.full_name or user_rec.username

    if recipient_phone:
        # Build full absolute image URL for WhatsApp media
        raw_img = product.image_url
        if raw_img and raw_img.startswith('[') and raw_img.endswith(']'):
            try:
                arr = json.loads(raw_img)
                if isinstance(arr, list) and len(arr) > 0:
                    raw_img = arr[0]
            except Exception:
                pass

        full_image_url = None
        if raw_img:
            if raw_img.startswith("http://") or raw_img.startswith("https://"):
                full_image_url = raw_img
            elif raw_img.startswith("/"):
                full_image_url = f"{settings.FRONTEND_URL.rstrip('/')}{raw_img}"
            else:
                full_image_url = f"{settings.FRONTEND_URL.rstrip('/')}/api/uploads/{raw_img}"

        background_tasks.add_task(
            send_add_to_cart_whatsapp,
            phone=recipient_phone,
            user_name=user_name,
            product_name=product.name,
            price=product.price,
            image_url=full_image_url,
            cart_url=f"{settings.FRONTEND_URL.rstrip('/')}/cart"
        )

    return CartItemResponse(
        id=target_item.id,
        user_id=target_item.user_id,
        product_id=target_item.product_id,
        quantity=target_item.quantity,
        created_at=target_item.created_at,
        product=prod_res
    )


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(item_id: str, update_data: CartItemUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update the quantity of a specific cart item.
    """
    result = await db.execute(select(DBCartItem).where(DBCartItem.id == item_id))
    cart_item = result.scalars().first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.quantity = update_data.quantity
    await db.commit()
    await db.refresh(cart_item)

    # Fetch product
    prod_check = await db.execute(select(DBProduct).where(DBProduct.id == cart_item.product_id))
    product = prod_check.scalars().first()
    
    prod_res = None
    if product:
        rates = await get_live_rates(db)
        product.price = calculate_dynamic_price(product, rates)
        prod_res = ProductResponse.model_validate(product)
 
    return CartItemResponse(
        id=cart_item.id,
        user_id=cart_item.user_id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        created_at=cart_item.created_at,
        product=prod_res
    )

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(item_id: str, db: AsyncSession = Depends(get_db)):
    """
    Remove an item from the cart.
    """
    result = await db.execute(select(DBCartItem).where(DBCartItem.id == item_id))
    cart_item = result.scalars().first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    await db.delete(cart_item)
    await db.commit()

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    Clear all items in the cart for a user.
    """
    result = await db.execute(select(DBCartItem).where(DBCartItem.user_id == user_id))
    items = result.scalars().all()
    for item in items:
        await db.delete(item)
    await db.commit()

from pydantic import BaseModel

class CartMergeRequest(BaseModel):
    guest_user_id: str
    target_user_id: str

@router.post("/merge")
async def merge_cart(payload: CartMergeRequest, db: AsyncSession = Depends(get_db)):
    """
    Merge guest cart items into logged in user cart upon login.
    """
    guest_id = payload.guest_user_id
    target_id = payload.target_user_id
    if not guest_id or not target_id or guest_id == target_id:
        return {"status": "ok", "merged": 0}

    g_res = await db.execute(select(DBCartItem).where(DBCartItem.user_id == guest_id))
    guest_items = g_res.scalars().all()

    merged_count = 0
    for g_item in guest_items:
        t_res = await db.execute(
            select(DBCartItem)
            .where(DBCartItem.user_id == target_id)
            .where(DBCartItem.product_id == g_item.product_id)
        )
        existing_t = t_res.scalars().first()
        if existing_t:
            existing_t.quantity += g_item.quantity
            await db.delete(g_item)
        else:
            g_item.user_id = target_id
        merged_count += 1

    await db.commit()
    return {"status": "ok", "merged": merged_count}
