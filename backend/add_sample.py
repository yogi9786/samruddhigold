import asyncio
from app.core.database import get_product_collection

async def add_sample():
    collection = get_product_collection()
    product = {
        'name': 'Exquisite 22K Gold Ruby Ring',
        'sku': 'RR-2045',
        'price': 65000,
        'original_price': 72000,
        'discount_text': 'Flat 10% Off',
        'image_url': 'http://127.0.0.1:8000/uploads/gold_ruby_ring.png',
        'ready_to_dispatch': True,
        'transit_insurance': True,
        'price_breakup': {
            'metal_value': 45000,
            'gold_rate': '₹6,500/g',
            'gold_weight': '6.9g',
            'stone_value': 12000,
            'stone_weight': '1.2ct',
            'making_charges_value': 8000,
            'making_charges_discount': 0,
            'making_charges_final': 8000,
            'sub_total_value': 65000,
            'sub_total_final': 65000,
            'tax_value': 1950,
            'tax_final': 1950,
            'grand_total_value': 66950,
            'grand_total_final': 66950
        },
        'basic_info': {
            'height': '0.8 inches',
            'material': 'Gold & Precious Stone',
            'metal': 'Yellow Gold',
            'metal_purity': '22K',
            'width': '0.6 inches',
            'approx_gross_weight': '7.1g'
        },
        'stone_info': {
            'stone_1_name': 'Natural Ruby',
            'stone_1_weight': '1.2 Carat'
        },
        'other_info': {
            'chain_included': 'N/A',
            'earring_type': 'N/A',
            'gold_certification': 'BIS Hallmark',
            'metal_finish': 'High Polish',
            'occasion': 'Engagement, Anniversary'
        },
        'return_policy': {
            'return_days': '15 Days Money Back'
        }
    }
    await collection.insert_one(product)
    print('Ruby ring product added successfully!')

if __name__ == '__main__':
    asyncio.run(add_sample())
