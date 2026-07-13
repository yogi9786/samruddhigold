from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone
from typing import List

from app.models.subscription import SubscriptionCreate, SubscriptionResponse
from app.core.database import get_db
from app.db.models import Subscription as DBSubscription

router = APIRouter(prefix="/subscriptions", tags=["🔔 Subscriptions"])

@router.post(
    "",
    response_model=SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new newsletter/updates subscription"
)
async def create_subscription(subscription: SubscriptionCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new subscription using an email address, phone number, or both.
    """
    if not subscription.email and not subscription.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either email or phone number must be provided."
        )

    # Check for existing subscription with the same email or phone to avoid duplicates
    if subscription.email:
        existing_email = await db.execute(select(DBSubscription).where(DBSubscription.email == subscription.email))
        if existing_email.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already subscribed."
            )

    if subscription.phone:
        existing_phone = await db.execute(select(DBSubscription).where(DBSubscription.phone == subscription.phone))
        if existing_phone.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This phone number is already subscribed."
            )

    sub_dict = subscription.model_dump()
    sub_dict["created_at"] = datetime.now(timezone.utc)

    db_sub = DBSubscription(**sub_dict)
    db.add(db_sub)
    await db.commit()
    await db.refresh(db_sub)

    return db_sub

@router.get(
    "",
    response_model=List[SubscriptionResponse],
    summary="Get all subscriptions (Admin)"
)
async def get_all_subscriptions(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all subscriptions list. Useful for admin panel.
    """
    result = await db.execute(select(DBSubscription).order_by(DBSubscription.created_at.desc()))
    return result.scalars().all()
