from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import threading
import time
import requests

os.makedirs("uploads", exist_ok=True)
with open("uploads/test.txt", "w") as f:
    f.write("test")

app = FastAPI(root_path="/api")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/hello")
def hello():
    return {"message": "hello"}

def run():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="error")

t = threading.Thread(target=run, daemon=True)
t.start()

time.sleep(2)

print("GET /api/hello:", requests.get("http://127.0.0.1:8001/api/hello").status_code)
print("GET /hello:", requests.get("http://127.0.0.1:8001/hello").status_code)
print("GET /api/uploads/test.txt:", requests.get("http://127.0.0.1:8001/api/uploads/test.txt").status_code)
print("GET /uploads/test.txt:", requests.get("http://127.0.0.1:8001/uploads/test.txt").status_code)
