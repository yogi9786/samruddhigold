import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package, MapPin, Heart, CreditCard, Plus, Trash2 } from 'lucide-react';
import { getImageUrl } from '../api';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);
  
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
      } else {
        localStorage.removeItem('access_token');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

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
                  <h3 className="text-xl font-bold text-[#5F1517] mb-6">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-[#5F1517]/70 mb-1">Full Name</label>
                      <div className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-gray-50 text-[#5F1517] focus:outline-none">
                        {user.full_name || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5F1517]/70 mb-1">Username</label>
                      <div className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-gray-50 text-[#5F1517] focus:outline-none">
                        {user.username}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#5F1517]/70 mb-1">Email Address</label>
                      <div className="w-full px-4 py-3 rounded-xl border border-[#5F1517]/20 bg-gray-50 text-[#5F1517] focus:outline-none break-all">
                        {user.email}
                      </div>
                    </div>
                  </div>

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
                      {orders.map((order, idx) => (
                        <div key={idx} className="border border-[#5F1517]/10 rounded-xl p-5 bg-white">
                          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#5F1517]/5 pb-3 mb-3">
                            <div>
                              <p className="text-sm text-gray-500">Order ID: {order.id.substring(0,8)}...</p>
                              <p className="text-sm font-medium text-[#5F1517]">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-2 md:mt-0 text-right">
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">{order.status}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.image_url && <img src={getImageUrl(item.image_url)} alt="item" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="text-sm font-medium text-[#5F1517] truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-[#801416] text-sm flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-[#5F1517]/5 flex justify-between items-center">
                            <p className="font-medium text-[#5F1517]">Total Amount</p>
                            <p className="font-bold text-lg text-[#801416]">₹{order.total_amount.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
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
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status.toLowerCase() === 'captured' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {p.status}
                                </span>
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
