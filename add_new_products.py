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

print("Fetching existing products to set to draft...")
products_res = requests.get(f"{BASE_URL}/products", headers=headers)
if products_res.status_code != 200:
    print("Failed to get products")
    exit(1)

products = products_res.json()
target_skus = ["NK-GLD-001", "RG-DIA-001", "BG-GLD-002", "ER-GLD-004"]

draft_count = 0
for p in products:
    if p.get("sku") in target_skus:
        print(f"Setting product {p['name']} to draft...")
        update_res = requests.put(f"{BASE_URL}/products/{p['id']}", headers=headers, json={
            "status": "draft"
        })
        if update_res.status_code == 200:
            draft_count += 1
        else:
            print(f"Failed to update product: {update_res.text}")

print(f"Successfully drafted {draft_count} old products.")

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

print("Uploading new images...")
images_dir = r"C:\Users\wheny\.gemini\antigravity-ide\brain\a6fb3165-a100-445d-afbc-87678a9ce385"

img1 = upload_image(os.path.join(images_dir, "platinum_ring_1783585233083.png"))
img2 = upload_image(os.path.join(images_dir, "diamond_necklace_1783585245685.png"))
img3 = upload_image(os.path.join(images_dir, "gold_bangles_1783584115984.png")) # Reuse bangles
img4 = upload_image(os.path.join(images_dir, "gold_drop_earrings_1783584750554.png")) # Reuse earrings

new_products = [
    {
        "name": "Platinum Solitaire Engagement Ring",
        "sku": "RG-PLA-005",
        "price": 125000,
        "original_price": 140000,
        "discount_text": "Save ₹15,000",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img1,
        "is_on_sale": True,
        "sale_price": 125000,
        "sale_label": "NEW ARRIVAL",
        "status": "active",
        "stock": 2,
        "weight": "6g",
        "tags": "ring,platinum,diamond,engagement",
        "vendor": "Samruddhi Gold"
    },
    {
        "name": "Luxury Diamond Bridal Necklace",
        "sku": "NK-DIA-006",
        "price": 350000,
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img2,
        "status": "active",
        "stock": 1,
        "weight": "55g",
        "tags": "necklace,diamond,bridal,luxury",
        "vendor": "Samruddhi Gold"
    },
    {
        "name": "22K Antique Gold Temple Bangles",
        "sku": "BG-GLD-007",
        "price": 185000,
        "original_price": 200000,
        "discount_text": "Temple Collection",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img3,
        "status": "active",
        "stock": 4,
        "weight": "45g",
        "tags": "bangles,gold,antique,temple",
        "vendor": "Samruddhi Gold"
    },
    {
        "name": "18K Rose Gold Diamond Drop Earrings",
        "sku": "ER-RGLD-008",
        "price": 65000,
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": img4,
        "status": "active",
        "stock": 8,
        "weight": "15g",
        "tags": "earrings,rose-gold,diamond",
        "vendor": "Samruddhi Gold"
    }
]

for p in new_products:
    print(f"Creating product: {p['name']}...")
    res = requests.post(f"{BASE_URL}/products", headers=headers, json=p)
    if res.status_code in [200, 201]:
        print(f"Success")
    else:
        print(f"Failed to create product: {res.text}")

