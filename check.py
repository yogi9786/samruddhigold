import requests
products = requests.get('https://sirisamruddhigold.com/api/products').json()
for p in products:
    print(f"{p.get('name')}: {p.get('image_url')}")
