import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

# We create a router without prefix so we can handle both /uploads and /api/uploads
# or we can just handle /uploads and include it at the root of the app.
router = APIRouter(tags=["📁 Uploads"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/uploads/{filename}")
@router.get("/api/uploads/{filename}")
async def serve_upload(filename: str):
    """
    Serve uploaded images. 
    Handles both `/uploads` and `/api/uploads` depending on how Nginx proxies the request.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found on server")
