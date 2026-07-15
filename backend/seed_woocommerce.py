import asyncio
import os
import sys

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import async_session
from app.db.models import Category, Product

async def seed_data():
    async with async_session() as db:
        print("Seeding Categories...")
        # Create Parent Category: Gold
        gold_parent = Category(name="Gold", slug="gold", description="Premium 22K and 24K Gold Jewelry")
        db.add(gold_parent)
        await db.commit()
        await db.refresh(gold_parent)
        
        # Create Sub Categories: Gold Chains, Gold Bangles, Gold Rings, Gold Necklaces
        gold_chains = Category(name="Gold Chains", slug="gold-chains", parent_id=gold_parent.id, description="Elegant Gold Chains")
        gold_bangles = Category(name="Gold Bangles", slug="gold-bangles", parent_id=gold_parent.id, description="Traditional and Modern Gold Bangles")
        gold_rings = Category(name="Gold Rings", slug="gold-rings", parent_id=gold_parent.id, description="Beautiful Gold Rings")
        gold_necklaces = Category(name="Gold Necklaces", slug="gold-necklaces", parent_id=gold_parent.id, description="Stunning Gold Necklaces")
        
        db.add_all([gold_chains, gold_bangles, gold_rings, gold_necklaces])
        await db.commit()
        await db.refresh(gold_chains)
        await db.refresh(gold_bangles)
        await db.refresh(gold_rings)
        await db.refresh(gold_necklaces)
        
        print("Categories seeded successfully.")
        
        print("Seeding Products...")
        
        p1 = Product(
            name="22K Classic Rope Chain",
            sku="GC-1001",
            price=45000,
            original_price=50000,
            category_id=gold_chains.id,
            description="A classic 22K gold rope chain perfect for daily wear.",
            short_description="Classic rope chain in 22K gold",
            product_type="simple",
            slug="22k-classic-rope-chain",
            manage_stock=True,
            stock=10,
            image_url="https://images.unsplash.com/photo-1599643477873-fc3ee62f59ce?auto=format&fit=crop&w=800&q=80",
            status="active"
        )
        
        p2 = Product(
            name="22K Traditional Gold Bangle",
            sku="GB-1001",
            price=85000,
            original_price=90000,
            category_id=gold_bangles.id,
            description="Traditional 22K gold bangle with intricate carvings.",
            short_description="Traditional carved gold bangle",
            product_type="simple",
            slug="22k-traditional-gold-bangle",
            manage_stock=True,
            stock=5,
            image_url="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
            status="active"
        )
        
        p3 = Product(
            name="22K Diamond Accent Gold Ring",
            sku="GR-1001",
            price=35000,
            original_price=38000,
            category_id=gold_rings.id,
            description="Elegant gold ring featuring a subtle diamond accent.",
            short_description="Gold ring with diamond accent",
            product_type="simple",
            slug="22k-diamond-accent-gold-ring",
            manage_stock=True,
            stock=15,
            image_url="https://images.unsplash.com/photo-1605100804763-247f67b8548e?auto=format&fit=crop&w=800&q=80",
            status="active"
        )
        
        p4 = Product(
            name="22K Antique Bridal Necklace",
            sku="GN-1001",
            price=250000,
            original_price=275000,
            category_id=gold_necklaces.id,
            description="Stunning antique finish 22K gold bridal necklace.",
            short_description="Antique finish bridal necklace",
            product_type="simple",
            slug="22k-antique-bridal-necklace",
            manage_stock=True,
            stock=2,
            image_url="https://images.unsplash.com/photo-1599643477873-fc3ee62f59ce?auto=format&fit=crop&w=800&q=80",
            status="active"
        )
        
        db.add_all([p1, p2, p3, p4])
        await db.commit()
        
        print("Products seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
