from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.core.security import verify_admin
from app.core.database import get_category_collection
from app.models.category import CategoryCreate, CategoryUpdate, CategoryResponse

public_router = APIRouter(prefix="/categories", tags=["📂 Categories — Public"])
admin_router = APIRouter(prefix="/categories", tags=["🔐 Admin — Category Management"])
router = APIRouter()

# ── Public Routes ─────────────────────────────────────────────────────────────

@public_router.get(
    "",
    response_model=List[CategoryResponse],
    summary="Get all categories (public)"
)
async def get_all_categories():
    collection = get_category_collection()
    categories = await collection.find().to_list(1000)
    for cat in categories:
        cat["id"] = str(cat.pop("_id"))
    return categories

@public_router.get(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Get a category by ID (public)"
)
async def get_category(category_id: str):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    collection = get_category_collection()
    cat = await collection.find_one({"_id": ObjectId(category_id)})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat["id"] = str(cat.pop("_id"))
    return cat

# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category (admin only)"
)
async def create_category(category: CategoryCreate, admin: dict = Depends(verify_admin)):
    collection = get_category_collection()
    result = await collection.insert_one(category.model_dump())
    created = await collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created.pop("_id"))
    return created

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
async def update_category(category_id: str, category_update: CategoryUpdate, admin: dict = Depends(verify_admin)):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    collection = get_category_collection()
    update_data = category_update.model_dump(exclude_unset=True)
    if update_data:
        result = await collection.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Category not found")
    
    updated = await collection.find_one({"_id": ObjectId(category_id)})
    updated["id"] = str(updated.pop("_id"))
    return updated

@admin_router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a category (admin only)"
)
async def delete_category(category_id: str, admin: dict = Depends(verify_admin)):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    collection = get_category_collection()
    result = await collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return None

router.include_router(public_router)
router.include_router(admin_router)
