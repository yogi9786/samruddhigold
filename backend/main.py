from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.middleware.cors import register_cors
from app.routers import auth, users, products, contact, categories, orders

import os

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Samruddhi Gold Palace API",
    version=settings.APP_VERSION,
    description="Backend API for Samruddhi Gold Palace jewellery e-commerce platform.",
    docs_url="/docs",
    redoc_url="/redoc",
    root_path="/api"
)

# ──────────────────────────────────────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────────────────────────────────────
register_cors(app)

# ──────────────────────────────────────────────────────────────────────────────
# Static Files
# ──────────────────────────────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ──────────────────────────────────────────────────────────────────────────────
# API Router
# ──────────────────────────────────────────────────────────────────────────────
api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(contact.router)

app.include_router(api_router)

# ──────────────────────────────────────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }