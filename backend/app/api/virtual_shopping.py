from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime, timezone

from app.core.security import verify_admin
from app.core.database import get_db
from app.db.models import VirtualShoppingBooking as DBVirtualShoppingBooking
from app.models.virtual_shopping import (
    VirtualShoppingBookingCreate,
    VirtualShoppingBookingUpdate,
    VirtualShoppingBookingResponse
)

public_router = APIRouter(prefix="/virtual-shopping", tags=["🛍️ Virtual Shopping — Public"])
admin_router = APIRouter(prefix="/virtual-shopping", tags=["🔐 Admin — Virtual Shopping Management"])

# ── Public Routes ─────────────────────────────────────────────────────────────

@public_router.post(
    "",
    response_model=VirtualShoppingBookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a virtual shopping booking appointment (public)"
)
async def create_booking(booking: VirtualShoppingBookingCreate, db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Submit a virtual video shopping booking appointment.
    """
    booking_dict = booking.model_dump()
    booking_dict["created_at"] = datetime.now(timezone.utc)
    booking_dict["status"] = "Pending"
    
    db_booking = DBVirtualShoppingBooking(**booking_dict)
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking


@public_router.get(
    "/{booking_id}",
    response_model=VirtualShoppingBookingResponse,
    summary="Get a virtual shopping booking by ID"
)
async def get_booking_by_id(booking_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a specific virtual shopping booking by its ID.
    """
    result = await db.execute(select(DBVirtualShoppingBooking).where(DBVirtualShoppingBooking.id == booking_id))
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return booking


# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.get(
    "",
    response_model=List[VirtualShoppingBookingResponse],
    summary="Get all virtual shopping bookings (admin only)"
)
async def get_all_bookings(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin only** — Requires Bearer token.
    Retrieve all virtual shopping bookings.
    """
    result = await db.execute(select(DBVirtualShoppingBooking).order_by(DBVirtualShoppingBooking.created_at.desc()))
    return result.scalars().all()


@admin_router.get(
    "/{booking_id}",
    response_model=VirtualShoppingBookingResponse,
    summary="Get a virtual shopping booking by ID (admin only)"
)
async def get_admin_booking_by_id(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin only** — Requires Bearer token.
    Retrieve details for a single virtual shopping booking.
    """
    result = await db.execute(select(DBVirtualShoppingBooking).where(DBVirtualShoppingBooking.id == booking_id))
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return booking


@admin_router.put(
    "/{booking_id}",
    response_model=VirtualShoppingBookingResponse,
    summary="Update virtual shopping booking (admin only)"
)
async def update_booking(
    booking_id: str,
    booking_update: VirtualShoppingBookingUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin only** — Requires Bearer token.
    Update details (e.g. status) of an existing booking.
    """
    result = await db.execute(select(DBVirtualShoppingBooking).where(DBVirtualShoppingBooking.id == booking_id))
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
        
    update_data = booking_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(booking, key, value)
        
    await db.commit()
    await db.refresh(booking)
    return booking


@admin_router.delete(
    "/{booking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete virtual shopping booking (admin only)"
)
async def delete_booking(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin only** — Requires Bearer token.
    Delete a virtual shopping booking.
    """
    result = await db.execute(select(DBVirtualShoppingBooking).where(DBVirtualShoppingBooking.id == booking_id))
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
        
    await db.delete(booking)
    await db.commit()
    return None
