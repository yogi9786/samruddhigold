import React, { useState, useEffect } from 'react';
import { X, Package, CreditCard, Heart, ShoppingCart, Download } from 'lucide-react';
import { adminApi } from '../../../api';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';

interface UserModalProps {
  userId: string;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ userId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await adminApi.get(`/users/${userId}/comprehensive`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-10 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[#801416] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const { user, orders, payments, cart, wishlist } = data;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No orders found.</p>
            ) : (
              orders.map((o: any) => (
                <div key={o.id} className="border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-gray-500 mb-1">ID: {o.id}</p>
                    <p className="font-bold text-[#5F1517]">Rs. {o.total_amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600 mt-1">Status: <span className="font-semibold text-green-700">{o.status}</span></p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">Ship to: {o.shipping_address}</p>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => {
                        const payment = payments.find((p: any) => p.order_id === o.id) || { status: o.status, amount: o.total_amount };
                        generateInvoicePDF(o, payment, user);
                      }}
                      className="px-3 py-1.5 bg-[#FFF7F2] text-[#801416] font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-[#801416] hover:text-white transition"
                    >
                      <Download size={14} /> Download Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No payments found.</p>
            ) : (
              payments.map((p: any) => (
                <div key={p.id} className="border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-gray-500 mb-1">Razorpay ID: {p.razorpay_payment_id}</p>
                    <p className="font-bold text-[#5F1517]">Rs. {p.amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600 mt-1">Status: <span className="font-semibold text-green-700">{p.status}</span></p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => {
                        const matchingOrder = orders.find((o: any) => o.id === p.order_id) || { id: p.order_id, total_amount: p.amount, razorpay_payment_id: p.razorpay_payment_id, status: p.status };
                        generateInvoicePDF(matchingOrder, p, user);
                      }}
                      className="px-3 py-1.5 bg-[#FFF7F2] text-[#801416] font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-[#801416] hover:text-white transition"
                    >
                      <Download size={14} /> Download Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'cart':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500 italic col-span-full">Cart is empty.</p>
            ) : (
              cart.map((c: any) => (
                <div key={c.id} className="border border-gray-100 rounded-xl p-3 shadow-sm text-center">
                  <div className="bg-gray-50 aspect-square rounded-lg mb-2 flex items-center justify-center text-xs text-gray-400">Item</div>
                  <p className="text-xs font-bold text-[#5F1517] truncate">Product ID: {c.product_id.substring(0,6)}</p>
                  <p className="text-xs text-gray-500 mt-1">Qty: {c.quantity}</p>
                </div>
              ))
            )}
          </div>
        );
      case 'wishlist':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.length === 0 ? (
              <p className="text-sm text-gray-500 italic col-span-full">Wishlist is empty.</p>
            ) : (
              wishlist.map((w: any) => (
                <div key={w.id} className="border border-gray-100 rounded-xl p-3 shadow-sm text-center">
                  <div className="bg-gray-50 aspect-square rounded-lg mb-2 flex items-center justify-center text-xs text-gray-400">Item</div>
                  <p className="text-xs font-bold text-[#5F1517] truncate">Product ID: {w.product_id.substring(0,6)}</p>
                </div>
              ))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#D4AF37]/20 flex justify-between items-center bg-[#FFF7F2]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#D4AF37]/40 flex items-center justify-center text-[#5F1517] font-bold text-xl shadow-sm">
              {String(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#5F1517] tracking-tight">{user.full_name || user.username}</h2>
              <p className="text-sm text-[#5F1517]/60 font-semibold">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition">
            <X size={20} className="text-[#5F1517]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-48 bg-gray-50 p-4 border-r border-gray-100 flex-shrink-0 flex md:flex-col gap-2 overflow-x-auto">
            <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#5F1517] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              <Package size={16} /> Orders ({orders.length})
            </button>
            <button onClick={() => setActiveTab('payments')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${activeTab === 'payments' ? 'bg-[#5F1517] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              <CreditCard size={16} /> Payments ({payments.length})
            </button>
            <button onClick={() => setActiveTab('cart')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${activeTab === 'cart' ? 'bg-[#5F1517] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              <ShoppingCart size={16} /> Cart ({cart.length})
            </button>
            <button onClick={() => setActiveTab('wishlist')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${activeTab === 'wishlist' ? 'bg-[#5F1517] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              <Heart size={16} /> Wishlist ({wishlist.length})
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="p-6 overflow-y-auto flex-grow bg-white">
            {renderTabContent()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserModal;
