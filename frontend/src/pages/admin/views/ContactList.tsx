import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../api';
import { Search, Download, Trash2, Mail, Phone, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Contact {
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

interface ContactListProps {
  showToast: (text: string, type?: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ showToast, exportToCSV }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/contacts?source=general');
      setContacts(response.data);
    } catch (err) {
      showToast('Failed to load contact messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminApi.patch(`/contacts/${id}/status`, { status: newStatus });
      showToast('Contact status updated successfully');
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact entry?')) return;
    try {
      await adminApi.delete(`/contacts/${id}`);
      showToast('Contact deleted successfully');
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err) {
      showToast('Failed to delete contact', 'error');
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(search.toLowerCase())) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Resolved</span>;
      case 'contacted':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full"><Clock size={12} /> Contacted</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full"><AlertCircle size={12} /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#5F1517]/10">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5F1517] flex items-center gap-2">
            <Mail className="text-[#D4AF37]" size={24} /> General Contacts & Inquiries
          </h2>
          <p className="text-xs text-[#5F1517]/70 mt-1">
            Review and respond to messages submitted from the website Contact Us page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchContacts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#5F1517] border border-[#5F1517]/20 rounded-xl hover:bg-[#FFF7F2] transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => exportToCSV(filteredContacts, `General_Contacts_${new Date().toISOString().split('T')[0]}.csv`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5F1517] rounded-xl hover:bg-[#801416] transition shadow-sm cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by Name, Email, Phone, Subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#5F1517]/10 rounded-xl text-sm outline-none focus:border-[#5F1517] transition"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-[#5F1517]/10 rounded-xl text-sm outline-none focus:border-[#5F1517] cursor-pointer"
          >
            <option value="all">All Statuses ({contacts.length})</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#5F1517]/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#5F1517]">Loading contact messages...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-20 text-center text-[#5F1517]">
            <Mail size={40} className="mx-auto mb-3 opacity-30 text-[#5F1517]" />
            <p className="font-semibold text-base">No contact messages found</p>
            <p className="text-xs opacity-70 mt-1">Try resetting search filters or submit a test message.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF7F2] border-b border-[#5F1517]/10 text-xs uppercase font-bold text-[#5F1517] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#FFF7F2]/40 transition">
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {new Date(contact.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#5F1517]">{contact.name}</div>
                      <div className="flex flex-col text-xs text-gray-500 gap-0.5 mt-0.5">
                        {contact.email && <span className="flex items-center gap-1"><Mail size={12} /> {contact.email}</span>}
                        {contact.phone && <span className="flex items-center gap-1"><Phone size={12} /> {contact.phone}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#801416]">
                      {contact.subject}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-xs truncate">
                      {contact.message}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="px-3 py-1 text-xs font-semibold text-[#5F1517] border border-[#5F1517]/20 rounded-lg hover:bg-[#FFF7F2] transition cursor-pointer"
                        >
                          View Message
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#5F1517]/10 animate-in fade-in">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#5F1517]">{selectedContact.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">Submitted on {new Date(selectedContact.created_at).toLocaleString()}</p>
              </div>
              {getStatusBadge(selectedContact.status)}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Customer Name</span>
                <p className="font-semibold text-[#5F1517]">{selectedContact.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Email</span>
                  <p className="font-medium text-gray-700">{selectedContact.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Phone</span>
                  <p className="font-medium text-gray-700">{selectedContact.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Message</span>
                <div className="mt-1 p-3.5 bg-[#FFF7F2] rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed border border-[#5F1517]/10">
                  {selectedContact.message}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <select
                  value={selectedContact.status}
                  onChange={(e) => {
                    handleStatusChange(selectedContact.id, e.target.value);
                    setSelectedContact(prev => prev ? { ...prev, status: e.target.value } : null);
                  }}
                  className="text-xs font-semibold px-2 py-1 border border-gray-300 rounded-lg"
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
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

export default ContactList;
