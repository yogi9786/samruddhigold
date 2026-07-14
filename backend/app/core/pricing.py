from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Product as DBProduct, MetalPrice as DBMetalPrice

def calculate_dynamic_price(product: DBProduct, rates: dict) -> float:
    """
    Calculate dynamic jewelry price based on daily live gold/silver rates.
    Formula: Price = (Weight * Rate) + Making Charges - Making Discount + Stone Value + 3% GST
    """
    # If the product doesn't have a price breakup, basic info, or weight, return the static database price
    if not product.price_breakup or not product.basic_info:
        return product.price
        
    purity = str(product.basic_info.get("metal_purity") or '').lower()
    metal = str(product.basic_info.get("metal") or '').lower()
    
    # Find matching rate from database metal rates
    rate = None
    if "22k" in purity or "22 kt" in purity or "916" in purity:
        rate = rates.get("gold_22k")
    elif "24k" in purity or "24 kt" in purity:
        rate = rates.get("gold_24k")
    elif "18k" in purity or "18 kt" in purity or "750" in purity:
        rate = rates.get("gold_18k")
    elif "silver" in metal:
        rate = rates.get("silver")
        
    # If no daily rate in DB, fall back to product's saved rate in breakup or static price
    if not rate:
        rate = product.price_breakup.get("gold_rate")
        try:
            rate = float(rate) if rate else None
        except ValueError:
            rate = None
            
    if not rate:
        return product.price
        
    # Get weight
    weight = product.price_breakup.get("gold_weight") or product.basic_info.get("approx_gross_weight") or product.weight
    try:
        weight = float(weight) if weight else 0.0
    except (ValueError, TypeError):
        weight = 0.0
        
    if weight <= 0:
        return product.price
        
    # Metal Value
    metal_val = round(rate * weight)
    
    # Making charges
    making_charges = product.price_breakup.get("making_charges_value")
    making_discount = product.price_breakup.get("making_charges_discount") or 0.0
    
    if making_charges is None:
        # Default making charge estimation: 20.7% of metal value
        making_charges = round(metal_val * 0.207)
        making_discount = round(making_charges * 0.2)
        
    making_final = making_charges - making_discount
    
    # Stone value
    stone_val = product.price_breakup.get("stone_value") or 0.0
    
    # Subtotal final
    subtotal_final = metal_val + making_final + stone_val
    
    # Tax final (3% GST)
    tax_final = round(subtotal_final * 0.03)
    
    # Grand total final
    grand_total_final = subtotal_final + tax_final
    return float(grand_total_final)

async def get_live_rates(db: AsyncSession) -> dict:
    """Fetch daily metal rates and return as a lookup dict (slug -> price)"""
    rates_res = await db.execute(select(DBMetalPrice))
    return {r.id: r.price for r in rates_res.scalars().all()}
