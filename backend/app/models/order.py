from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class OrderBase(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: str
    contact_phone: str
    payment_method: str
    status: Optional[str] = "Pending"

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    shipping_address: Optional[str] = None
    contact_phone: Optional[str] = None

class OrderResponse(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
