import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from bson import ObjectId

from app.core.security import get_current_user
from app.core.database import get_product_collection
from app.models.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def verify_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can perform this action"
        )
    return current_user


@router.post("/upload-image", response_model=dict, summary="Upload product image")
async def upload_image(
    file: UploadFile = File(...),
    admin: dict = Depends(verify_admin),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"http://127.0.0.1:8000/uploads/{file.filename}"}


@router.get("", response_model=List[ProductResponse], summary="Get all products")
async def get_all_products():
    """
    Retrieve all products.
    """
    products_collection = get_product_collection()
    products_cursor = products_collection.find()
    products = await products_cursor.to_list(1000)
    
    # Convert ObjectId to string for id
    for product in products:
        product["id"] = str(product.pop("_id"))
        
    return products


@router.get("/{product_id}", response_model=ProductResponse, summary="Get a product by ID")
async def get_product(product_id: str):
    """
    Get a specific product.
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


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, summary="Create a new product")
async def create_product(product: ProductCreate, admin: dict = Depends(verify_admin)):
    """
    Create a new product. Requires admin authentication.
    """
    products_collection = get_product_collection()
    
    product_dict = product.model_dump()
    result = await products_collection.insert_one(product_dict)
    
    # Fetch the created product to return it
    created_product = await products_collection.find_one({"_id": result.inserted_id})
    created_product["id"] = str(created_product.pop("_id"))
    return created_product


@router.put("/{product_id}", response_model=ProductResponse, summary="Update a product")
async def update_product(product_id: str, product_update: ProductUpdate, admin: dict = Depends(verify_admin)):
    """
    Update a specific product. Requires admin authentication.
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


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a product")
async def delete_product(product_id: str, admin: dict = Depends(verify_admin)):
    """
    Delete a specific product. Requires admin authentication.
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
