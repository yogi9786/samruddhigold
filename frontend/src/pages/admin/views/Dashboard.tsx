import React from 'react';
import type { Section } from '../types';
import { GoldDivider } from '../components/UIComponents';

interface DashboardProps {
  stats: {
    revenue: number;
    pending: number;
    products: number;
    onSale: number;
    customers: number;
  };
  orders: any[];
  setSection: (s: Section) => void;
  refreshAll: () => void;
  setPForm: (p: any) => void;
  setEditPId: (id: string | null) => void;
  emptyProduct: any;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const Dashboard: React.FC<DashboardProps> = ({ stats, orders, setSection, refreshAll, setPForm, setEditPId, emptyProduct }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Overview</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Welcome back to your store</p>
        </div>
        <button onClick={refreshAll} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Dashboard
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          {
            label: 'Total Revenue', value: `₹${(stats.revenue / 1000).toFixed(1)}K`,
            action: () => setSection('orders'), sub: 'Lifetime',
            color: 'from-emerald-50 to-white', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Pending Orders', value: stats.pending,
            action: () => setSection('orders'), sub: 'Requires action',
            color: 'from-amber-50 to-white', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ),
          },
          {
            label: 'Total Products', value: stats.products,
            action: () => setSection('all-products'), sub: `${stats.onSale} on sale`,
            color: 'from-violet-50 to-white', iconBg: 'bg-violet-100', iconColor: 'text-violet-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ),
          },
          {
            label: 'Customers', value: stats.customers,
            action: () => setSection('customers'), sub: 'Purchased',
            color: 'from-sky-50 to-white', iconBg: 'bg-sky-100', iconColor: 'text-sky-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5c-1.657 0-3 1.343-3 3s1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5C6.343 5 5 6.343 5 8s1.343 3 3 3zm8 2c2.209 0 4 1.791 4 4H4c0-2.209 1.791-4 4-4h8z" />
              </svg>
            ),
          },
        ].map((s, i) => (
          <button key={i} onClick={s.action}
            className={`group bg-gradient-to-br ${s.color} border border-[#D4AF37]/15 rounded-2xl p-5 hover:border-[#D4AF37]/40 shadow-sm hover:shadow-md hover:shadow-[#D4AF37]/10 transition-all text-left relative overflow-hidden`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="absolute -right-3 -top-3 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/8 to-transparent rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} ${s.iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                {s.icon}
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#5F1517]/40 border border-[#D4AF37]/15 bg-white/60 px-2 py-1 rounded-full leading-tight text-right">{s.sub}</span>
            </div>
            <div className="text-2xl font-bold text-[#5F1517] tracking-tight relative z-10" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{s.value}</div>
            <div className="text-[10px] font-semibold text-[#5F1517]/45 mt-1 uppercase tracking-widest relative z-10">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF7F2] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[#5F1517] uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Actions</h3>
          </div>
          <GoldDivider />
          <div className="grid grid-cols-1 gap-3 mt-5">
            {[
              { label: 'Add New Product', s: 'add-product' as Section, bg: 'bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] hover:shadow-lg', withPlus: true },
              { label: 'Add Collection', s: 'add-category' as Section, bg: 'bg-[#FFF7F2] text-[#5F1517] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10', withPlus: true },
              { label: 'Manage Orders', s: 'orders' as Section, bg: 'bg-[#FFF7F2] text-[#5F1517] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10', withBox: true },
            ].map(a => (
              <button key={a.label} onClick={() => { if (a.s === 'add-product') { setPForm({ ...emptyProduct }); setEditPId(null); } setSection(a.s); }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${a.bg}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {a.withPlus && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {a.withBox && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFF7F2] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5c-1.657 0-3 1.343-3 3s1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5C6.343 5 5 6.343 5 8s1.343 3 3 3zm8 2c2.209 0 4 1.791 4 4H4c0-2.209 1.791-4 4-4h8z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#5F1517] uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Recent Orders</h3>
            </div>
            <button onClick={() => setSection('orders')} className="text-xs font-bold text-[#D4AF37] hover:text-[#5F1517] uppercase tracking-widest transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>View All</button>
          </div>
          <GoldDivider />
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF7F2] transition border border-transparent hover:border-[#D4AF37]/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFF7F2] border border-[#D4AF37]/30 flex items-center justify-center text-[#5F1517] font-bold text-xs">
                    {String(o.full_name || o.user_username || 'Guest').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#5F1517] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.full_name || o.user_username || 'Guest Customer'}</div>
                    <div className="text-[10px] text-[#5F1517]/40 font-mono tracking-tight mt-0.5">#{o.id.slice(0, 8)} • {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{o.total_amount.toLocaleString()}</span>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-[#5F1517]/40 text-center py-6 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>No orders placed yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
