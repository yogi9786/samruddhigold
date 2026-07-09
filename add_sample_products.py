import requests
import os
import json

BASE_URL = "https://sirisamruddhigold.com/api"
# Or fallback to admin path if the new main.py hasn't been deployed yet
ADMIN_URL = "https://sirisamruddhigold.com/api/admin"

USERNAME = "siriadmin"
PASSWORD = "adminpassword"

print("Logging in to get admin token...")
login_response = requests.post(f"{BASE_URL}/auth/token", data={
    "username": USERNAME,
    "password": PASSWORD
})

# Wait, if /auth/token fails because of missing /admin, let's try the other
if login_response.status_code == 404:
    login_response = requests.post(f"{ADMIN_URL}/auth/token", data={
        "username": USERNAME,
        "password": PASSWORD
    })

if login_response.status_code != 200:
    print(f"Failed to login: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Let's see which URL works for product creation
test_post = requests.options(f"{BASE_URL}/products", headers=headers)

PRODUCT_API = f"{BASE_URL}/products"
UPLOAD_API = f"{BASE_URL}/products/upload-image"

# We can try to test a POST with empty body just to see if we get 405 or 422
test_res = requests.post(PRODUCT_API, headers=headers, json={})
if test_res.status_code == 405 or test_res.status_code == 404:
    PRODUCT_API = f"{ADMIN_URL}/products"
    UPLOAD_API = f"{ADMIN_URL}/products/upload-image"

print(f"Using Product API: {PRODUCT_API}")

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

def create_product(product_data):
    res = requests.post(PRODUCT_API, headers=headers, json=product_data)
    if res.status_code in [200, 201]:
        print(f"Created product: {product_data['name']}")
    else:
        print(f"Failed to create product {product_data['name']}: {res.text}")

images_dir = r"C:\Users\wheny\.gemini\antigravity-ide\brain\a6fb3165-a100-445d-afbc-87678a9ce385"

img1 = upload_image(os.path.join(images_dir, "gold_necklace_1783584095797.png"))
img2 = upload_image(os.path.join(images_dir, "gold_ring_1783584104905.png"))
img3 = upload_image(os.path.join(images_dir, "gold_bangles_1783584115984.png"))

products = [
    {
        "name": "22K Exquisite Gold Choker Necklace",
        "sku": "NK-GLD-001",
        "price": 145000,
        "original_price": 155000,
        "discount_text": "Save ₹10,000",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img1,
        "is_on_sale": True,
        "sale_price": 145000,
        "sale_label": "BESTSELLER",
        "stock": 5,
        "weight": "45g",
        "tags": "necklace,gold,traditional,wedding",
        "vendor": "Samruddhi Gold",
        "seo_title": "Buy 22K Gold Choker Necklace Online | Samruddhi Gold",
        "seo_description": "Shop the exquisite 22K Gold Choker Necklace for your special occasions."
    },
    {
        "name": "18K Gold Diamond Engagement Ring",
        "sku": "RG-DIA-001",
        "price": 85000,
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img2,
        "stock": 3,
        "weight": "8g",
        "tags": "ring,gold,diamond,engagement",
        "vendor": "Samruddhi Gold",
    },
    {
        "name": "22K Traditional Indian Gold Bangles (Set of 2)",
        "sku": "BG-GLD-002",
        "price": 210000,
        "original_price": 220000,
        "discount_text": "Special Offer",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img3,
        "stock": 2,
        "weight": "60g",
        "tags": "bangles,gold,bridal,traditional",
        "vendor": "Samruddhi Gold",
    },
    {
        "name": "22K Elegant Gold Drop Earrings",
        "sku": "ER-GLD-004",
        "price": 45000,
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img3, # Reusing bangles image since earrings failed to generate
        "stock": 10,
        "weight": "12g",
        "tags": "earrings,gold,daily-wear",
        "vendor": "Samruddhi Gold",
    }
]

for p in products:
    create_product(p)
