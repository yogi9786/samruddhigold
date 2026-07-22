import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Declarative base for SQLAlchemy models (must be defined here so models can import it)
Base = declarative_base()

# We need to make sure the password in DATABASE_URL is properly url-encoded if it contains special characters like '@'
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=settings.DEBUG,
    future=True,
    pool_size=20,
    max_overflow=20,
    pool_timeout=30.0,
    pool_recycle=1800
)

async_session = async_sessionmaker(
    engine, 
    expire_on_commit=False, 
    class_=AsyncSession
)

async def init_db():
    """Create all tables in the database"""
    try:
        # Import models here to ensure they are registered with Base before creating tables
        from app.db import models
        async with engine.begin() as conn:
            # Uncomment the next line to drop all tables on startup (DANGEROUS IN PROD)
            # await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            
            # Execute database schema alterations to ensure all Product columns exist
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DOUBLE PRECISION;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_label VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS weight VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tags VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS price_breakup JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS basic_info JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_info JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS other_info JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS return_policy JSON;"))
            
            # Add WooCommerce professional product fields
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR DEFAULT 'simple';"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS manage_stock BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_backorders VARCHAR DEFAULT 'no';"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_individually BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_class VARCHAR;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS upsells JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS cross_sells JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSON;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_note TEXT;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS menu_order INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_reviews BOOLEAN DEFAULT TRUE;"))
            
            # Ensure Categories columns exist
            await conn.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR;"))
            await conn.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_type VARCHAR DEFAULT 'default';"))
            
            # Ensure Order columns exist for Razorpay integration & Shipping details
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS email VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS full_name VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status VARCHAR DEFAULT 'Not Shipped';"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR;"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;"))
            await conn.execute(text("ALTER TABLE orders ALTER COLUMN user_username DROP NOT NULL;"))
            
            # Ensure Users columns exist for password reset, phone, addresses
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSON;"))
        logger.info("Database tables created and migrated successfully")
        
        # Seed default metal prices if none exist
        async with async_session() as session:
            from sqlalchemy.future import select
            result = await session.execute(select(models.MetalPrice))
            existing = result.scalars().all()
            if not existing:
                session.add_all([
                    models.MetalPrice(id="gold_22k", name="Gold 22 KT", price=13230.0, unit="1g"),
                    models.MetalPrice(id="gold_24k", name="Gold 24 KT", price=14430.0, unit="1g"),
                    models.MetalPrice(id="silver", name="Silver", price=95.0, unit="1g"),
                ])
                await session.commit()
                logger.info("Metal prices seeded successfully")
    except Exception as e:
        logger.error(f"Error creating database tables or seeding: {e}")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that yields a SQLAlchemy AsyncSession.
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
