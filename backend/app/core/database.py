from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Initialize the MongoDB client
# The client connects lazily, so it won't crash if the database isn't running yet.
client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

def get_user_collection():
    return db["users"]
