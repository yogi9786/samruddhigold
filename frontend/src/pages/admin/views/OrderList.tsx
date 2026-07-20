import React from 'react';
import { Download } from 'lucide-react';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
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
}

const OrderList: React.FC<OrderListProps> = ({ filteredOrders, oSearch, setOSearch, oStatusFilter, setOStatusFilter, exportToCSV, fetchOrders, updateOrderStatus }) => {
  return (
<div className="animate-fade-in">
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
                {['Order ID & Date', 'Customer', 'Address', 'Total', 'Payment', 'Status', 'Invoice'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredOrders.map(o => (
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
                    <div className="text-[10px] font-medium text-[#5F1517]/80 max-w-[200px] whitespace-pre-wrap break-words">{o.shipping_address}</div>
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
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                      className={`px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer ${STATUS_COLORS[o.status] || 'bg-white text-gray-700'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
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
              ))}
              {filteredOrders.length === 0 && <tr><td colSpan={7} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
);
};

export default OrderList;
