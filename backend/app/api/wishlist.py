from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List

from app.core.database import get_db
from app.db.models import WishlistItem, Product
from app.models.wishlist import WishlistItemCreate, WishlistItemResponse
from app.models.product import ProductResponse
from app.api.auth import get_current_user
from app.db.models import User

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("/", response_model=List[ProductResponse])
async def get_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch wishlist items for the current user
    current_user_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    result = await db.execute(select(WishlistItem).where(WishlistItem.user_id == current_user_id))
    wishlist_items = result.scalars().all()
    
    if not wishlist_items:
        return []
        
    product_ids = [item.product_id for item in wishlist_items]
    
    # Fetch the corresponding products
    prod_result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = prod_result.scalars().all()
    
    return products

@router.post("/", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    item: WishlistItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    if item.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to add to this wishlist")
        
    # Check if the product exists
    product_result = await db.execute(select(Product).where(Product.id == item.product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    existing = await db.execute(
        select(WishlistItem)
        .where(WishlistItem.user_id == current_user_id)
        .where(WishlistItem.product_id == item.product_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    new_item = WishlistItem(
        user_id=item.user_id,
        product_id=item.product_id
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    result = await db.execute(
        select(WishlistItem)
        .where(WishlistItem.user_id == current_user_id)
        .where(WishlistItem.product_id == product_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
        
    await db.delete(item)
    await db.commit()
    return None
