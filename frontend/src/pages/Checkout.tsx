import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api, { getCart, checkoutOrder, verifyPayment, getCartUserId, getImageUrl } from '../api';
import logo from '../assets/samruddhi-logo.png';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { ShieldCheck, CreditCard, Lock, CheckCircle, Download, ShoppingBag, ChevronDown, ChevronUp, Package } from 'lucide-react';

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
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

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
            setUserProfile(userRes.data);
            
            let streetVal = '';
            let cityVal = '';
            let stateVal = '';
            let zipVal = '';
            let countryVal = 'India';

            if (userRes.data.addresses && Array.isArray(userRes.data.addresses) && userRes.data.addresses.length > 0) {
              const defAddr = userRes.data.addresses.find((a: any) => a.isDefault) || userRes.data.addresses[0];
              if (defAddr) {
                if (typeof defAddr === 'object') {
                  streetVal = defAddr.street || defAddr.fullAddress || '';
                  cityVal = defAddr.city || '';
                  stateVal = defAddr.state || '';
                  zipVal = defAddr.zip || '';
                  countryVal = defAddr.country || 'India';
                } else if (typeof defAddr === 'string') {
                  streetVal = defAddr;
                }
              }
            }

            setFormData(prev => ({
              ...prev,
              fullName: userRes.data.full_name || prev.fullName,
              email: userRes.data.email || prev.email,
              phone: userRes.data.phone || prev.phone,
              street: streetVal || prev.street,
              city: cityVal || prev.city,
              state: stateVal || prev.state,
              zip: zipVal || prev.zip,
              country: countryVal || prev.country
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

  const handlePaymentSuccess = async (order: any, paymentId: string) => {
    try {
      await api.delete(`/cart?user_id=${getCartUserId()}`);
      window.dispatchEvent(new Event('cartUpdated'));

      const finishedOrder = {
        id: order.id || order.razorpay_order_id,
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: paymentId,
        full_name: formData.fullName,
        email: formData.email,
        contact_phone: formData.phone,
        shipping_address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`,
        total_amount: total,
        items: cartItems.map(item => ({
          name: item.product?.name || 'Jewellery Item',
          price: item.product?.price || 0,
          quantity: item.quantity,
          product: item.product
        })),
        created_at: new Date().toISOString(),
        status: 'Payment Successful'
      };

      setCompletedOrder(finishedOrder);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error finishing payment flow:', err);
    }
  };

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
          price: item.product?.price || 0,
          name: item.product?.name || 'Jewellery Item',
          image_url: item.product?.image_url || '',
          product: {
            name: item.product?.name,
            image_url: item.product?.image_url
          }
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
          handler: async function (res: any) {
            try {
              await verifyPayment({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature
              });
              await handlePaymentSuccess(order, res.razorpay_payment_id);
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
            color: "#5F1517"
          }
        };
        // @ts-ignore
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (res: any){
          alert("Payment Failed: " + res.error.description);
        });
        rzp1.open();
      } else {
        // Mock success flow
        const mockPaymentId = "mock_payment_" + Math.random().toString(36).substring(7);
        await verifyPayment({
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "mock_signature"
        });
        await handlePaymentSuccess(order, mockPaymentId);
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

  if (cartItems.length === 0 && !showSuccessModal) {
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
      
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-serif text-[var(--color-royal)] mb-4 sm:mb-8 flex items-center gap-2.5">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8" /> Secure Checkout
        </h1>

        {/* ── MOBILE COMPACT ORDER SUMMARY TAB ── */}
        <div className="block lg:hidden mb-5 bg-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-gray-200">
          <button 
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShoppingBag className="w-5 h-5 text-[var(--color-royal)] flex-shrink-0" />
              <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                Order Summary ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-extrabold text-[var(--color-royal)] text-sm sm:text-base">
                ₹{total.toLocaleString('en-IN')}
              </span>
              {showMobileSummary ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </button>

          {showMobileSummary && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/80 border border-gray-100">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200 flex items-center justify-center">
                      {item.product?.image_url ? (
                        <img 
                          src={getImageUrl(item.product.image_url)} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 truncate" title={item.product?.name}>
                          {item.product?.name || 'Product'}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-royal)] whitespace-nowrap flex-shrink-0">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (3%)</span>
                  <span className="font-medium text-gray-900">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Delivery Details</h2>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number (WhatsApp Notifications)</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input 
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                    placeholder="House No, Building, Street Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
                    <input 
                      type="text" 
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input 
                      type="text" 
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop Order Summary Panel */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 h-fit space-y-5">
            <h2 className="text-lg sm:text-xl font-serif text-[var(--color-royal)] pb-3 border-b border-gray-100 font-bold">Order Summary</h2>
            
            <div className="space-y-3 max-h-56 sm:max-h-64 overflow-y-auto pr-1.5 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200 flex items-center justify-center">
                    {item.product?.image_url ? (
                      <img 
                        src={getImageUrl(item.product.image_url)} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate" title={item.product?.name}>
                        {item.product?.name || 'Product'}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[var(--color-royal)] whitespace-nowrap flex-shrink-0">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 pt-3 border-t border-gray-100">
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
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between text-sm sm:text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-lg sm:text-xl font-bold text-[var(--color-royal)]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full bg-[var(--color-royal)] hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {submitting ? 'Processing...' : (
                <>
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" /> Pay ₹{total.toLocaleString('en-IN')}
                </>
              )}
            </button>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] sm:text-xs text-gray-500 justify-center">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-gold)] flex-shrink-0" />
              <span>Payments secured by Razorpay</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── THANK YOU / PAYMENT SUCCESS MODAL ── */}
      {showSuccessModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-center relative border border-[var(--color-gold)]/30 overflow-hidden">
            {/* Top Logo */}
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Samruddhi Gold Palace" className="h-14 object-contain" />
            </div>

            {/* Checkmark Icon */}
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200 shadow-sm">
              <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-royal)] mb-1">
              Thank You for Shopping!
            </h2>
            <p className="text-gray-600 text-sm mb-6 font-medium">
              Your order has been placed successfully and is protected with 100% insured delivery.
            </p>

            {/* Order Brief Box */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 text-left mb-6 border border-[#5F1517]/10 space-y-2.5 text-xs sm:text-sm text-gray-700">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="font-semibold text-[var(--color-royal)]">Order Reference</span>
                <span className="font-mono font-bold text-gray-900">
                  #{String(completedOrder.id).substring(0, 10).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Payment ID</span>
                <span className="font-mono text-gray-800">{completedOrder.razorpay_payment_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Customer</span>
                <span className="font-semibold text-gray-900">{completedOrder.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Amount Paid</span>
                <span className="font-bold text-base text-[var(--color-royal)]">
                  ₹{completedOrder.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 truncate">
                <span className="font-semibold text-gray-700">Delivery Address: </span>
                {completedOrder.shipping_address}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => generateInvoicePDF(completedOrder, { razorpay_payment_id: completedOrder.razorpay_payment_id, status: 'Success' }, userProfile)}
                className="flex items-center justify-center gap-2 bg-[var(--color-royal)] hover:bg-blue-900 text-white px-5 py-3 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" /> Download Invoice
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center justify-center gap-2 bg-[#5F1517] hover:bg-[#801416] text-white px-5 py-3 rounded-full font-semibold text-sm transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4" /> Explore More Jewellery
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate('/account?tab=orders', { state: { tab: 'orders' } })}
                className="text-xs text-gray-500 hover:text-[var(--color-royal)] underline font-medium cursor-pointer"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
