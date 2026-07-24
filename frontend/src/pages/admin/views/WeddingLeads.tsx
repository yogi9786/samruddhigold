import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../api';
import { Search, Download, Trash2, Phone, RefreshCw, CheckCircle, Clock, AlertCircle, HeartHandshake, Sparkles, MessageCircle } from 'lucide-react';

interface WeddingLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  source: string;
  status: string;
  created_at: string;
}

interface WeddingLeadsProps {
  showToast: (text: string, type?: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
}

const WeddingLeads: React.FC<WeddingLeadsProps> = ({ showToast, exportToCSV }) => {
  const [leads, setLeads] = useState<WeddingLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<WeddingLead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/contacts?source=wedding_collection');
      setLeads(response.data);
    } catch (err) {
      showToast('Failed to load wedding collection leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminApi.patch(`/contacts/${id}/status`, { status: newStatus });
      showToast('Lead status updated successfully');
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) {
      showToast('Failed to update lead status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this wedding lead?')) return;
    try {
      await adminApi.delete(`/contacts/${id}`);
      showToast('Wedding lead deleted successfully');
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone && l.phone.toLowerCase().includes(search.toLowerCase())) ||
      l.subject.toLowerCase().includes(search.toLowerCase()) ||
      l.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Contacted & Booked</span>;
      case 'contacted':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full"><Clock size={12} /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full"><AlertCircle size={12} /> New Lead</span>;
    }
  };

  const getCleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-white p-6 rounded-2xl shadow-md border border-[#D4AF37]/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-[#FFD700]" size={18} />
            <span className="text-xs text-[#FFD700] uppercase tracking-widest font-bold">Bridal Consultations</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-2 text-white">
            💍 Wedding Collection Leads
          </h2>
          <p className="text-xs text-[#FFF7F2]/80 mt-1">
            Leads and appointment requests captured directly from the Wedding Collection page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => exportToCSV(filteredLeads, `Wedding_Collection_Leads_${new Date().toISOString().split('T')[0]}.csv`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#5F1517] bg-[#FFD700] hover:bg-white rounded-xl transition shadow-md cursor-pointer font-bold"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#5F1517]/10 shadow-sm text-center">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Leads</span>
          <span className="text-2xl font-extrabold text-[#5F1517]">{leads.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#5F1517]/10 shadow-sm text-center">
          <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">New / Pending</span>
          <span className="text-2xl font-extrabold text-amber-600">
            {leads.filter(l => l.status.toLowerCase() === 'pending').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#5F1517]/10 shadow-sm text-center">
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-extrabold text-blue-600">
            {leads.filter(l => l.status.toLowerCase() === 'contacted').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#5F1517]/10 shadow-sm text-center">
          <span className="text-xs text-green-600 font-bold uppercase tracking-wider block">Booked / Completed</span>
          <span className="text-2xl font-extrabold text-green-600">
            {leads.filter(l => l.status.toLowerCase() === 'resolved').length}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by Bride/Groom Name, Phone, Branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#5F1517]/10 rounded-xl text-sm outline-none focus:border-[#5F1517] transition"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-[#5F1517]/10 rounded-xl text-sm outline-none focus:border-[#5F1517] cursor-pointer font-medium"
          >
            <option value="all">All Lead Statuses ({leads.length})</option>
            <option value="pending">New Leads (Pending)</option>
            <option value="contacted">In Progress (Contacted)</option>
            <option value="resolved">Booked / Completed</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#5F1517]/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#5F1517]">Loading wedding collection leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-20 text-center text-[#5F1517]">
            <HeartHandshake size={44} className="mx-auto mb-3 opacity-30 text-[#5F1517]" />
            <p className="font-semibold text-base">No wedding leads captured yet</p>
            <p className="text-xs opacity-70 mt-1">When users fill out the Wedding Collection appointment form, leads will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF7F2] border-b border-[#5F1517]/10 text-xs uppercase font-bold text-[#5F1517] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Bride / Customer</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Branch / Subject</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const cleanPhone = getCleanPhone(lead.phone);
                  return (
                    <tr key={lead.id} className="hover:bg-[#FFF7F2]/50 transition">
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#5F1517] flex items-center gap-1.5">
                          <span>{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {lead.phone || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#801416]">
                        {lead.subject}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer"
                        >
                          <option value="Pending">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Resolved">Booked</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {cleanPhone && (
                            <>
                              <a
                                href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20thank%20you%20for%20your%20interest%20in%20Samruddhi%20Gold%20Palace%20Wedding%20Jewellery%20Collection.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-[#25D366] text-white rounded-lg hover:opacity-90 transition no-underline"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="p-1.5 text-[#5F1517] bg-[#FFF7F2] hover:bg-[#5F1517] hover:text-white rounded-lg transition"
                                title="Call lead"
                              >
                                <Phone size={14} />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-[#5F1517] border border-[#5F1517]/20 rounded-lg hover:bg-[#FFF7F2] transition cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#5F1517]/10 animate-in fade-in">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold">Bridal Lead Details</span>
                <h3 className="font-serif text-xl font-bold text-[#5F1517]">{selectedLead.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Received on {new Date(selectedLead.created_at).toLocaleString()}</p>
              </div>
              {getStatusBadge(selectedLead.status)}
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-[#FFF7F2] p-3 rounded-xl border border-[#5F1517]/10">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Phone Number</span>
                  <p className="font-bold text-[#5F1517] text-base">{selectedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Subject / Inquiry</span>
                  <p className="font-semibold text-gray-800">{selectedLead.subject}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Request Message</span>
                <div className="mt-1 p-3.5 bg-gray-50 rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed border border-gray-100">
                  {selectedLead.message}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    handleStatusChange(selectedLead.id, e.target.value);
                    setSelectedLead(prev => prev ? { ...prev, status: e.target.value } : null);
                  }}
                  className="text-xs font-semibold px-2 py-1 border border-gray-300 rounded-lg"
                >
                  <option value="Pending">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Resolved">Booked</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#5F1517] rounded-xl hover:bg-[#801416] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingLeads;
