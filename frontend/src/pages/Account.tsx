import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { User, LogOut, Package, MapPin, Heart, CreditCard, Plus, Trash2, Download, Truck } from 'lucide-react';

import { getImageUrl } from '../api';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getInitialTab = () => {
    const tabFromState = (location.state as any)?.tab;
    const tabFromQuery = searchParams.get('tab');
    return tabFromState || tabFromQuery || 'profile';
  };

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setAddresses(data.addresses || []);
        setProfileForm({
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } else {
        localStorage.removeItem('access_token');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profileForm.full_name,
          username: profileForm.username,
          email: profileForm.email,
          phone: profileForm.phone
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const errorData = await res.json();
        setProfileMessage({ type: 'error', text: errorData.detail || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUpdatingProfile(false);
    }
  };


  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const tabFromState = (location.state as any)?.tab;
    const tabFromQuery = searchParams.get('tab');
    const targetTab = tabFromState || tabFromQuery;
    if (targetTab && targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  }, [location.state, searchParams]);

  useEffect(() => {
    if (user) {
      loadTabData(activeTab);
    }
  }, [activeTab, user]);

  const loadTabData = async (tab: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setLoadingData(true);
    
    try {
      if (tab === 'orders') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } else if (tab === 'payments') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/my-payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setPayments(await res.json());
        
        // Also fetch orders so payment invoices have full order items context
        const resO = await fetch(`${import.meta.env.VITE_API_URL}/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resO.ok) setOrders(await resO.json());
      } else if (tab === 'wishlist') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlist/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setWishlist(await res.json());
      }
    } catch (err) {
      console.error(`Failed to fetch data for ${tab}`, err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
      } else {
        const data = await res.json();
        setPasswordMessage({ type: 'error', text: data.detail || 'Failed to update password' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const updatedAddresses = [...addresses, newAddress];
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/addresses`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedAddresses)
      });
      if (res.ok) {
        setAddresses(updatedAddresses);
        setShowAddressForm(false);
        setNewAddress({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'India' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    const token = localStorage.getItem('access_token');
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/addresses`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedAddresses)
      });
      if (res.ok) {
        setAddresses(updatedAddresses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF7F2] flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#801416] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7F2] flex flex-col font-sans">
      <Header />
      
      <div className="flex-grow py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-[#5F1517] mb-8 text-center">My Account</h1>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#5F1517]/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            <div className="w-full md:w-64 lg:w-72 bg-[#5F1517]/5 p-6 border-b md:border-b-0 md:border-r border-[#5F1517]/10 flex-shrink-0">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#801416] rounded-full flex items-center justify-center text-white text-2xl font-serif shadow-md flex-shrink-0">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#5F1517] truncate">{user.full_name || user.username}</h2>
                  <p className="text-sm text-[#5F1517]/60 truncate break-all">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#801416] text-white shadow-sm' : 'text-[#5F1517] hover:bg-white'}`}
                >
                  <User size={18} /> Profile Details
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-[#801416] text-white shadow-sm' : 'text-[#5F1517] hover:bg-white'}`}
                >
                  <Package size={18} /> My Orders
                </button>
                <button 
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'payments' ? 'bg-[#801416] text-white shadow-sm' : 'text-[#5F1517] hover:bg-white'}`}
                >
                  <CreditCard size={18} /> Payment History
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'wishlist' ? 'bg-[#801416] text-white shadow-sm' : 'text-[#5F1517] hover:bg-white'}`}
                >
                  <Heart size={18} /> Wishlist
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'addresses' ? 'bg-[#801416] text-white shadow-sm' : 'text-[#5F1517] hover:bg-white'}`}
                >
                  <MapPin size={18} /> Saved Addresses
                </button>
              </div>
            </div>
            
            <div className="w-full p-6 md:p-10 flex-grow">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-[#5F1517] mb-2">Profile Information</h3>
                  <p className="text-sm text-[#5F1517]/70 mb-6">
                    Update your account information. Make sure your WhatsApp phone number is up to date to receive cart reminders & order updates!
                  </p>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#5F1517] mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                          placeholder="Your full name"
                          className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-white text-[#5F1517] focus:outline-none focus:border-[#801416] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5F1517] mb-1">Username</label>
                        <input 
                          type="text" 
                          value={profileForm.username}
                          onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                          placeholder="Username"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-white text-[#5F1517] focus:outline-none focus:border-[#801416] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5F1517] mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-white text-[#5F1517] focus:outline-none focus:border-[#801416] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5F1517] mb-1 flex items-center justify-between">
                          <span>Phone Number (WhatsApp)</span>
                          <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">WhatsApp Enabled</span>
                        </label>
                        <input 
                          type="tel" 
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-white text-[#5F1517] focus:outline-none focus:border-[#801416] font-medium"
                        />
                        <p className="text-xs text-gray-500 mt-1">Add your 10-digit mobile number to receive product cart notifications on WhatsApp.</p>
                      </div>
                    </div>

                    {profileMessage.text && (
                      <div className={`p-3.5 rounded-xl text-sm font-semibold ${profileMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {profileMessage.text}
                      </div>
                    )}

                    <div>
                      <button 
                        type="submit" 
                        disabled={updatingProfile}
                        className="px-6 py-3 bg-[#801416] text-white rounded-xl font-semibold hover:bg-[#5F1517] transition-all shadow-md disabled:opacity-50"
                      >
                        {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>


                  {user.auth_provider === 'google' && (
                    <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                      </svg>
                      Google Connected
                    </div>
                  )}

                  <div className="border-t border-[#5F1517]/10 pt-8 mt-4">
                    <h4 className="text-lg font-bold text-[#5F1517] mb-4">Set / Update Password</h4>
                    <p className="text-sm text-gray-500 mb-4">You can set a password here to login via email.</p>
                    <form onSubmit={handleUpdatePassword} className="max-w-sm space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#5F1517]/70 mb-1">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-white text-[#5F1517] focus:outline-none focus:border-[#801416]"
                        />
                      </div>
                      {passwordMessage.text && (
                        <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                          {passwordMessage.text}
                        </p>
                      )}
                      <button type="submit" className="px-6 py-2 bg-[#801416] text-white rounded-lg font-medium hover:bg-[#5F1517] transition-colors">
                        Update Password
                      </button>
                    </form>
                  </div>
                  
                  <div className="pt-8 mt-8 border-t border-[#5F1517]/10">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors w-full md:w-auto"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-[#5F1517] mb-6">My Orders</h3>
                  {loadingData ? (
                    <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#801416] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order, idx) => {
                        const shipStatus = order.shipping_status || (order.status === 'Shipped' ? 'Shipped' : 'Not Shipped');
                        return (
                          <div key={idx} className="border border-[#5F1517]/10 rounded-xl p-5 bg-white shadow-sm hover:shadow transition">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#5F1517]/5 pb-3 mb-3 gap-2">
                              <div>
                                <p className="text-xs text-gray-400 font-mono font-semibold">Order ID: #{order.id.substring(0,8).toUpperCase()}</p>
                                <p className="text-sm font-medium text-[#5F1517]">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  order.status === 'Payment Successful' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            {/* Shipping & Delivery Info Banner */}
                            <div className="mb-4 p-3 bg-[#FFF7F2] rounded-xl border border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#801416]/10 text-[#801416] flex items-center justify-center flex-shrink-0">
                                  <Truck size={18} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#5F1517] flex items-center gap-2">
                                    Shipping Status: 
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      shipStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                      shipStatus === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                      shipStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                                      'bg-amber-100 text-amber-800'
                                    }`}>
                                      {shipStatus}
                                    </span>
                                  </p>
                                  {order.shipped_at && (
                                    <p className="text-[11px] text-gray-500">Shipped on {new Date(order.shipped_at).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </div>

                              {(order.courier_name || order.tracking_number) && (
                                <div className="text-xs bg-white p-2 rounded-lg border border-[#5F1517]/10 flex flex-col sm:items-end">
                                  {order.courier_name && (
                                    <span className="font-semibold text-[#5F1517]">Courier: <span className="text-[#801416] font-bold">{order.courier_name}</span></span>
                                  )}
                                  {order.tracking_number && (
                                    <span className="font-mono text-gray-600 text-[11px]">Tracking #: <span className="font-bold text-gray-900">{order.tracking_number}</span></span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              {order.items.map((item: any, i: number) => {
                                const itemName = item?.name || item?.product?.name || item?.title || item?.product_name || item?.product_title || 'Jewellery Item';
                                const itemImg = item?.image_url || item?.product?.image_url || item?.image || item?.product_image || '';
                                const itemPrice = Number(item?.price || item?.product?.price || 0);
                                return (
                                  <div key={i} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                                      {itemImg ? (
                                        <img src={getImageUrl(itemImg)} alt={itemName} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[10px] text-gray-400 font-semibold">No Image</span>
                                      )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <p className="text-sm font-medium text-[#5F1517] truncate">{itemName}</p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-[#801416] text-sm flex-shrink-0">₹{(itemPrice * item.quantity).toLocaleString('en-IN')}</p>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#5F1517]/5 flex justify-between items-center">
                              <div>
                                <p className="font-medium text-[#5F1517] text-xs">Total Amount</p>
                                <p className="font-bold text-lg text-[#801416]">₹{order.total_amount.toLocaleString('en-IN')}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const payment = payments.find(p => p.order_id === order.id) || { razorpay_payment_id: order.razorpay_payment_id || 'N/A', status: order.status, amount: order.total_amount, created_at: order.created_at };
                                  generateInvoicePDF(order, payment, user);
                                }}
                                className="px-4 py-2 bg-[#FFF7F2] text-[#801416] font-bold text-xs rounded-xl flex items-center gap-2 border border-[#D4AF37]/40 hover:bg-[#801416] hover:text-white transition shadow-sm"
                              >
                                <Download size={14} /> Download Invoice
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-[#5F1517]/10 rounded-xl">
                      <Package size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No orders found.</p>
                      <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-[#801416] text-white rounded-lg text-sm hover:bg-[#5F1517]">Start Shopping</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-[#5F1517] mb-6">Payment History</h3>
                  {loadingData ? (
                     <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#801416] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                  ) : payments.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-[#5F1517]/10">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#5F1517]/5 text-[#5F1517] text-sm">
                            <th className="p-4 font-semibold border-b border-[#5F1517]/10">Date</th>
                            <th className="p-4 font-semibold border-b border-[#5F1517]/10">Payment ID</th>
                            <th className="p-4 font-semibold border-b border-[#5F1517]/10">Order ID</th>
                            <th className="p-4 font-semibold border-b border-[#5F1517]/10">Amount</th>
                            <th className="p-4 font-semibold border-b border-[#5F1517]/10">Status</th>
                            <th className="p-4 font-semibold border-b border-[#5F1517]/10 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p, idx) => (
                            <tr key={idx} className="bg-white border-b border-[#5F1517]/5 hover:bg-gray-50">
                              <td className="p-4 text-sm text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
                              <td className="p-4 text-sm text-gray-600 font-mono text-xs">{p.razorpay_payment_id}</td>
                              <td className="p-4 text-sm text-gray-600 font-mono text-xs">{p.order_id.substring(0,8)}...</td>
                              <td className="p-4 font-bold text-[#801416]">₹{p.amount.toLocaleString('en-IN')}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status.toLowerCase() === 'captured' || p.status.toLowerCase() === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => {
                                    const matchingOrder = orders.find(o => o.id === p.order_id) || { id: p.order_id, total_amount: p.amount };
                                    generateInvoicePDF(matchingOrder, p, user);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4AF37]/50 text-[#5F1517] text-xs font-bold rounded-lg hover:bg-[#FFF7F2] transition shadow-sm"
                                >
                                  <Download size={14} /> Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-[#5F1517]/10 rounded-xl">
                      <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No payment history.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-[#5F1517] mb-6">My Wishlist</h3>
                  {loadingData ? (
                     <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#801416] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                  ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {wishlist.map((item, idx) => (
                        <div key={idx} className="bg-white border border-[#5F1517]/10 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/shop/${item.id}`)}>
                          <div className="aspect-square bg-[#FFF7F2] relative">
                            {item.image_url ? (
                              <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt={item.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart size={30} /></div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm font-bold text-[#5F1517] truncate">{item.name}</h4>
                            <p className="text-xs text-[#801416] font-semibold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-[#5F1517]/10 rounded-xl">
                      <Heart size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">Your wishlist is empty.</p>
                      <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-[#801416] text-white rounded-lg text-sm hover:bg-[#5F1517]">Explore Collections</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#5F1517]">Saved Addresses</h3>
                    <button 
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#801416] text-white rounded-lg text-sm hover:bg-[#5F1517] transition"
                    >
                      {showAddressForm ? 'Cancel' : <><Plus size={16} /> Add New</>}
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="bg-white p-5 rounded-xl border border-[#5F1517]/20 shadow-sm mb-6 animate-in slide-in-from-top-4 duration-300">
                      <h4 className="font-bold text-[#5F1517] mb-4">Add New Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Label (e.g. Home, Office)</label>
                          <input required type="text" value={newAddress.label} onChange={(e) => setNewAddress({...newAddress, label: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#801416]" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Street Address</label>
                          <textarea required value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#801416]" rows={2}></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                          <input required type="text" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#801416]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                          <input required type="text" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#801416]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ZIP / Postal Code</label>
                          <input required type="text" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#801416]" />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button type="submit" className="px-5 py-2 bg-[#801416] text-white font-medium rounded-lg hover:bg-[#5F1517]">Save Address</button>
                      </div>
                    </form>
                  )}

                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr, idx) => (
                        <div key={idx} className="bg-white border border-[#5F1517]/10 rounded-xl p-5 relative group">
                          <button 
                            onClick={() => handleDeleteAddress(idx)}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Address"
                          >
                            <Trash2 size={16} />
                          </button>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase mb-2">{addr.label}</span>
                          <p className="text-[#5F1517] font-medium text-sm whitespace-pre-line">{addr.street}</p>
                          <p className="text-[#5F1517]/70 text-sm mt-1">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-[#5F1517]/70 text-sm">{addr.country}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-[#5F1517]/10 rounded-xl">
                      <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No saved addresses.</p>
                    </div>
                  )}
                </div>
              )}
              
            </div>
            
          </div>
        </div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Account;
