import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, getImageUrl } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Package } from 'lucide-react';
import api from '../api';
import LogoSpinner from '../components/LogoSpinner';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  basic_info?: { approx_gross_weight?: string; metal_purity?: string };
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          await api.get('/auth/me');
        }
        const cartRes = await getCart();
        setCartItems(cartRes.data);
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    
    try {
      await updateCartItem(itemId, newQty);
      setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  // Standard Indian jewellery charges / GST (3% GST + mock making charge estimation or just subtotal)
  const gst = Math.round(subtotal * 0.03);
  const delivery = 0; // Free delivery
  const total = subtotal + gst + delivery;

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col font-outfit">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-serif text-[var(--color-royal)] mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" /> Shopping Bag
        </h1>

        {loading ? (
          <LogoSpinner size="md" text="Loading your shopping bag..." />
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[var(--color-gold)]/20 max-w-2xl mx-auto">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-medium text-gray-600 mb-2">Your shopping bag is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any beautiful pieces to your bag yet.</p>
            <Link to="/shop" className="bg-[var(--color-royal)] text-white px-8 py-3 rounded-full font-medium hover:bg-blue-900 transition-colors inline-block">
              Explore Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-3.5">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={item.id} className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex items-start gap-3 sm:gap-5 relative group transition hover:border-gray-200">
                    {/* Left: Small Product Image Thumbnail */}
                    <Link to={`/shop/${product.id}`} className="w-16 h-16 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={getImageUrl(product.image_url)} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </Link>

                    {/* Right: Content Details */}
                    <div className="flex-grow min-w-0 flex flex-col justify-between self-stretch pr-6 sm:pr-8">
                      <div>
                        <Link to={`/shop/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base hover:text-[var(--color-royal)] transition-colors truncate" title={product.name}>
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 uppercase tracking-wider">SKU: {product.id.substring(0, 8).toUpperCase()}</p>
                        
                        {product.basic_info && (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-gray-500 mt-1">
                            {product.basic_info.metal_purity && (
                              <span>Purity: <strong className="text-gray-700">{product.basic_info.metal_purity}</strong></span>
                            )}
                            {product.basic_info.approx_gross_weight && (
                              <span>Weight: <strong className="text-gray-700">{product.basic_info.approx_gross_weight}g</strong></span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Quantity Selector + Price */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100 sm:border-0 sm:pt-0">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-200 rounded-full h-7 sm:h-8 overflow-hidden bg-gray-50">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="w-6 sm:w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs sm:text-sm font-semibold text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="w-6 sm:w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#801416] sm:text-gray-900 text-sm sm:text-base">
                            ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {product.original_price && (
                            <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                              ₹{(product.original_price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trash Delete Button */}
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-6">
              <h2 className="text-xl font-serif text-[var(--color-royal)] pb-4 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-3.5 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-950">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (3%)</span>
                  <span className="font-medium text-gray-950">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between text-base font-semibold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl font-bold text-[var(--color-royal)]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout details or checkout button */}
              <button 
                onClick={() => {
                  if (localStorage.getItem('access_token')) {
                    navigate('/checkout');
                  } else {
                    sessionStorage.setItem('redirect_after_login', '/checkout');
                    window.dispatchEvent(new Event('openLoginModal'));
                  }
                }}
                className="w-full bg-[var(--color-royal)] hover:bg-blue-900 text-white py-3.5 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500 justify-center">
                <ShieldCheck className="w-5 h-5 text-[var(--color-gold)] flex-shrink-0" />
                <span>100% Insured & Safe Shipping Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
