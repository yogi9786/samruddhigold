import requests
import os

BASE_URL = "https://sirisamruddhigold.com/api"
USERNAME = "siriadmin"
PASSWORD = "adminpassword"
UPLOAD_API = f"{BASE_URL}/products/upload-image"

print("Logging in to get admin token...")
login_response = requests.post(f"{BASE_URL}/auth/token", data={
    "username": USERNAME,
    "password": PASSWORD
})

if login_response.status_code != 200:
    print(f"Failed to login: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

def upload_image(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return None
    with open(filepath, "rb") as f:
        files = {"file": (os.path.basename(filepath), f, "image/png")}
        res = requests.post(UPLOAD_API, headers=headers, files=files)
        if res.status_code == 200:
            return res.json()["url"]
        else:
            print(f"Upload failed: {res.text}")
            return None

print("Uploading new image...")
filepath = r"C:\Users\wheny\.gemini\antigravity-ide\brain\a6fb3165-a100-445d-afbc-87678a9ce385\gold_drop_earrings_1783584750554.png"
new_image_url = upload_image(filepath)

if not new_image_url:
    print("Failed to upload new image.")
    exit(1)

print(f"New image uploaded at: {new_image_url}")

# Now get products and find the earrings
print("Fetching products...")
products_res = requests.get(f"{BASE_URL}/products", headers=headers)
if products_res.status_code != 200:
    print("Failed to get products")
    exit(1)

products = products_res.json()

for p in products:
    if "Earrings" in p["name"]:
        print(f"Found product: {p['name']} (ID: {p['id']})")
        update_res = requests.put(f"{BASE_URL}/products/{p['id']}", headers=headers, json={
            "image_url": new_image_url
        })
        if update_res.status_code == 200:
            print(f"Successfully updated product with new image URL.")
        else:
            print(f"Failed to update product: {update_res.text}")
