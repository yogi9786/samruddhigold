from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import admin_router as users_router
from app.api.products import admin_router as products_router
from app.api.categories import admin_router as categories_router
from app.api.orders import admin_router as orders_router
from app.api.metal_price import admin_router as metal_prices_router
from app.api.virtual_shopping import admin_router as virtual_shopping_router

admin_api_router = APIRouter()
admin_api_router.include_router(auth_router)
admin_api_router.include_router(users_router)
admin_api_router.include_router(products_router)
admin_api_router.include_router(categories_router)
admin_api_router.include_router(orders_router)
admin_api_router.include_router(metal_prices_router)
admin_api_router.include_router(virtual_shopping_router)

