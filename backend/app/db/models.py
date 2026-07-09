import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, DateTime, JSON, Text, Integer
from app.core.database import Base

def generate_uuid():
    return uuid.uuid4().hex

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    disabled = Column(Boolean, default=False)

class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    sku = Column(String, nullable=False, unique=True, index=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    discount_text = Column(String, nullable=True)
    ready_to_dispatch = Column(Boolean, default=False)
    transit_insurance = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    gallery_urls = Column(JSON, nullable=True)
    category_id = Column(String, nullable=True, index=True)
    is_on_sale = Column(Boolean, default=False)
    sale_price = Column(Float, nullable=True)
    sale_label = Column(String, nullable=True)
    status = Column(String, default="active")
    stock = Column(Integer, default=0)
    weight = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    seo_title = Column(String, nullable=True)
    seo_description = Column(String, nullable=True)
    
    # Store nested details as JSON for flexibility, similar to NoSQL structure
    price_breakup = Column(JSON, nullable=True)
    basic_info = Column(JSON, nullable=True)
    stone_info = Column(JSON, nullable=True)
    other_info = Column(JSON, nullable=True)
    return_policy = Column(JSON, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=generate_uuid)
    items = Column(JSON, nullable=False)
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(Text, nullable=False)
    contact_phone = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    user_username = Column(String, nullable=False)
    status = Column(String, default="Pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class MetalPrice(Base):
    __tablename__ = "metal_prices"
    id = Column(String, primary_key=True)  # e.g., "gold_22k", "gold_24k", "silver"
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String, default="1g")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
