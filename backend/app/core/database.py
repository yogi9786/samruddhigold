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
    future=True
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
        logger.info("Database tables created successfully")
        
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
