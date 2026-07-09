from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MetalPriceBase(BaseModel):
    name: str
    price: float
    unit: str = "1g"

class MetalPriceCreate(MetalPriceBase):
    id: str

class MetalPriceUpdate(BaseModel):
    price: float
    name: Optional[str] = None
    unit: Optional[str] = None

class MetalPriceResponse(MetalPriceBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True
