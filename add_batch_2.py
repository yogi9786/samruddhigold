import requests
import os

BASE_URL = 'https://sirisamruddhigold.com/api'
USERNAME = 'siriadmin'
PASSWORD = 'adminpassword'
UPLOAD_API = f'{BASE_URL}/products/upload-image'

login_response = requests.post(f'{BASE_URL}/auth/token', data={'username': USERNAME, 'password': PASSWORD})
if login_response.status_code != 200:
    print('Failed to login:', login_response.text)
    exit(1)

token = login_response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

def upload_image(filepath):
    if not os.path.exists(filepath):
        print(f'File {filepath} not found.')
        return None
    with open(filepath, 'rb') as f:
        files = {'file': (os.path.basename(filepath), f, 'image/png')}
        res = requests.post(UPLOAD_API, headers=headers, files=files)
        if res.status_code == 200:
            return res.json()['url']
        else:
            print(f'Upload failed: {res.text}')
            return None

images_dir = r'C:\Users\wheny\.gemini\antigravity-ide\brain\a6fb3165-a100-445d-afbc-87678a9ce385'

img1 = upload_image(os.path.join(images_dir, 'gold_chain_1783587938227.png'))
img2 = upload_image(os.path.join(images_dir, 'platinum_bracelet_1783587953206.png'))
img3 = upload_image(os.path.join(images_dir, 'diamond_stud_earrings_1783587968872.png'))
img4 = upload_image(os.path.join(images_dir, 'gold_signet_ring_1783587984130.png'))

new_products = [
    {
        'name': '22K Gold Rope Chain',
        'sku': 'CH-GLD-009',
        'price': 45000,
        'ready_to_dispatch': True,
        'transit_insurance': True,
        'image_url': img1,
        'status': 'active',
        'stock': 10,
        'category_id': 'Gold',
        'weight': '10g',
        'tags': 'chain,gold,22k'
    },
    {
        'name': 'Platinum Diamond Bracelet',
        'sku': 'BR-PLA-010',
        'price': 155000,
        'original_price': 175000,
        'is_on_sale': True,
        'sale_price': 155000,
        'sale_label': 'SALE',
        'ready_to_dispatch': True,
        'transit_insurance': True,
        'image_url': img2,
        'status': 'active',
        'stock': 3,
        'category_id': 'Platinum',
        'weight': '20g',
        'tags': 'bracelet,platinum,diamond'
    },
    {
        'name': 'Diamond Stud Earrings',
        'sku': 'ER-DIA-011',
        'price': 85000,
        'ready_to_dispatch': True,
        'transit_insurance': True,
        'image_url': img3,
        'status': 'active',
        'stock': 5,
        'category_id': 'Diamond',
        'weight': '4g',
        'tags': 'earrings,diamond,stud'
    },
    {
        'name': 'Classic Gold Signet Ring',
        'sku': 'RG-GLD-012',
        'price': 35000,
        'ready_to_dispatch': True,
        'transit_insurance': True,
        'image_url': img4,
        'status': 'active',
        'stock': 12,
        'category_id': 'Gold',
        'weight': '8g',
        'tags': 'ring,gold,signet'
    }
]

for p in new_products:
    print(f'Creating product: {p["name"]}...')
    res = requests.post(f'{BASE_URL}/products', headers=headers, json=p)
    if res.status_code in [200, 201]:
        print('Success')
    else:
        print(f'Failed to create product: {res.status_code} {res.text}')
