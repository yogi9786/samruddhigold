from fastapi import APIRouter, HTTPException, status
from app.models.contact import ContactCreate, ContactResponse
from app.core.database import get_contact_collection
from datetime import datetime, timezone

router = APIRouter(prefix="/contact", tags=["📬 Contact — Public"])


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form (public)"
)
async def submit_contact(contact: ContactCreate):
    """
    **Public endpoint** — No authentication required.
    Submit a contact/enquiry form. The message is saved for the admin to review.
    """
    contact_collection = get_contact_collection()

    contact_dict = contact.model_dump()
    contact_dict["created_at"] = datetime.now(timezone.utc)

    result = await contact_collection.insert_one(contact_dict)

    created_contact = await contact_collection.find_one({"_id": result.inserted_id})
    created_contact["id"] = str(created_contact.pop("_id"))

    return created_contact
