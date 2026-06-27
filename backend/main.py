from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.middleware.cors import register_cors
from app.routers import auth, users, products
import os

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Samruddhi Gold Palace API",
    version=settings.APP_VERSION,
    description="Backend API for Samruddhi Gold Palace jewellery e-commerce platform.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── Middleware ────────────────────────────────────────────────────────────────
register_cors(app)

# ── Static Files ──────────────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)

from app.routers import contact
api_router.include_router(contact.router)

app.include_router(api_router)


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
