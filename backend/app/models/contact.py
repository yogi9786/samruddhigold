from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class ContactResponse(ContactCreate):
    id: str
    created_at: datetime

    class Config:
        populate_by_name = True
