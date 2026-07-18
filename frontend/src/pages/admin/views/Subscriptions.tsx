import React from 'react';



interface SubscriptionsProps {
  subscriptions: any[];
  subSearch: string;
  setSubSearch: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchSubscriptions: () => void;
  loadingSubscriptions: boolean;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ subscriptions, subSearch, setSubSearch, exportToCSV, fetchSubscriptions, loadingSubscriptions }) => {
  const filteredSubs = subscriptions.filter(sub => {
      const matchSearch = !subSearch || 
        (sub.email && sub.email.toLowerCase().includes(subSearch.toLowerCase())) || 
        (sub.phone && sub.phone.includes(subSearch));
      return matchSearch;
    });

    return (
      <div className="animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Newsletter Subscriptions</h2>
            <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {filteredSubs.length} subscribers found
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => exportToCSV(filteredSubs, 'subscriptions.csv')} className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button 
              onClick={fetchSubscriptions} 
              disabled={loadingSubscriptions}
              className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition disabled:opacity-50 flex items-center gap-1.5" 
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loadingSubscriptions ? (
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
        <div className="bg-white border border-[#D4AF37]/20 shadow-sm rounded-2xl p-5 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Search Subscribers</label>
            <input 
              value={subSearch} 
              onChange={e => setSubSearch(e.target.value)} 
              placeholder="Search by Email or Phone..."
              className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner" 
              style={{ fontFamily: 'Montserrat, sans-serif' }} 
            />
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                  {['Date Subscribed', 'Email Address', 'Phone Number'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FFF7F2]/40 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-500 font-semibold">
                      {new Date(sub.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#5F1517]">
                      {sub.email || <span className="text-gray-400 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-700">
                      {sub.phone || <span className="text-gray-400 font-normal">—</span>}
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      No subscribers found.
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

export default Subscriptions;
