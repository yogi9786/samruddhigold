from typing import Optional
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        populate_by_name = True
        from_attributes = True
