from fastapi import FastAPI

from app.core.config import settings
from app.middleware.cors import register_cors
from app.routers import auth, users

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Samruddhi Gold Palace jewellery e-commerce platform.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ────────────────────────────────────────────────────────────────
register_cors(app)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
