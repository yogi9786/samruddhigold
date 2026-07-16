from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import verify_admin
from app.core.database import get_db
from app.models.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.db.models import Category as DBCategory

public_router = APIRouter(prefix="/categories", tags=["📂 Categories — Public"])
admin_router = APIRouter(prefix="/categories", tags=["🔐 Admin — Category Management"])
router = APIRouter()

# ── Public Routes ─────────────────────────────────────────────────────────────

@public_router.get(
    "",
    response_model=List[CategoryResponse],
    summary="Get all categories (public)"
)
async def get_all_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBCategory).limit(1000))
    categories = result.scalars().all()
    return categories

@public_router.get(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Get a category by ID (public)"
)
async def get_category(category_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBCategory).where(DBCategory.id == category_id))
    cat = result.scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category (admin only)"
)
async def create_category(category: CategoryCreate, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    if category.parent_id == "":
        category.parent_id = None
    db_cat = DBCategory(**category.model_dump())
    db.add(db_cat)
    await db.commit()
    await db.refresh(db_cat)
    return db_cat

@admin_router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update a category (admin only)"
)
@admin_router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Partially update a category (admin only)"
)
async def update_category(category_id: str, category_update: CategoryUpdate, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBCategory).where(DBCategory.id == category_id))
    cat = result.scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    update_data = category_update.model_dump(exclude_unset=True)
    if "parent_id" in update_data and update_data["parent_id"] == "":
        update_data["parent_id"] = None
        
    if update_data:
        for key, value in update_data.items():
            setattr(cat, key, value)
        await db.commit()
        await db.refresh(cat)
    
    return cat

@admin_router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a category (admin only)"
)
async def delete_category(category_id: str, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBCategory).where(DBCategory.id == category_id))
    cat = result.scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    await db.delete(cat)
    await db.commit()
    return None

router.include_router(public_router)
router.include_router(admin_router)
