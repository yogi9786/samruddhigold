from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class VirtualShoppingBookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city_or_country: str
    category: str
    language: str
    requirement_details: Optional[str] = None
    booking_date: str
    booking_time: str

class VirtualShoppingBookingUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city_or_country: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    requirement_details: Optional[str] = None
    booking_date: Optional[str] = None
    booking_time: Optional[str] = None
    status: Optional[str] = None

class VirtualShoppingBookingResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    city_or_country: str
    category: str
    language: str
    requirement_details: Optional[str] = None
    booking_date: str
    booking_time: str
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
