from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.middleware.cors import register_cors
from app.routers.store import store_api_router
from app.routers.admin import admin_api_router

import os
from contextlib import asynccontextmanager
from app.core.database import init_db

# ──────────────────────────────────────────────────────────────────────────────
# Lifespan
# ──────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield
    # Cleanup on shutdown (if needed)

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Samruddhi Gold Palace API",
    version=settings.APP_VERSION,
    description="Backend API for Samruddhi Gold Palace jewellery e-commerce platform.",
    docs_url="/docs",
    redoc_url="/redoc",
    root_path="/api",
    lifespan=lifespan
)

# ──────────────────────────────────────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────────────────────────────────────
register_cors(app)

# ──────────────────────────────────────────────────────────────────────────────
# Static Files & Uploads
# ──────────────────────────────────────────────────────────────────────────────
from app.api.uploads import router as uploads_router
app.include_router(uploads_router)





app.include_router(store_api_router)
app.include_router(admin_api_router)

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