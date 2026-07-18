from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import verify_admin, get_current_user, get_current_user_optional
from app.core.config import settings
from app.core.database import get_db
from app.models.order import OrderCreate, OrderUpdate, OrderResponse
from app.db.models import Order as DBOrder, Payment as DBPayment, User as DBUser
from pydantic import BaseModel
import razorpay
import hmac
import hashlib
import asyncio

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

user_router = APIRouter(prefix="/orders", tags=["📦 Orders — User"])
admin_router = APIRouter(prefix="/orders", tags=["🔐 Admin — Order Management"])
router = APIRouter()

@user_router.post(
    "/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create checkout order with Razorpay"
)
async def checkout_order(order: OrderCreate, current_user: dict = Depends(get_current_user_optional), db: AsyncSession = Depends(get_db)):
    order_dict = order.model_dump()
    order_dict["created_at"] = datetime.now(timezone.utc)
    order_dict["updated_at"] = order_dict["created_at"]
    
    if current_user:
        username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
        order_dict["user_username"] = username
        
        # Save address to user profile
        result = await db.execute(select(DBUser).where(DBUser.username == username))
        db_user = result.scalars().first()
        if db_user:
            current_addresses = db_user.addresses or []
            # Make sure it's a list
            if isinstance(current_addresses, str):
                import json
                try:
                    current_addresses = json.loads(current_addresses)
                except:
                    current_addresses = []
                    
            if isinstance(current_addresses, list):
                # Ensure address doesn't already exist
                address_exists = False
                for addr in current_addresses:
                    if isinstance(addr, dict) and addr.get("fullAddress") == order.shipping_address:
                        address_exists = True
                        break
                    elif isinstance(addr, str) and addr == order.shipping_address:
                        address_exists = True
                        break
                
                if not address_exists:
                    current_addresses.append({
                        "id": str(datetime.now().timestamp()),
                        "label": "Home",
                        "fullAddress": order.shipping_address,
                        "isDefault": len(current_addresses) == 0
                    })
                    db_user.addresses = current_addresses
                    await db.commit()
    else:
        order_dict["user_username"] = None
        
    if "items" in order_dict:
        order_dict["items"] = [item if isinstance(item, dict) else item.model_dump() for item in order_dict.get("items", [])]

    # Razorpay Integration
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            amount_in_paise = int(order.total_amount * 100)
            data = {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"receipt_{datetime.now().timestamp()}"
            }
            rzp_order = await asyncio.to_thread(client.order.create, data=data)
            order_dict["razorpay_order_id"] = rzp_order.get("id")
            order_dict["status"] = "Payment Pending"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Razorpay error: {str(e)}")
    else:
        # Mock Razorpay Order ID for testing when keys are missing
        order_dict["razorpay_order_id"] = f"mock_order_{int(datetime.now().timestamp())}"
        order_dict["status"] = "Payment Pending"

    db_order = DBOrder(**order_dict)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order


@user_router.post(
    "/verify-payment",
    summary="Verify Razorpay Payment Signature"
)
async def verify_payment(payload: VerifyPaymentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBOrder).where(DBOrder.razorpay_order_id == payload.razorpay_order_id))
    db_order = result.scalars().first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            await asyncio.to_thread(
                client.utility.verify_payment_signature,
                {
                    'razorpay_order_id': payload.razorpay_order_id,
                    'razorpay_payment_id': payload.razorpay_payment_id,
                    'razorpay_signature': payload.razorpay_signature
                }
            )
            # Signature verified
            db_order.status = "Payment Successful"
            db_order.razorpay_payment_id = payload.razorpay_payment_id
            db_order.razorpay_signature = payload.razorpay_signature
            db_order.updated_at = datetime.now(timezone.utc)
            
            # Explicitly capture the payment
            amount_in_paise = int(db_order.total_amount * 100)
            payment_info = await asyncio.to_thread(client.payment.fetch, payload.razorpay_payment_id)
            if payment_info.get("status") == "authorized":
                await asyncio.to_thread(client.payment.capture, payload.razorpay_payment_id, amount_in_paise)
                
            # Create a dedicated Payment record
            new_payment = DBPayment(
                order_id=db_order.id,
                razorpay_payment_id=payload.razorpay_payment_id,
                razorpay_order_id=payload.razorpay_order_id,
                amount=db_order.total_amount,
                status="Success"
            )
            db.add(new_payment)
            
            await db.commit()
            
            # --- MOCK NOTIFICATIONS ---
            print(f"✅ MOCK: Sending WhatsApp confirmation to {db_order.contact_phone} for order {db_order.id}")
            if db_order.email:
                print(f"✅ MOCK: Sending Email confirmation to {db_order.email} for order {db_order.id}")
            print(f"✅ MOCK: Sending SMS confirmation to {db_order.contact_phone} for order {db_order.id}")
            # --------------------------
            
            return {"status": "success", "message": "Payment verified and captured successfully"}
        except razorpay.errors.SignatureVerificationError:
            db_order.status = "Payment Failed"
            db_order.updated_at = datetime.now(timezone.utc)
            await db.commit()
            raise HTTPException(status_code=400, detail="Signature verification failed")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment capture error: {str(e)}")
    else:
        # Mock Verification
        db_order.status = "Payment Successful"
        db_order.razorpay_payment_id = payload.razorpay_payment_id
        db_order.razorpay_signature = payload.razorpay_signature
        db_order.updated_at = datetime.now(timezone.utc)
        
        # Create a dedicated mock Payment record
        new_payment = DBPayment(
            order_id=db_order.id,
            razorpay_payment_id=payload.razorpay_payment_id,
            razorpay_order_id=payload.razorpay_order_id,
            amount=db_order.total_amount,
            status="Success (Mock)"
        )
        db.add(new_payment)
        
        await db.commit()
        
        # --- MOCK NOTIFICATIONS ---
        print(f"✅ MOCK: Sending WhatsApp confirmation to {db_order.contact_phone} for order {db_order.id}")
        if db_order.email:
            print(f"✅ MOCK: Sending Email confirmation to {db_order.email} for order {db_order.id}")
        print(f"✅ MOCK: Sending SMS confirmation to {db_order.contact_phone} for order {db_order.id}")
        # --------------------------
        
        return {"status": "success", "message": "Payment mock verified successfully (No keys provided)"}

