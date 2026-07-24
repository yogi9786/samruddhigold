from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone
from typing import List, Optional

from app.models.contact import ContactCreate, ContactResponse, ContactStatusUpdate
from app.core.database import get_db
from app.db.models import Contact as DBContact
from app.core.security import verify_admin

router = APIRouter(prefix="/contact", tags=["📬 Contact — Public"])
admin_router = APIRouter(prefix="/contacts", tags=["🔐 Admin — Contacts"])

@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form (public)"
)
async def submit_contact(contact: ContactCreate, db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Submit a contact/enquiry/wedding lead form.
    """
    contact_dict = contact.model_dump()
    contact_dict["created_at"] = datetime.now(timezone.utc)
    if not contact_dict.get("status"):
        contact_dict["status"] = "Pending"
    if not contact_dict.get("source"):
        contact_dict["source"] = "general"

    db_contact = DBContact(**contact_dict)
    db.add(db_contact)
    await db.commit()
    await db.refresh(db_contact)

    return db_contact


@admin_router.get(
    "",
    response_model=List[ContactResponse],
    summary="Get contacts / leads for admin"
)
async def get_all_contacts(
    source: Optional[str] = Query(None, description="Filter by source: 'general' or 'wedding_collection'"),
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin endpoint** — Fetch all contacts / leads, optionally filtered by source.
    """
    stmt = select(DBContact).order_by(DBContact.created_at.desc())
    if source:
        stmt = stmt.where(DBContact.source == source)

    result = await db.execute(stmt)
    contacts = result.scalars().all()
    return contacts


@admin_router.patch(
    "/{contact_id}/status",
    response_model=ContactResponse,
    summary="Update contact / lead status"
)
async def update_contact_status(
    contact_id: str,
    payload: ContactStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin endpoint** — Update status of a contact or lead.
    """
    result = await db.execute(select(DBContact).where(DBContact.id == contact_id))
    contact = result.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    contact.status = payload.status
    await db.commit()
    await db.refresh(contact)
    return contact


@admin_router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a contact / lead"
)
async def delete_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(verify_admin)
):
    """
    **Admin endpoint** — Delete a contact or lead record.
    """
    result = await db.execute(select(DBContact).where(DBContact.id == contact_id))
    contact = result.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    await db.delete(contact)
    await db.commit()
