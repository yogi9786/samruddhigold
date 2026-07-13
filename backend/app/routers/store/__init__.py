from fastapi import APIRouter

from app.api.auth import public_router as auth_router
from app.api.users import public_router as users_router
from app.api.products import public_router as products_router
from app.api.categories import public_router as categories_router
from app.api.orders import user_router as orders_router
from app.api.contact import router as contact_router
from app.api.metal_price import public_router as metal_prices_router
from app.api.cart import router as cart_router
from app.api.wishlist import router as wishlist_router
from app.api.virtual_shopping import public_router as virtual_shopping_router
from app.api.subscription import router as subscription_router

store_api_router = APIRouter()
store_api_router.include_router(auth_router)
store_api_router.include_router(users_router)
store_api_router.include_router(products_router)
store_api_router.include_router(categories_router)
store_api_router.include_router(orders_router)
store_api_router.include_router(contact_router)
store_api_router.include_router(metal_prices_router)
store_api_router.include_router(cart_router)
store_api_router.include_router(wishlist_router)
store_api_router.include_router(virtual_shopping_router)
store_api_router.include_router(subscription_router)

