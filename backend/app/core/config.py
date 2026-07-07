from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Samruddhi Gold Palace API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Secret key for signing JWT tokens
    SECRET_KEY: str = "samruddhi-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS origins (comma-separated in .env, e.g. "http://localhost:5173,https://yourdomain.com")
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://siriuser:change_this_later_123@localhost:5432/sirisamruddhi"
    
    # Admin Credentials
    ADMIN_USERNAME: str = "siriadmin"
    ADMIN_PASSWORD: str = "adminpassword"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
