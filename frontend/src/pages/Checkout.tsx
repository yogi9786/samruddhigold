import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api, { getCart, checkoutOrder, verifyPayment } from '../api';
import { ShieldCheck, CreditCard, Lock } from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          const userRes = await api.get('/auth/me');
          if (userRes.data) {
            setFormData(prev => ({
              ...prev,
              fullName: userRes.data.full_name || '',
              email: userRes.data.email || '',
              phone: userRes.data.phone || '' // Assuming phone exists or is empty
            }));
          }
        }
        const cartRes = await getCart();
        setCartItems(cartRes.data);
      } catch (err) {
        console.error('Error fetching data for checkout:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndCart();
    
    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);
  const gst = Math.round(subtotal * 0.03);
  const total = subtotal + gst;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    setSubmitting(true);
    try {
      const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`;

      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0
        })),
        total_amount: total,
        shipping_address: fullAddress,
        contact_phone: formData.phone,
        email: formData.email,
        full_name: formData.fullName,
        payment_method: 'razorpay'
      };

      const response = await checkoutOrder(orderData);
      const order = response.data;

      // Check if Razorpay order was actually created (not mocked)
      if (order.razorpay_order_id && !order.razorpay_order_id.startsWith('mock_')) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Frontend Razorpay Key
          amount: total * 100, // in paise
          currency: "INR",
          name: "Samruddhi Gold Palace",
          description: "Jewellery Purchase",
          order_id: order.razorpay_order_id,
          handler: async function (response: any) {
            try {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              await api.delete('/cart');
              window.dispatchEvent(new Event('cartUpdated'));
              alert('Payment Successful!');
              navigate('/');
            } catch (err) {
              alert('Payment verification failed.');
              console.error(err);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#1e3a8a" // Royal blue
          }
        };
        // @ts-ignore
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
          alert("Payment Failed: " + response.error.description);
        });
        rzp1.open();
      } else {
        // Mock success flow
        await verifyPayment({
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: "mock_payment_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature"
        });
        await api.delete('/cart');
        window.dispatchEvent(new Event('cartUpdated'));
        alert('Order Placed Successfully! (Mock Payment)');
        navigate('/');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. ' + (err.response?.data?.detail || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f8] flex flex-col font-outfit">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-gold)]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f8] flex flex-col font-outfit">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-medium text-gray-600 mb-2">Your cart is empty</h2>
            <button onClick={() => navigate('/shop')} className="mt-4 bg-[var(--color-royal)] text-white px-8 py-3 rounded-full font-medium hover:bg-blue-900 transition-colors">
              Continue Shopping
            </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col font-outfit">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-serif text-[var(--color-royal)] mb-8 flex items-center gap-3">
          <Lock className="w-8 h-8" /> Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Delivery Details</h2>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input 
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                    placeholder="House No, Building, Street Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input 
                      type="text" 
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input 
                      type="text" 
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-6">
            <h2 className="text-xl font-serif text-[var(--color-royal)] pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex-grow pr-4 truncate" title={item.product?.name}>
                    {item.quantity} x {item.product?.name || 'Product'}
                  </span>
                  <span className="font-medium text-gray-900 whitespace-nowrap">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3.5 text-sm text-gray-600 pt-4 border-t border-gray-100">
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

            <button 
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full bg-[var(--color-royal)] hover:bg-blue-900 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {submitting ? 'Processing...' : (
                <>
                  <CreditCard className="w-5 h-5" /> Pay ₹{total.toLocaleString('en-IN')}
                </>
              )}
            </button>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500 justify-center">
              <ShieldCheck className="w-5 h-5 text-[var(--color-gold)] flex-shrink-0" />
              <span>Payments secured by Razorpay</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
