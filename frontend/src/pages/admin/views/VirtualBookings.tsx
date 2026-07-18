import React from 'react';



interface VirtualBookingsProps {
  virtualBookings: any[];
  vSearch: string;
  setVSearch: (s: string) => void;
  vStatusFilter: string;
  setVStatusFilter: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchVirtualBookings: () => void;
  loadingBookings: boolean;
  updateBookingStatus: (id: string, status: string) => void;
  viewBookingDetails: (id: string) => void;
  deleteBooking: (id: string) => void;
}

const VirtualBookings: React.FC<VirtualBookingsProps> = ({ virtualBookings, vSearch, setVSearch, vStatusFilter, setVStatusFilter, exportToCSV, fetchVirtualBookings, loadingBookings, updateBookingStatus, viewBookingDetails, deleteBooking }) => {
  const filteredBookings = virtualBookings.filter(b => {
      const matchSearch = !vSearch || 
        b.name.toLowerCase().includes(vSearch.toLowerCase()) || 
        b.email.toLowerCase().includes(vSearch.toLowerCase()) || 
        b.phone.includes(vSearch) ||
        b.city_or_country.toLowerCase().includes(vSearch.toLowerCase());
      const matchStatus = !vStatusFilter || b.status === vStatusFilter;
      return matchSearch && matchStatus;
    });

    const BOOKING_STATUS_COLORS: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
      Confirmed: 'bg-green-100 text-green-700 border border-green-200',
      Completed: 'bg-blue-100 text-blue-700 border border-blue-200',
      Cancelled: 'bg-red-100 text-red-700 border border-red-200',
    };

    return (
      <div className="animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Video Shopping Bookings</h2>
            <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {filteredBookings.length} appointments scheduled
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => exportToCSV(filteredBookings, 'virtual-bookings.csv')} className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button 
              onClick={fetchVirtualBookings} 
              disabled={loadingBookings}
              className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition disabled:opacity-50 flex items-center gap-1.5" 
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loadingBookings ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-[#5F1517]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Refreshing...
                </>
              ) : (
                '↺ Refresh Data'
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#D4AF37]/20 shadow-sm rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Search Bookings</label>
            <input 
              value={vSearch} 
              onChange={e => setVSearch(e.target.value)} 
              placeholder="Search by Name, Email, Phone, City..."
              className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner" 
              style={{ fontFamily: 'Montserrat, sans-serif' }} 
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Status</label>
            <select 
              value={vStatusFilter} 
              onChange={e => setVStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner font-semibold text-[#5F1517]" 
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                  {['Date & Time', 'Customer Details', 'Location', 'Category & Lang', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FFF7F2]/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{b.booking_date}</div>
                      <div className="text-xs text-[#A56B25] font-semibold flex items-center gap-1 mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <span className="text-xs">🕒</span> {b.booking_time} (IST)
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#5F1517] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{b.name}</div>
                      <div className="text-xs text-[#5F1517]/60 mt-0.5">{b.email}</div>
                      <div className="text-xs text-[#5F1517]/60 font-mono mt-0.5">{b.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#5F1517]/80" style={{ fontFamily: 'Montserrat, sans-serif' }}>{b.city_or_country}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-[#5F1517]">{b.category}</div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">Lang: {b.language}</div>
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        value={b.status} 
                        onChange={e => updateBookingStatus(b.id, e.target.value)}
                        className={`px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer ${BOOKING_STATUS_COLORS[b.status] || 'bg-white text-gray-700'}`} 
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewBookingDetails(b.id)} 
                          className="px-3 py-1.5 text-[10px] font-bold text-[#5F1517] bg-white border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-lg transition uppercase tracking-widest shadow-sm"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => deleteBooking(b.id)} 
                          className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition uppercase tracking-widest shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      No video shopping bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};

export default VirtualBookings;
