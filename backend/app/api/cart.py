from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.db.models import CartItem as DBCartItem, Product as DBProduct
from app.models.cart import CartItemCreate, CartItemUpdate, CartItemResponse
from app.models.product import ProductResponse
from app.core.pricing import calculate_dynamic_price, get_live_rates

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
async def add_to_cart(item: CartItemCreate, db: AsyncSession = Depends(get_db)):
    """
    Add a product to the user's cart (or increment quantity if already exists).
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

    # Fetch product details for response
    rates = await get_live_rates(db)
    product.price = calculate_dynamic_price(product, rates)
    prod_res = ProductResponse.model_validate(product)
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
