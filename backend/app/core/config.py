from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Samruddhi Gold Palace API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Secret key for signing JWT tokens
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS origins (comma-separated in .env, e.g. "http://localhost:5173,https://yourdomain.com")
    ALLOWED_ORIGINS: list[str]

    # Database Settings
    DATABASE_URL: str
    
    # Admin Credentials
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    # Razorpay Settings
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None

    # Google OAuth
    GOOGLE_CLIENT_ID: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
