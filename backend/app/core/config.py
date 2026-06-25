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

    # MongoDB Settings
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "samruddhi_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
