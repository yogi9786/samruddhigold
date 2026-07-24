from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class ContactCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: str
    message: str
    source: Optional[str] = "general"

class ContactStatusUpdate(BaseModel):
    status: str

class ContactResponse(ContactCreate):
    id: str
    status: str = "Pending"
    created_at: datetime

    class Config:
        populate_by_name = True
