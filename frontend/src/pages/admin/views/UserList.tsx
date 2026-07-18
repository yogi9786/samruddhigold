import React, { useState } from 'react';
import UserModal from './UserModal';

interface UserListProps {
  users: any[];
  exportToCSV: (data: any[], filename: string) => void;
  fetchUsers: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, exportToCSV, fetchUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
<div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>All Users</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{users.length} registered accounts</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => exportToCSV(users, 'users.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
          <button onClick={fetchUsers} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺ Refresh Data</button>
        </div>
      </div>
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
              {['User', 'Full Name', 'Email', 'Account Status'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {users.map((u) => (
              <tr key={u.id} onClick={() => setSelectedUserId(u.id)} className="hover:bg-[#FFF7F2]/60 transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFF7F2] border border-[#D4AF37]/40 flex items-center justify-center text-[#5F1517] font-bold text-xs">
                      {String(u.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#5F1517] text-sm flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {u.username || 'Unknown User'}
                      {u.auth_provider === 'google' && (
                        <span className="bg-white border border-[#D4AF37]/30 text-[#5F1517] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                          Google
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#5F1517]/70" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.full_name || '—'}</td>
                <td className="px-5 py-4 text-xs font-medium text-[#5F1517]/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.email || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${u.disabled ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{u.disabled ? 'Disabled' : 'Active'}</span>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No accounts registered yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {selectedUserId && <UserModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </div>
);
};

export default UserList;
