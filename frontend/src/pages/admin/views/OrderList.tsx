import React, { useState } from 'react';
import { Download, Truck, X, Edit3, PackageCheck } from 'lucide-react';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const SHIPPING_STATUS_COLORS: Record<string, string> = {
  'Not Shipped': 'bg-gray-100 text-gray-700 border-gray-200',
  'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
  'In Transit': 'bg-blue-100 text-blue-800 border-blue-200',
  'Delivered': 'bg-green-100 text-green-800 border-green-200',
};

interface OrderListProps {
  filteredOrders: any[];
  oSearch: string;
  setOSearch: (s: string) => void;
  oStatusFilter: string;
  setOStatusFilter: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchOrders: () => void;
  updateOrderStatus: (id: string, status: string) => void;
  updateShippingDetails: (id: string, payload: { shipping_status?: string; courier_name?: string; tracking_number?: string; status?: string }) => Promise<void>;
}

const OrderList: React.FC<OrderListProps> = ({ 
  filteredOrders, 
  oSearch, 
  setOSearch, 
  oStatusFilter, 
  setOStatusFilter, 
  exportToCSV, 
  fetchOrders, 
  updateOrderStatus,
  updateShippingDetails
}) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingForm, setShippingForm] = useState({
    shipping_status: 'Not Shipped',
    courier_name: '',
    tracking_number: '',
    update_order_status: true
  });
  const [saving, setSaving] = useState(false);

  const handleOpenShippingModal = (order: any) => {
    setSelectedOrder(order);
    setShippingForm({
      shipping_status: order.shipping_status || (order.status === 'Shipped' ? 'Shipped' : 'Not Shipped'),
      courier_name: order.courier_name || '',
      tracking_number: order.tracking_number || '',
      update_order_status: true
    });
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const payload: any = {
        shipping_status: shippingForm.shipping_status,
        courier_name: shippingForm.courier_name.trim(),
        tracking_number: shippingForm.tracking_number.trim()
      };
      if (shippingForm.update_order_status && shippingForm.shipping_status === 'Shipped') {
        payload.status = 'Shipped';
      } else if (shippingForm.update_order_status && shippingForm.shipping_status === 'Delivered') {
        payload.status = 'Delivered';
      }
      await updateShippingDetails(selectedOrder.id, payload);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to save shipping info', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Orders</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{filteredOrders.length} records found</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={oSearch} onChange={e => setOSearch(e.target.value)} placeholder="Search Order ID / Customer…" className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-56" style={{ fontFamily: 'Montserrat, sans-serif' }} />
          <select value={oStatusFilter} onChange={e => setOStatusFilter(e.target.value)} className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white font-semibold text-[#5F1517] focus:outline-none focus:border-[#D4AF37]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">All Statuses</option>
            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => exportToCSV(filteredOrders, 'orders.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
          <button onClick={fetchOrders} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺</button>
        </div>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                {['Order ID & Date', 'Customer', 'Address', 'Total', 'Payment', 'Order Status', 'Shipping & Tracking', 'Invoice'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredOrders.map(o => {
                const shipStatus = o.shipping_status || (o.status === 'Shipped' ? 'Shipped' : 'Not Shipped');
                return (
                  <tr key={o.id} className="hover:bg-[#FFF7F2]/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs text-[#5F1517] font-bold">#{o.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[10px] font-semibold text-[#5F1517]/50 mt-1 uppercase tracking-wider">{new Date(o.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5F1517] to-[#801416] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-inner flex-shrink-0">
                          {String(o.full_name || o.user_username || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm text-[#5F1517] font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.full_name || o.user_username || 'Guest Customer'}</div>
                          <div className="text-[10px] text-[#5F1517]/60 mt-0.5">{o.email || 'No email'}</div>
                          <div className="text-[10px] text-[#5F1517]/60">{o.contact_phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[10px] font-medium text-[#5F1517]/80 max-w-[180px] whitespace-pre-wrap break-words">{o.shipping_address}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{o.total_amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.payment_method}</div>
                      {o.razorpay_payment_id && (
                        <div className="text-[9px] mt-1 text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full inline-block">
                          Paid: {o.razorpay_payment_id}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        value={o.status} 
                        onChange={e => updateOrderStatus(o.id, e.target.value)}
                        className={`px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer ${STATUS_COLORS[o.status] || 'bg-white text-gray-700'}`} 
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${SHIPPING_STATUS_COLORS[shipStatus] || 'bg-gray-100 text-gray-700'}`}>
                          <Truck size={12} />
                          {shipStatus}
                        </span>
                        {o.courier_name && (
                          <div className="text-[10px] font-medium text-[#5F1517]">
                            <span className="text-gray-400">Courier:</span> <span className="font-semibold">{o.courier_name}</span>
                          </div>
                        )}
                        {o.tracking_number && (
                          <div className="text-[10px] font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 w-fit">
                            Tracking #: {o.tracking_number}
                          </div>
                        )}
                        <button
                          onClick={() => handleOpenShippingModal(o)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#801416] hover:underline font-bold"
                        >
                          <Edit3 size={11} /> Update Shipping
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          const payment = { razorpay_payment_id: o.razorpay_payment_id || 'N/A', status: o.status, amount: o.total_amount, created_at: o.created_at };
                          const customer = { full_name: o.full_name, username: o.user_username, email: o.email };
                          generateInvoicePDF(o, payment, customer);
                        }}
                        className="px-3 py-1.5 bg-[#FFF7F2] text-[#801416] font-bold text-[11px] rounded-lg flex items-center gap-1.5 hover:bg-[#801416] hover:text-white transition shadow-sm"
                        title="Download Invoice PDF"
                      >
                        <Download size={13} /> Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/30 max-w-md w-full p-6 shadow-xl relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 bg-[#801416]/10 text-[#801416] rounded-xl flex items-center justify-center font-bold">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#5F1517]">Update Shipping Details</h3>
                <p className="text-xs text-gray-500 font-mono">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <form onSubmit={handleSaveShipping} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5F1517] uppercase tracking-wider mb-1.5">
                  Shipping Status
                </label>
                <select
                  value={shippingForm.shipping_status}
                  onChange={e => setShippingForm({ ...shippingForm, shipping_status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#801416] bg-gray-50"
                >
                  <option value="Not Shipped">Not Shipped</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5F1517] uppercase tracking-wider mb-1.5">
                  Courier / Logistics Partner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart, Delhivery, Speed Post, DTDC"
                  value={shippingForm.courier_name}
                  onChange={e => setShippingForm({ ...shippingForm, courier_name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#801416]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5F1517] uppercase tracking-wider mb-1.5">
                  Tracking Number / AWB Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. BD123456789IN"
                  value={shippingForm.tracking_number}
                  onChange={e => setShippingForm({ ...shippingForm, tracking_number: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#801416]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="update_order_status"
                  checked={shippingForm.update_order_status}
                  onChange={e => setShippingForm({ ...shippingForm, update_order_status: e.target.checked })}
                  className="w-4 h-4 text-[#801416] rounded border-gray-300 focus:ring-[#801416]"
                />
                <label htmlFor="update_order_status" className="text-xs text-gray-600 font-medium cursor-pointer">
                  Also update main Order Status when shipped/delivered
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#801416] hover:bg-[#5F1517] rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
                >
                  <PackageCheck size={14} />
                  {saving ? 'Saving...' : 'Save Shipping Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
