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
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    disabled = Column(Boolean, default=False)
    auth_provider = Column(String, default="local")
    addresses = Column(JSON, nullable=True)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    parent_id = Column(String, nullable=True)
    slug = Column(String, unique=True, index=True, nullable=True)
    display_type = Column(String, default="default")

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
    description = Column(Text, nullable=True)
    quantity = Column(Integer, default=1)
    
    # Store nested details as JSON for flexibility, similar to NoSQL structure
    price_breakup = Column(JSON, nullable=True)
    basic_info = Column(JSON, nullable=True)
    stone_info = Column(JSON, nullable=True)
    other_info = Column(JSON, nullable=True)
    return_policy = Column(JSON, nullable=True)

    # WooCommerce professional fields
    product_type = Column(String, default="simple")
    slug = Column(String, unique=True, index=True, nullable=True)
    short_description = Column(Text, nullable=True)
    manage_stock = Column(Boolean, default=False)
    allow_backorders = Column(String, default="no")
    low_stock_threshold = Column(Integer, nullable=True)
    sold_individually = Column(Boolean, default=False)
    dimensions = Column(JSON, nullable=True)
    shipping_class = Column(String, nullable=True)
    upsells = Column(JSON, nullable=True)
    cross_sells = Column(JSON, nullable=True)
    attributes = Column(JSON, nullable=True)
    purchase_note = Column(Text, nullable=True)
    menu_order = Column(Integer, default=0)
    enable_reviews = Column(Boolean, default=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=generate_uuid)
    items = Column(JSON, nullable=False)
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(Text, nullable=False)
    contact_phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    payment_method = Column(String, nullable=False)
    user_username = Column(String, nullable=True)  # Nullable for guest checkouts
    status = Column(String, default="Pending")
    
    # Razorpay specific fields
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    
    # Shipping & Tracking fields
    shipping_status = Column(String, default="Not Shipped")
    courier_name = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Payment(Base):
    __tablename__ = "payments"
    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, nullable=False, index=True)
    razorpay_payment_id = Column(String, nullable=False)
    razorpay_order_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Captured")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class MetalPrice(Base):
    __tablename__ = "metal_prices"
    id = Column(String, primary_key=True)  # e.g., "gold_22k", "gold_24k", "silver"
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String, default="1g")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    product_id = Column(String, nullable=False, index=True)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    product_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class VirtualShoppingBooking(Base):
    __tablename__ = "virtual_shopping_bookings"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    city_or_country = Column(String, nullable=False)
    category = Column(String, nullable=False)
    language = Column(String, nullable=False)
    requirement_details = Column(Text, nullable=True)
    booking_date = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)
    status = Column(String, default="Pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


