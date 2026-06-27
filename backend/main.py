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
    docs_url="/docs",
    redoc_url="/redoc",
    root_path="/api"
)

# ── Middleware ────────────────────────────────────────────────────────────────
register_cors(app)

# ── Static Files ──────────────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)

from app.routers import contact
app.include_router(contact.router)


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
