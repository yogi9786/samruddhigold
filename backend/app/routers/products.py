import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from bson import ObjectId

from app.core.security import get_current_user, verify_admin
from app.core.database import get_product_collection
from app.models.product import ProductCreate, ProductUpdate, ProductResponse

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
async def get_all_products():
    """
    **Public endpoint** — No authentication required.
    Retrieve all available products.
    """
    products_collection = get_product_collection()
    products_cursor = products_collection.find()
    products = await products_cursor.to_list(1000)

    for product in products:
        product["id"] = str(product.pop("_id"))

    return products


@public_router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product by ID (public)"
)
async def get_product(product_id: str):
    """
    **Public endpoint** — No authentication required.
    Get a specific product by its ID.
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    products_collection = get_product_collection()
    product = await products_collection.find_one({"_id": ObjectId(product_id)})

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product["id"] = str(product.pop("_id"))
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

    # Build URL dynamically from the request so it works on any host/domain
    # In production behind Nginx, request.base_url might be 127.0.0.1, so we override it
    base_url = str(request.base_url).rstrip("/")
    if "127.0.0.1" in base_url or "localhost" in base_url:
        # Override with production URL if we detect local proxy IP
        base_url = "http://147.93.110.125/api"
        
    return {"url": f"{base_url}/uploads/{file.filename}"}


@admin_router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product (admin only)"
)
async def create_product(product: ProductCreate, admin: dict = Depends(verify_admin)):
    """
    **Admin only** — Requires Bearer token.
    Create a new product listing.
    """
    products_collection = get_product_collection()

    product_dict = product.model_dump()
    result = await products_collection.insert_one(product_dict)

    created_product = await products_collection.find_one({"_id": result.inserted_id})
    created_product["id"] = str(created_product.pop("_id"))
    return created_product


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
async def update_product(product_id: str, product_update: ProductUpdate, admin: dict = Depends(verify_admin)):
    """
    **Admin only** — Requires Bearer token.
    Update a specific product's details.
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    products_collection = get_product_collection()

    update_data = product_update.model_dump(exclude_unset=True)

    if update_data:
        result = await products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    updated_product["id"] = str(updated_product.pop("_id"))
    return updated_product


@admin_router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product (admin only)"
)
async def delete_product(product_id: str, admin: dict = Depends(verify_admin)):
    """
    **Admin only** — Requires Bearer token.
    Delete a specific product.
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    products_collection = get_product_collection()
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return None


# Include both sub-routers
router.include_router(public_router)
router.include_router(admin_router)
