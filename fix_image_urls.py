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

def normalize_url(url):
    if not url:
        return url
    # If it contains any of the domains + /uploads/ or /api/uploads/
    for prefix in [
        "https://sirisamruddhigold.com/api/uploads/",
        "http://sirisamruddhigold.com/api/uploads/",
        "https://sirisamruddhigold.com/uploads/",
        "http://sirisamruddhigold.com/uploads/",
        "/uploads/"
    ]:
        if url.startswith(prefix):
            filename = url[len(prefix):]
            return f"/api/uploads/{filename}"
    return url

for p in products:
    img_url = p.get("image_url")
    gallery_urls = p.get("gallery_urls") or []
    
    new_img_url = normalize_url(img_url)
    new_gallery_urls = [normalize_url(g) for g in gallery_urls]
    
    needs_update = False
    payload = {}
    
    if new_img_url != img_url:
        payload["image_url"] = new_img_url
        needs_update = True
    if new_gallery_urls != gallery_urls:
        payload["gallery_urls"] = new_gallery_urls
        needs_update = True
        
    if needs_update:
        # update product
        update_res = requests.put(f"{BASE_URL}/products/{p['id']}", headers=headers, json=payload)
        if update_res.status_code == 200:
            print(f"Normalized product {p['name']}")
            print(f"  image_url: {img_url} -> {new_img_url}")
            print(f"  gallery_urls: {gallery_urls} -> {new_gallery_urls}")
            updated_count += 1
        else:
            print(f"Failed to update product {p['name']}: {update_res.text}")

print(f"Successfully normalized {updated_count} products.")
