from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WishlistItemBase(BaseModel):
    product_id: str

class WishlistItemCreate(WishlistItemBase):
    user_id: str

class WishlistItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    created_at: datetime

    class Config:
        from_attributes = True
