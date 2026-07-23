import re
import httpx
from typing import Optional
from app.core.config import settings

def format_phone_number(phone: str, default_country_code: str = "91") -> str:
    """
    Clean and format phone number for AiSensy WhatsApp API.
    Converts 10-digit Indian numbers to international format with country code (e.g. 919876543210).
    """
    if not phone:
        return ""
    
    # Remove all non-digit characters except leading plus if present
    cleaned = re.sub(r"[^\d]", "", phone)
    
    # If 10 digits provided, prefix default country code (e.g., 91)
    if len(cleaned) == 10:
        cleaned = f"{default_country_code}{cleaned}"
        
    return cleaned

async def send_add_to_cart_whatsapp(
    phone: str,
    user_name: Optional[str],
    product_name: str,
    price: float,
    image_url: Optional[str] = None,
    cart_url: Optional[str] = None
) -> bool:
    """
    Send an attractive Add-To-Cart WhatsApp reminder message via AiSensy API.
    Includes product image, content details, price, cart link, and user recipient.
    """
    if not settings.AISENSY_ENABLED:
        print("[AiSensy] WhatsApp integration is disabled (AISENSY_ENABLED=False).")
        return False
        
    if not settings.AISENSY_API_KEY or settings.AISENSY_API_KEY == "YOUR_AISENSY_API_KEY_HERE":
        print("[AiSensy] API key is missing or set to default placeholder in .env. Skipping WhatsApp message.")
        return False

    formatted_phone = format_phone_number(phone)
    if not formatted_phone:
        print(f"[AiSensy] Invalid phone number provided: {phone}")
        return False

    resolved_cart_url = cart_url or f"{settings.FRONTEND_URL.rstrip('/')}/cart"
    customer_name = user_name.strip() if user_name and user_name.strip() else "Valued Customer"
    formatted_price = f"₹{price:,.2f}"

    # Fallback image if product image is missing
    fallback_image = f"{settings.FRONTEND_URL.rstrip('/')}/assets/samruddhi-logo.png"
    media_url = image_url if (image_url and image_url.strip()) else fallback_image

    # Ensure media_url is a public HTTPS URL so Meta / WhatsApp servers can fetch the file
    public_domain = "https://sirisamruddhigold.com"
    if "localhost" in media_url or "127.0.0.1" in media_url:
        media_url = (
            media_url
            .replace("http://localhost:5173", public_domain)
            .replace("http://localhost:8000", public_domain)
            .replace("http://127.0.0.1:5173", public_domain)
            .replace("http://127.0.0.1:8000", public_domain)
        )
    elif media_url.startswith("http://"):
        media_url = media_url.replace("http://", "https://")

    # Build AiSensy API payload for Cart-Integration campaign (3 template params + media)
    payload = {
        "apiKey": settings.AISENSY_API_KEY.strip(),
        "campaignName": settings.AISENSY_CAMPAIGN_NAME.strip(),
        "destination": formatted_phone,
        "userName": customer_name,
        "templateParams": [
            product_name,
            formatted_price,
            resolved_cart_url
        ],
        "media": {
            "url": media_url,
            "filename": "product.jpg"
        }
    }


    print(f"[AiSensy] Dispatching WhatsApp message to {formatted_phone} for product: '{product_name}'")

    api_key = settings.AISENSY_API_KEY.strip() if settings.AISENSY_API_KEY else ""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "x-api-key": api_key
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                settings.AISENSY_API_URL,
                json=payload,
                headers=headers
            )
            
            if response.status_code in (200, 201, 202):
                print(f"[AiSensy] Successfully sent WhatsApp message to {formatted_phone}. Response: {response.text}")
                return True
            elif response.status_code == 401:
                print(f"[AiSensy] 401 Unauthorized Error: The AISENSY_API_KEY in .env was rejected by AiSensy.")
                return False
            else:
                print(f"[AiSensy] Request failed with status {response.status_code}. Response: {response.text}")
                return False

    except Exception as exc:
        print(f"[AiSensy] Error connecting to API: {str(exc)}")
        return False
