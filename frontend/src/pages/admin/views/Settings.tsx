import React from 'react';
import { Alert, SCard } from '../components/UIComponents';
import { Shield } from 'lucide-react';



interface SettingsProps {
  pwMsg: any;
  pw: any;
  setPw: React.Dispatch<React.SetStateAction<any>>;
  handleChangePw: (e: React.FormEvent) => void;
}

const Settings: React.FC<SettingsProps> = ({ pwMsg, pw, setPw, handleChangePw }) => {
  return (
<div className="max-w-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-[#5F1517] mb-6 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Security Settings</h2>
      <Alert msg={pwMsg} />
      <SCard icon={<Shield />} title="Change Admin Password">
        <form onSubmit={handleChangePw} className="space-y-5">
          {[{ l: 'Current Password', k: 'cur' }, { l: 'New Password', k: 'nw', h: 'Min. 6 characters required for security' }, { l: 'Confirm New Password', k: 'conf' }].map(f => (
            <div key={f.k}>
              <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.l}</label>
              <input type="password" value={(pw as any)[f.k]} onChange={e => setPw((p: any) => ({ ...p, [f.k]: e.target.value }))} required
                className="w-full px-4 py-3 border border-[#D4AF37]/30 shadow-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] bg-white transition" style={{ fontFamily: 'Montserrat, sans-serif' }} />
              {f.h && <p className="text-[10px] font-medium text-[#5F1517]/40 uppercase tracking-widest mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.h}</p>}
            </div>
          ))}
          {pw.nw && pw.conf && pw.nw !== pw.conf && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200" style={{ fontFamily: 'Montserrat, sans-serif' }}>⚠️ Passwords do not match</p>
          )}
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-2xl uppercase tracking-[0.2em] text-sm hover:from-[#801416] hover:to-[#a01a1c] transition-all shadow-[0_4px_15px_rgba(95,21,23,0.3)] hover:shadow-[0_6px_20px_rgba(95,21,23,0.4)] mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Update Password
          </button>
        </form>
        <div className="mt-6 p-4 bg-[#FFF7F2] border border-[#D4AF37]/30 rounded-xl text-xs font-semibold text-[#5F1517]/70 shadow-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <span className="text-lg mr-2">⚠️</span> The new password takes effect immediately for this session. <span className="text-[#D4AF37]">You must restart the backend server</span> for the change to persist permanently in the configuration file.
        </div>
      </SCard>
    </div>
);
};

export default Settings;
