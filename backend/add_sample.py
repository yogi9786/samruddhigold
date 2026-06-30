import asyncio
import os
import sys

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def add_samples():
    from app.core.database import get_product_collection
    collection = get_product_collection()
    
    # Clear existing products to avoid duplicates when running multiple times
    await collection.delete_many({})
    
    products = [
        {
            'name': 'Exquisite 22K Gold Ruby Ring',
            'sku': 'RR-2045',
            'price': 65000,
            'original_price': 72000,
            'discount_text': 'Flat 10% Off',
            'image_url': 'https://images.unsplash.com/photo-1605100804763-247f67b8548e?auto=format&fit=crop&w=800&q=80',
            'gallery_urls': [
                'https://images.unsplash.com/photo-1605100804763-247f67b8548e?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1599643477873-fc3ee62f59ce?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
            ],
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
        },
        {
            'name': 'Classic 18K Diamond Necklace',
            'sku': 'DN-1092',
            'price': 145000,
            'original_price': 160000,
            'discount_text': 'Flat 15% Off',
            'image_url': 'https://images.unsplash.com/photo-1599643478514-4a4e0f065f8a?auto=format&fit=crop&w=800&q=80',
            'gallery_urls': [
                'https://images.unsplash.com/photo-1599643478514-4a4e0f065f8a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ],
            'ready_to_dispatch': True,
            'transit_insurance': True,
            'price_breakup': {
                'metal_value': 85000,
                'gold_rate': '₹5,300/g',
                'gold_weight': '16.0g',
                'stone_value': 45000,
                'stone_weight': '2.5ct',
                'making_charges_value': 15000,
                'making_charges_discount': 0,
                'making_charges_final': 15000,
                'sub_total_value': 145000,
                'sub_total_final': 145000,
                'tax_value': 4350,
                'tax_final': 4350,
                'grand_total_value': 149350,
                'grand_total_final': 149350
            },
            'basic_info': {
                'height': '1.5 inches',
                'material': 'Gold & Diamonds',
                'metal': 'White Gold',
                'metal_purity': '18K',
                'width': '6.0 inches',
                'approx_gross_weight': '16.5g'
            },
            'stone_info': {
                'stone_1_name': 'VVS Diamonds',
                'stone_1_weight': '2.5 Carat'
            },
            'other_info': {
                'chain_included': 'Yes',
                'earring_type': 'N/A',
                'gold_certification': 'IGI Certified',
                'metal_finish': 'Rhodium Plated',
                'occasion': 'Wedding, Party'
            },
            'return_policy': {
                'return_days': '30 Days Money Back'
            }
        },
        {
            'name': 'Elegant 22K Gold Bangle Set',
            'sku': 'GB-3321',
            'price': 185000,
            'original_price': 185000,
            'discount_text': None,
            'image_url': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            'gallery_urls': [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1599643477873-fc3ee62f59ce?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ],
            'ready_to_dispatch': False,
            'transit_insurance': True,
            'price_breakup': {
                'metal_value': 150000,
                'gold_rate': '₹6,500/g',
                'gold_weight': '23.0g',
                'stone_value': 0,
                'stone_weight': 'N/A',
                'making_charges_value': 35000,
                'making_charges_discount': 0,
                'making_charges_final': 35000,
                'sub_total_value': 185000,
                'sub_total_final': 185000,
                'tax_value': 5550,
                'tax_final': 5550,
                'grand_total_value': 190550,
                'grand_total_final': 190550
            },
            'basic_info': {
                'height': '0.4 inches',
                'material': 'Pure Gold',
                'metal': 'Yellow Gold',
                'metal_purity': '22K',
                'width': '2.4 inches',
                'approx_gross_weight': '23.0g'
            },
            'stone_info': {},
            'other_info': {
                'chain_included': 'N/A',
                'earring_type': 'N/A',
                'gold_certification': 'BIS Hallmark',
                'metal_finish': 'Matte Finish',
                'occasion': 'Bridal, Festive'
            },
            'return_policy': {
                'return_days': '15 Days Exchange'
            }
        },
        {
            'name': 'Royal Kundan Choker Necklace',
            'sku': 'KN-5542',
            'price': 250000,
            'original_price': 280000,
            'discount_text': 'Flat ₹30,000 Off',
            'image_url': 'https://images.unsplash.com/photo-1599643477873-fc3ee62f59ce?auto=format&fit=crop&w=800&q=80',
            'gallery_urls': [
                'https://images.unsplash.com/photo-1599643477873-fc3ee62f59ce?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1605100804763-247f67b8548e?auto=format&fit=crop&w=800&q=80'
            ],
            'ready_to_dispatch': True,
            'transit_insurance': True,
            'price_breakup': {
                'metal_value': 180000,
                'gold_rate': '₹6,500/g',
                'gold_weight': '27.6g',
                'stone_value': 25000,
                'stone_weight': '4.2ct',
                'making_charges_value': 45000,
                'making_charges_discount': 0,
                'making_charges_final': 45000,
                'sub_total_value': 250000,
                'sub_total_final': 250000,
                'tax_value': 7500,
                'tax_final': 7500,
                'grand_total_value': 257500,
                'grand_total_final': 257500
            },
            'basic_info': {
                'height': '2.5 inches',
                'material': 'Gold, Kundan & Pearls',
                'metal': 'Yellow Gold',
                'metal_purity': '22K',
                'width': '5.0 inches',
                'approx_gross_weight': '35.0g'
            },
            'stone_info': {
                'stone_1_name': 'Kundan',
                'stone_1_weight': '4.2 Carat'
            },
            'other_info': {
                'chain_included': 'Yes',
                'earring_type': 'Includes matching earrings',
                'gold_certification': 'BIS Hallmark',
                'metal_finish': 'Antique Finish',
                'occasion': 'Bridal, Wedding'
            },
            'return_policy': {
                'return_days': 'No Returns on Custom/Kundan Jewelry'
            }
        }
    ]
    
    await collection.insert_many(products)
    print(f'Successfully added {len(products)} gorgeous sample products to the database!')

if __name__ == '__main__':
    asyncio.run(add_samples())
