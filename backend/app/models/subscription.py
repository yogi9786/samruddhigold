from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class SubscriptionCreate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class SubscriptionResponse(SubscriptionCreate):
    id: str
    created_at: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
