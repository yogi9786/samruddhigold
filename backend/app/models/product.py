from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field

# ── Nested Models for Product Details ─────────────────────────────────────────

class PriceBreakup(BaseModel):
    metal_value: Optional[float] = None
    gold_rate: Optional[Union[str, float]] = None
    gold_weight: Optional[Union[str, float]] = None
    stone_value: Optional[float] = None
    stone_weight: Optional[Union[str, float]] = None
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
    approx_gross_weight: Optional[Union[str, float]] = None

class StoneInfo(BaseModel):
    stone_1_name: Optional[str] = None
    stone_1_weight: Optional[Union[str, float]] = None
    diamond_type: Optional[str] = None
    diamond_clarity: Optional[str] = None
    diamond_color: Optional[str] = None
    total_diamond_weight: Optional[Union[str, float]] = None
    no_of_diamonds: Optional[Union[str, int]] = None
    stone_shape: Optional[str] = None
    stone_setting: Optional[str] = None

class OtherInfo(BaseModel):
    chain_included: Optional[str] = None
    earring_type: Optional[str] = None
    gold_certification: Optional[str] = None
    metal_finish: Optional[str] = None
    occasion: Optional[str] = None
    hallmark: Optional[str] = None
    gender: Optional[str] = None
    ring_size: Optional[Union[str, float, int]] = None
    bangle_size: Optional[Union[str, float, int]] = None

class ReturnPolicy(BaseModel):
    return_days: Optional[str] = None

class ProductDimensions(BaseModel):
    length: Optional[Union[str, float]] = None
    width: Optional[Union[str, float]] = None
    height: Optional[Union[str, float]] = None

class ProductAttribute(BaseModel):
    name: str
    value: str
    visible: Optional[bool] = True
    variation: Optional[bool] = False

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
    gallery_urls: Optional[List[str]] = None
    category_id: Optional[str] = None
    is_on_sale: Optional[bool] = False
    sale_price: Optional[float] = None
    sale_label: Optional[str] = None
    status: Optional[str] = 'active'   # active | draft | archived
    stock: Optional[int] = 0
    weight: Optional[str] = None
    tags: Optional[str] = None
    vendor: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = 1
    
    # Detailed sections
    price_breakup: Optional[PriceBreakup] = None
    basic_info: Optional[BasicInfo] = None
    stone_info: Optional[StoneInfo] = None
    other_info: Optional[OtherInfo] = None
    return_policy: Optional[ReturnPolicy] = None

    # WooCommerce professional fields
    product_type: Optional[str] = 'simple'
    slug: Optional[str] = None
    short_description: Optional[str] = None
    manage_stock: Optional[bool] = False
    allow_backorders: Optional[str] = 'no'
    low_stock_threshold: Optional[int] = None
    sold_individually: Optional[bool] = False
    dimensions: Optional[ProductDimensions] = None
    shipping_class: Optional[str] = None
    upsells: Optional[List[str]] = None
    cross_sells: Optional[List[str]] = None
    attributes: Optional[List[ProductAttribute]] = None
    purchase_note: Optional[str] = None
    menu_order: Optional[int] = 0
    enable_reviews: Optional[bool] = True

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
    gallery_urls: Optional[List[str]] = None
    category_id: Optional[str] = None
    is_on_sale: Optional[bool] = None
    sale_price: Optional[float] = None
    sale_label: Optional[str] = None
    status: Optional[str] = None
    stock: Optional[int] = None
    weight: Optional[str] = None
    tags: Optional[str] = None
    vendor: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    price_breakup: Optional[PriceBreakup] = None
    basic_info: Optional[BasicInfo] = None
    stone_info: Optional[StoneInfo] = None
    other_info: Optional[OtherInfo] = None
    return_policy: Optional[ReturnPolicy] = None

    # WooCommerce professional fields
    product_type: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    manage_stock: Optional[bool] = None
    allow_backorders: Optional[str] = None
    low_stock_threshold: Optional[int] = None
    sold_individually: Optional[bool] = None
    dimensions: Optional[ProductDimensions] = None
    shipping_class: Optional[str] = None
    upsells: Optional[List[str]] = None
    cross_sells: Optional[List[str]] = None
    attributes: Optional[List[ProductAttribute]] = None
    purchase_note: Optional[str] = None
    menu_order: Optional[int] = None
    enable_reviews: Optional[bool] = None

class ProductResponse(ProductBase):
    """Model returned to the client, includes id."""
    id: str

    class Config:
        populate_by_name = True
        from_attributes = True
