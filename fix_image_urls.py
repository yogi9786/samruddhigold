import requests

BASE_URL = "https://sirisamruddhigold.com/api"
USERNAME = "siriadmin"
PASSWORD = "adminpassword"

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

products_res = requests.get(f"{BASE_URL}/products", headers=headers)
if products_res.status_code != 200:
    print("Failed to get products")
    exit(1)

products = products_res.json()
updated_count = 0

for p in products:
    img_url = p.get("image_url")
    if img_url and "sirisamruddhigold.com/api/uploads" in img_url:
        new_url = img_url.replace("http://", "https://").replace("/api/uploads", "/uploads")
        
        # update product
        update_res = requests.put(f"{BASE_URL}/products/{p['id']}", headers=headers, json={
            "image_url": new_url
        })
        if update_res.status_code == 200:
            print(f"Updated product {p['name']}: {new_url}")
            updated_count += 1
        else:
            print(f"Failed to update product {p['name']}: {update_res.text}")

print(f"Successfully updated {updated_count} products.")
