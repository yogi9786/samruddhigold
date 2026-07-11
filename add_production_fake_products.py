import requests
import os
import json

BASE_URL = "https://sirisamruddhigold.com/api"
USERNAME = "siriadmin"
PASSWORD = "adminpassword"

print("Logging in to get admin token...")
login_response = requests.post(f"{BASE_URL}/auth/token", data={
    "username": USERNAME,
    "password": PASSWORD
})

if login_response.status_code != 200:
    # Try fallback to /api/admin
    print("Falling back to /api/admin/auth/token...")
    login_response = requests.post(f"{BASE_URL}/admin/auth/token", data={
        "username": USERNAME,
        "password": PASSWORD
    })

if login_response.status_code != 200:
    print(f"Failed to login: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Check product and upload endpoints
PRODUCT_API = f"{BASE_URL}/products"
UPLOAD_API = f"{BASE_URL}/products/upload-image"

test_res = requests.post(PRODUCT_API, headers=headers, json={})
if test_res.status_code in [404, 405]:
    print("Falling back to admin product API path...")
    PRODUCT_API = f"{BASE_URL}/admin/products"
    UPLOAD_API = f"{BASE_URL}/admin/products/upload-image"

print(f"Product API: {PRODUCT_API}")
print(f"Upload API: {UPLOAD_API}")

def upload_image(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return None
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()
    mime_type = "image/png" if ext == ".png" else "image/jpeg"
    with open(filepath, "rb") as f:
        files = {"file": (filename, f, mime_type)}
        res = requests.post(UPLOAD_API, headers=headers, files=files)
        if res.status_code == 200:
            url = res.json()["url"]
            print(f"Uploaded {filename} -> {url}")
            return url
        else:
            print(f"Upload failed for {filename}: {res.status_code} {res.text}")
            return None

# Upload images
kundan_img_local = r"c:\Users\wheny\OneDrive\Desktop\samruddhigoldpalace\backend\uploads\kundan_choker.png"
diamond_img_local = r"c:\Users\wheny\OneDrive\Desktop\samruddhigoldpalace\backend\uploads\diamond_necklace.png"
silver_img_local = r"C:\Users\wheny\.gemini\antigravity-ide\brain\d8eb92dc-f266-4454-b938-448680edbb55\silver_pooja_thali_1783771409786.png"
gold_bangle_img_local = r"c:\Users\wheny\OneDrive\Desktop\samruddhigoldpalace\backend\uploads\gold_bangle.png"

print("\nUploading images to production...")
kundan_url = upload_image(kundan_img_local)
diamond_url = upload_image(diamond_img_local)
silver_url = upload_image(silver_img_local)
bangle_url = upload_image(gold_bangle_img_local)

new_products = [
    {
        "name": "Royal Antique Kundan Choker",
        "sku": "NK-KDN-501",
        "price": 275000,
        "original_price": 310000,
        "discount_text": "Bridal Festive Offer",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": kundan_url,
        "gallery_urls": [kundan_url] if kundan_url else [],
        "category_id": "cat-wedding",
        "is_on_sale": True,
        "sale_price": 275000,
        "sale_label": "BRIDAL SPECIAL",
        "status": "active",
        "stock": 3,
        "weight": "48.5g",
        "tags": "necklace,gold,kundan,wedding,bridal",
        "vendor": "Samruddhi Gold Palace",
        "seo_title": "Royal Antique Kundan Choker | Samruddhi Gold Palace",
        "seo_description": "Exquisite 22K Gold Antique Kundan Choker Necklace set with uncut diamonds and natural emerald drops for the royal bride.",
        "description": "Indulge in the regal charm of our Royal Antique Kundan Choker. Handcrafted in 22K yellow gold, this masterpiece features brilliant uncut diamonds (Kundan work) adorned with drops of pristine natural emeralds. Perfect for weddings and grand festive celebrations.",
        "quantity": 1,
        "price_breakup": {
            "metal_value": 235000,
            "gold_rate": "₹6,800/g",
            "gold_weight": "34.5g",
            "stone_value": 40000,
            "stone_weight": "8.5ct Kundan, 4.2ct Emerald",
            "making_charges_value": 25000,
            "making_charges_discount": 5000,
            "making_charges_final": 20000,
            "sub_total_value": 295000,
            "sub_total_final": 290000,
            "tax_value": 8700,
            "tax_final": 8700,
            "grand_total_value": 303700,
            "grand_total_final": 298700
        },
        "basic_info": {
            "height": "2.2 inches",
            "material": "Gold, Kundan & Emerald",
            "metal": "Yellow Gold",
            "metal_purity": "22K",
            "width": "7.5 inches",
            "approx_gross_weight": "48.5g"
        },
        "stone_info": {
            "stone_1_name": "Uncut Diamonds (Kundan)",
            "stone_1_weight": "8.5 Carat",
            "stone_2_name": "Natural Emerald Drops",
            "stone_2_weight": "4.2 Carat"
        },
        "other_info": {
            "chain_included": "Yes (Adjustable Thread)",
            "earring_type": "N/A",
            "gold_certification": "BIS Hallmark",
            "metal_finish": "Antique Gold",
            "occasion": "Wedding, Bridal"
        },
        "return_policy": {
            "return_days": "7 Days Replacement Only"
        }
    },
    {
        "name": "Classic Solitaire Diamond Studs",
        "sku": "ER-DIA-502",
        "price": 95000,
        "original_price": 110000,
        "discount_text": "IGI Certified Diamonds",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": diamond_url,
        "gallery_urls": [diamond_url] if diamond_url else [],
        "category_id": "cat-diamond",
        "is_on_sale": True,
        "sale_price": 95000,
        "sale_label": "EXCLUSIVE",
        "status": "active",
        "stock": 5,
        "weight": "3.5g",
        "tags": "earrings,diamond,studs,solitaire,18k",
        "vendor": "Samruddhi Gold Palace",
        "seo_title": "Classic Solitaire Diamond Studs | Samruddhi Gold Palace",
        "seo_description": "Elegant 18K White Gold Solitaire Stud Earrings featuring 1.0 Carat certified round brilliant diamonds.",
        "description": "Timeless elegance for everyday luxury. These classic stud earrings feature twin round brilliant-cut diamonds of VVS clarity, totaling 1.0 Carat. Meticulously set in premium 18K white gold with rhodium plating for maximum luster.",
        "quantity": 1,
        "price_breakup": {
            "metal_value": 25000,
            "gold_rate": "₹5,800/g",
            "gold_weight": "3.2g",
            "stone_value": 70000,
            "stone_weight": "1.0ct VVS",
            "making_charges_value": 10000,
            "making_charges_discount": 0,
            "making_charges_final": 10000,
            "sub_total_value": 105000,
            "sub_total_final": 105000,
            "tax_value": 3150,
            "tax_final": 3150,
            "grand_total_value": 108150,
            "grand_total_final": 108150
        },
        "basic_info": {
            "height": "0.4 inches",
            "material": "18K Gold & Diamonds",
            "metal": "White Gold",
            "metal_purity": "18K",
            "width": "0.4 inches",
            "approx_gross_weight": "3.5g"
        },
        "stone_info": {
            "stone_1_name": "Round Brilliant Diamond",
            "stone_1_weight": "1.0 Carat (Total)"
        },
        "other_info": {
            "chain_included": "N/A",
            "earring_type": "Stud",
            "gold_certification": "IGI Certified",
            "metal_finish": "Rhodium Plated",
            "occasion": "Daily Wear, Gifting"
        },
        "return_policy": {
            "return_days": "30 Days Money Back"
        }
    },
    {
        "name": "Ornate Silver Pooja Thali Set",
        "sku": "TL-SLV-503",
        "price": 42000,
        "original_price": 45000,
        "discount_text": "925 Sterling Silver",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": silver_url,
        "gallery_urls": [silver_url] if silver_url else [],
        "category_id": "cat-silver",
        "is_on_sale": True,
        "sale_price": 42000,
        "sale_label": "FESTIVE POOJA",
        "status": "active",
        "stock": 10,
        "weight": "350g",
        "tags": "pooja,thali,silver,sterling,925",
        "vendor": "Samruddhi Gold Palace",
        "seo_title": "Sterling Silver Pooja Thali Set | Samruddhi Gold Palace",
        "seo_description": "Pure 925 sterling silver pooja thali set with intricately engraved details, perfect for auspicious occasions.",
        "description": "Embellish your spiritual rituals with our Ornate Silver Pooja Thali Set. Handcrafted from pure 92.5% sterling silver, this comprehensive set includes a beautiful engraved platter, a classic oil lamp (diyas), incense holder, and sacred offering bowls.",
        "quantity": 1,
        "price_breakup": {
            "metal_value": 35000,
            "gold_rate": "₹95/g",
            "gold_weight": "350g",
            "stone_value": 0,
            "stone_weight": "None",
            "making_charges_value": 7000,
            "making_charges_final": 7000,
            "sub_total_value": 42000,
            "sub_total_final": 42000,
            "tax_value": 1260,
            "tax_final": 1260,
            "grand_total_value": 43260,
            "grand_total_final": 43260
        },
        "basic_info": {
            "height": "1.2 inches",
            "material": "925 Sterling Silver",
            "metal": "Silver",
            "metal_purity": "92.5%",
            "width": "10.0 inches",
            "approx_gross_weight": "350g"
        },
        "stone_info": {
            "stone_1_name": "None",
            "stone_1_weight": "N/A"
        },
        "other_info": {
            "chain_included": "N/A",
            "earring_type": "N/A",
            "gold_certification": "Hallmarked Silver",
            "metal_finish": "High Polish",
            "occasion": "Festive, Pooja, Gifting"
        },
        "return_policy": {
            "return_days": "15 Days Exchange Only"
        }
    },
    {
        "name": "Luxurious 22K Gold Kada Bangle",
        "sku": "BG-GLD-504",
        "price": 165000,
        "original_price": 180000,
        "discount_text": "Festive Collection",
        "ready_to_dispatch": True,
        "transit_insurance": True,
        "image_url": bangle_url,
        "gallery_urls": [bangle_url] if bangle_url else [],
        "category_id": "cat-gold",
        "is_on_sale": True,
        "sale_price": 165000,
        "sale_label": "NEW IN STORE",
        "status": "active",
        "stock": 6,
        "weight": "24.2g",
        "tags": "bangles,gold,kada,22k,traditional",
        "vendor": "Samruddhi Gold Palace",
        "seo_title": "Luxurious 22K Gold Kada Bangle | Samruddhi Gold Palace",
        "seo_description": "Stunning 22K yellow gold Kada bangle with a unique matte and high-polish finish, hallmarked for purity.",
        "description": "Make a bold statement with our Luxurious 22K Gold Kada Bangle. Showcasing exquisite craftsmanship, it blends a modern matte texture with traditional high-polish engraving. Equipped with a secure screw clasp, it's a timeless heirloom to pass down.",
        "quantity": 1,
        "price_breakup": {
            "metal_value": 155000,
            "gold_rate": "₹6,800/g",
            "gold_weight": "22.8g",
            "stone_value": 0,
            "stone_weight": "None",
            "making_charges_value": 20000,
            "making_charges_discount": 10000,
            "making_charges_final": 10000,
            "sub_total_value": 165000,
            "sub_total_final": 165000,
            "tax_value": 4950,
            "tax_final": 4950,
            "grand_total_value": 169950,
            "grand_total_final": 169950
        },
        "basic_info": {
            "height": "2.4 inches",
            "material": "22K Yellow Gold",
            "metal": "Yellow Gold",
            "metal_purity": "22K",
            "width": "0.5 inches",
            "approx_gross_weight": "24.2g"
        },
        "stone_info": {
            "stone_1_name": "None",
            "stone_1_weight": "N/A"
        },
        "other_info": {
            "chain_included": "N/A",
            "earring_type": "N/A",
            "gold_certification": "BIS Hallmark",
            "metal_finish": "Matte & Polish Mix",
            "occasion": "Party Wear, Festive, Traditional"
        },
        "return_policy": {
            "return_days": "15 Days Money Back"
        }
    }
]

print("\nCreating products in production...")
for p in new_products:
    print(f"Creating product: {p['name']} (SKU: {p['sku']})...")
    res = requests.post(PRODUCT_API, headers=headers, json=p)
    if res.status_code in [200, 201]:
        print("Success!")
    else:
        print(f"Failed: {res.status_code} {res.text}")
