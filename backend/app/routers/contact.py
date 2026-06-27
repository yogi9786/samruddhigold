from fastapi import APIRouter, HTTPException, status
from app.models.contact import ContactCreate, ContactResponse
from app.core.database import get_contact_collection
from datetime import datetime, timezone

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED, summary="Submit Contact Form")
async def submit_contact(contact: ContactCreate):
    contact_collection = get_contact_collection()
    
    contact_dict = contact.model_dump()
    contact_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await contact_collection.insert_one(contact_dict)
    
    # Fetch the created record to return it
    created_contact = await contact_collection.find_one({"_id": result.inserted_id})
    created_contact["id"] = str(created_contact.pop("_id"))
    
    return created_contact
