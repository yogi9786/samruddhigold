import os
import json
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db import models
from app.core.config import settings

# This script reads the data from db.json and seeds it into the PostgreSQL database.

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db.json")

async def seed_data():
    if not os.path.exists(DB_FILE):
        print(f"Error: Could not find {DB_FILE}")
        return

    print("Loading data from db.json...")
    with open(DB_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Connecting to database at {settings.DATABASE_URL.split('@')[-1]}...")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        print("Creating tables if they don't exist...")
        await conn.run_sync(models.Base.metadata.create_all)

    async with async_session() as session:
        # Seed Categories
        categories = data.get("categories", [])
        for cat in categories:
            # Check if exists
            existing = await session.get(models.Category, cat["id"])
            if not existing:
                print(f"Adding category: {cat['name']}")
                new_cat = models.Category(**cat)
                session.add(new_cat)
        
        # Seed Products
        products = data.get("products", [])
        for prod in products:
            existing = await session.get(models.Product, prod["id"])
            if not existing:
                print(f"Adding product: {prod['name']}")
                new_prod = models.Product(**prod)
                session.add(new_prod)
                
        await session.commit()
        print("Database seeding complete!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
