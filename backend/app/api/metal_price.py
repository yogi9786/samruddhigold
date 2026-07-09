from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import verify_admin
from app.core.database import get_db
from app.models.metal_price import MetalPriceCreate, MetalPriceUpdate, MetalPriceResponse
from app.db.models import MetalPrice as DBMetalPrice

public_router = APIRouter(prefix="/metal-prices", tags=["🪙 Metal Prices — Public"])
admin_router = APIRouter(prefix="/metal-prices", tags=["🔐 Admin — Metal Prices"])
router = APIRouter()

# ── Public Routes ─────────────────────────────────────────────────────────────

@public_router.get("", response_model=List[MetalPriceResponse])
async def get_metal_prices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBMetalPrice))
    return result.scalars().all()

@public_router.get("/{price_id}", response_model=MetalPriceResponse)
async def get_metal_price(price_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBMetalPrice).where(DBMetalPrice.id == price_id))
    metal_price = result.scalars().first()
    if not metal_price:
        raise HTTPException(status_code=404, detail="Metal price not found")
    return metal_price

# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.post("", response_model=MetalPriceResponse, status_code=status.HTTP_201_CREATED)
async def create_metal_price(
    price_data: MetalPriceCreate,
    admin: dict = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    # Check if ID already exists
    existing = await db.execute(select(DBMetalPrice).where(DBMetalPrice.id == price_data.id))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Metal price ID already exists")

    db_price = DBMetalPrice(**price_data.model_dump())
    db.add(db_price)
    await db.commit()
    await db.refresh(db_price)
    return db_price

@admin_router.put("/{price_id}", response_model=MetalPriceResponse)
async def update_metal_price(
    price_id: str,
    update_data: MetalPriceUpdate,
    admin: dict = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DBMetalPrice).where(DBMetalPrice.id == price_id))
    metal_price = result.scalars().first()
    if not metal_price:
        raise HTTPException(status_code=404, detail="Metal price not found")
    
    data = update_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(metal_price, key, value)
        
    await db.commit()
    await db.refresh(metal_price)
    return metal_price

@admin_router.delete("/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_metal_price(
    price_id: str,
    admin: dict = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DBMetalPrice).where(DBMetalPrice.id == price_id))
    metal_price = result.scalars().first()
    if not metal_price:
        raise HTTPException(status_code=404, detail="Metal price not found")
        
    await db.delete(metal_price)
    await db.commit()
    return None

router.include_router(public_router)
router.include_router(admin_router)
