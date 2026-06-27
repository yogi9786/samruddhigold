from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

# ── Nested Models for Product Details ─────────────────────────────────────────

class PriceBreakup(BaseModel):
    metal_value: Optional[float] = None
    gold_rate: Optional[str] = None
    gold_weight: Optional[str] = None
    stone_value: Optional[float] = None
    stone_weight: Optional[str] = None
    making_charges_value: Optional[float] = None
    making_charges_discount: Optional[float] = None
    making_charges_final: Optional[float] = None
    sub_total_value: Optional[float] = None
    sub_total_final: Optional[float] = None
    tax_value: Optional[float] = None
    tax_final: Optional[float] = None
    grand_total_value: Optional[float] = None
    grand_total_final: Optional[float] = None

class BasicInfo(BaseModel):
    height: Optional[str] = None
    material: Optional[str] = None
    metal: Optional[str] = None
    metal_purity: Optional[str] = None
    width: Optional[str] = None
    approx_gross_weight: Optional[str] = None

class StoneInfo(BaseModel):
    stone_1_name: Optional[str] = None
    stone_1_weight: Optional[str] = None

class OtherInfo(BaseModel):
    chain_included: Optional[str] = None
    earring_type: Optional[str] = None
    gold_certification: Optional[str] = None
    metal_finish: Optional[str] = None
    occasion: Optional[str] = None

class ReturnPolicy(BaseModel):
    return_days: Optional[str] = None

# ── Main Product Models ───────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    original_price: Optional[float] = None
    discount_text: Optional[str] = None
    ready_to_dispatch: Optional[bool] = False
    transit_insurance: Optional[bool] = False
    image_url: Optional[str] = None
    
    # Detailed sections
    price_breakup: Optional[PriceBreakup] = None
    basic_info: Optional[BasicInfo] = None
    stone_info: Optional[StoneInfo] = None
    other_info: Optional[OtherInfo] = None
    return_policy: Optional[ReturnPolicy] = None

class ProductCreate(ProductBase):
    """Model for creating a new product."""
    pass

class ProductUpdate(BaseModel):
    """Model for updating a product (all fields optional)."""
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount_text: Optional[str] = None
    ready_to_dispatch: Optional[bool] = None
    transit_insurance: Optional[bool] = None
    image_url: Optional[str] = None
    price_breakup: Optional[PriceBreakup] = None
    basic_info: Optional[BasicInfo] = None
    stone_info: Optional[StoneInfo] = None
    other_info: Optional[OtherInfo] = None
    return_policy: Optional[ReturnPolicy] = None

class ProductResponse(ProductBase):
    """Model returned to the client, includes id."""
    id: str

    class Config:
        populate_by_name = True
