from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float
    product: Optional[dict] = None

class OrderBase(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: str
    contact_phone: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    payment_method: str
    status: Optional[str] = "Pending"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    user_username: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    shipping_address: Optional[str] = None
    contact_phone: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class OrderResponse(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
