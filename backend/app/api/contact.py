from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone

from app.models.contact import ContactCreate, ContactResponse
from app.core.database import get_db
from app.db.models import Contact as DBContact

router = APIRouter(prefix="/contact", tags=["📬 Contact — Public"])

@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form (public)"
)
async def submit_contact(contact: ContactCreate, db: AsyncSession = Depends(get_db)):
    """
    **Public endpoint** — No authentication required.
    Submit a contact/enquiry form. The message is saved for the admin to review.
    """
    contact_dict = contact.model_dump()
    contact_dict["created_at"] = datetime.now(timezone.utc)

    db_contact = DBContact(**contact_dict)
    db.add(db_contact)
    await db.commit()
    await db.refresh(db_contact)

    return db_contact