@router.post("/webhook", summary="Razorpay Webhook Endpoint")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        # If no secret is configured, just return ok to avoid failing unnecessarily
        return {"status": "ignored", "message": "Webhook secret not configured"}
        
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        client.utility.verify_webhook_signature(
            payload.decode("utf-8"),
            signature,
            settings.RAZORPAY_WEBHOOK_SECRET
        )
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
    import json
    data = json.loads(payload)
    
    event = data.get("event")
    if event in ["payment.captured", "order.paid"]:
        payload_entity = data.get("payload", {})
        rzp_order_id = None
        
        if event == "payment.captured":
            payment_entity = payload_entity.get("payment", {}).get("entity", {})
            rzp_order_id = payment_entity.get("order_id")
        else:
            order_entity = payload_entity.get("order", {}).get("entity", {})
            rzp_order_id = order_entity.get("id")
            
        if rzp_order_id:
            result = await db.execute(select(DBOrder).where(DBOrder.razorpay_order_id == rzp_order_id))
            db_order = result.scalars().first()
            if db_order and db_order.status != "Payment Successful":
                db_order.status = "Payment Successful"
                db_order.updated_at = datetime.now(timezone.utc)
                await db.commit()
                print(f"✅ WEBHOOK: Order {db_order.id} status updated to Payment Successful via webhook")

    return {"status": "ok"}

@user_router.post(
    "/legacy",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Legacy create order"
)
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order_dict = order.model_dump()
    order_dict["created_at"] = datetime.now(timezone.utc)
    order_dict["updated_at"] = order_dict["created_at"]
    
    # Extract username safely whether current_user is a dict (admin) or DBUser instance
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    order_dict["user_username"] = username
    
    # Nested items need to be converted to dicts to be stored in JSON column
    if "items" in order_dict:
        order_dict["items"] = [item if isinstance(item, dict) else item.model_dump() for item in order_dict.get("items", [])]
        
    db_order = DBOrder(**order_dict)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order

@user_router.get(
    "/my-orders",
    response_model=List[OrderResponse],
    summary="Get current user's orders"
)
async def get_my_orders(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    result = await db.execute(select(DBOrder).where(DBOrder.user_username == username))
    orders = result.scalars().all()
    return orders

@user_router.get(
    "/my-payments",
    summary="Get current user's payment history"
)
async def get_my_payments(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    username = current_user.get("username") if isinstance(current_user, dict) else current_user.username
    # We join Payment with DBOrder to filter by the user's username
    query = (
        select(DBPayment, DBOrder)
        .join(DBOrder, DBPayment.order_id == DBOrder.id)
        .where(DBOrder.user_username == username)
        .order_by(DBPayment.created_at.desc())
    )
    result = await db.execute(query)
    payments = []
    for payment, order in result.all():
        payments.append({
            "id": payment.id,
            "order_id": payment.order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "razorpay_order_id": payment.razorpay_order_id,
            "amount": payment.amount,
            "status": payment.status,
            "created_at": payment.created_at,
            # include a summary of the order if needed
            "order_summary": {
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at
            }
        })
    return payments

# ── Admin Routes ──────────────────────────────────────────────────────────────

@admin_router.get(
    "",
    response_model=List[OrderResponse],
    summary="Get all orders (admin only)"
)
async def get_all_orders(admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBOrder).limit(1000))
    orders = result.scalars().all()
    return orders

@admin_router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update order status (admin only)"
)
@admin_router.patch(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Partially update order status (admin only)"
)
async def update_order(order_id: str, order_update: OrderUpdate, admin: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBOrder).where(DBOrder.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    update_data = order_update.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        await db.commit()
        await db.refresh(db_order)
    
    return db_order

router.include_router(user_router)
router.include_router(admin_router)
