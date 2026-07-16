import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    print("Starting database migration...")
    async with engine.begin() as conn:
        # Add description column
        print("Checking description column...")
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;"))
        # Add quantity column
        print("Checking quantity column...")
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;"))
        
        # Create cart_items table
        print("Checking cart_items table...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS cart_items (
                id VARCHAR(32) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                product_id VARCHAR(255) NOT NULL,
                quantity INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        # Create indexes if they do not exist
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_cart_items_user_id ON cart_items (user_id);"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_cart_items_product_id ON cart_items (product_id);"))
        
        # Create wishlist_items table
        print("Checking wishlist_items table...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS wishlist_items (
                id VARCHAR(32) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                product_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        # Create indexes if they do not exist
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_wishlist_items_user_id ON wishlist_items (user_id);"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_wishlist_items_product_id ON wishlist_items (product_id);"))

        # Create payments table
        print("Checking payments table...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS payments (
                id VARCHAR(32) PRIMARY KEY,
                order_id VARCHAR(255) NOT NULL,
                razorpay_payment_id VARCHAR(255) NOT NULL,
                razorpay_order_id VARCHAR(255) NOT NULL,
                amount DOUBLE PRECISION NOT NULL,
                status VARCHAR(50) DEFAULT 'Captured',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_payments_order_id ON payments (order_id);"))

        # Add auth_provider to users
        print("Checking auth_provider column in users...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';"))

        # Add addresses to users
        print("Checking addresses column in users...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSON;"))

        
        print("Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(migrate())
