from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.product import ProductResponse

class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemCreate(CartItemBase):
    user_id: str
    phone: Optional[str] = None


class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True
