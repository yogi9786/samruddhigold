import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import verify_admin
from app.core.database import get_db
from app.models.product import ProductCreate, ProductUpdate, ProductResponse
from app.db.models import Product as DBProduct

# ──────────────────────────────────────────────────────────────────────────────
# Public product routes — No authentication required
# ──────────────────────────────────────────────────────────────────────────────
public_router = APIRouter(prefix="/products", tags=["🛍️ Products — Public"])

# ──────────────────────────────────────────────────────────────────────────────
# Admin product routes — Authentication required
# ──────────────────────────────────────────────────────────────────────────────
admin_router = APIRouter(prefix="/products", tags=["🔐 Admin — Product Management"])

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Public Routes ─────────────────────────────────────────────────────────────

@public_router.get(
    "",
    response_model=List[ProductResponse],
    summary="Get all products (public)"
)
async def get_all_products(db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Retrieve all available products.
    """
    result = await db.execute(select(DBProduct).limit(1000))
    products = result.scalars().all()
    return products


@public_router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product by ID (public)"
)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Get a specific product by its ID.
    """
    result = await db.execute(select(DBProduct).where(DBProduct.id == product_id))
    product = result.scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.post(
    "/upload-image",
    response_model=dict,
    summary="Upload a product image (admin only)"
)
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    admin: dict = Depends(verify_admin),
):
    """
    **Admin only** — Requires Bearer token.
    Upload a product image. Returns the public URL of the uploaded image.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/api/uploads/{file.filename}"}


@admin_router.post(
    "/upload-gallery",
    response_model=dict,
    summary="Upload multiple product gallery images (admin only)"
)
async def upload_gallery_images(
    request: Request,
    files: List[UploadFile] = File(...),
    admin: dict = Depends(verify_admin),
):
    """
    **Admin only** — Requires Bearer token.
    Upload multiple images for a product gallery. Returns list of public URLs.
    """
    urls = []
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' must be an image")

        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        urls.append(f"/api/uploads/{file.filename}")

    return {"urls": urls}


@admin_router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product (admin only)"
)
async def create_product(product: ProductCreate, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    """
    **Admin only** — Requires Bearer token.
    Create a new product listing.
    """
    product_dict = product.model_dump()
    db_product = DBProduct(**product_dict)
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    return db_product


@admin_router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product (admin only)"
)
@admin_router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Partially update a product (admin only)"
)
async def update_product(product_id: str, product_update: ProductUpdate, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    """
    **Admin only** — Requires Bearer token.
    Update a specific product's details.
    """
    result = await db.execute(select(DBProduct).where(DBProduct.id == product_id))
    db_product = result.scalars().first()

    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    update_data = product_update.model_dump(exclude_unset=True)

    if update_data:
        for key, value in update_data.items():
            setattr(db_product, key, value)
        await db.commit()
        await db.refresh(db_product)

    return db_product


@admin_router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product (admin only)"
)
async def delete_product(product_id: str, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    """
    **Admin only** — Requires Bearer token.
    Delete a specific product.
    """
    result = await db.execute(select(DBProduct).where(DBProduct.id == product_id))
    db_product = result.scalars().first()

    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    await db.delete(db_product)
    await db.commit()
    return None


# Include both sub-routers
router.include_router(public_router)
router.include_router(admin_router)
