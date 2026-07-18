import React, { useEffect } from 'react';
import { getImageUrl } from '../../../api';

export const Toast: React.FC<{ msg: { text: string; type: string }; onClose: () => void }> = ({ msg, onClose }) => {
  useEffect(() => {
    if (msg.text) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [msg.text, onClose]);

  if (!msg.text) return null;
  const colors: Record<string, string> = {
    success: 'bg-[#5F1517] border-[#D4AF37] text-[#D4AF37]',
    error: 'bg-red-900 border-red-400 text-red-200',
    info: 'bg-[#3d1012] border-[#D4AF37]/50 text-[#D4AF37]/80',
  };

  return (
    <div
      className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl ${colors[msg.type] || colors.info} animate-fade-in`}
      style={{ fontFamily: 'Montserrat, sans-serif', minWidth: 280 }}
    >
      <span className="text-lg">{msg.type === 'success' ? '✓' : msg.type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="text-sm font-medium flex-1">{msg.text}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-2 text-lg">✕</button>
    </div>
  );
};

export const Alert: React.FC<{ msg: { text: string; type: string } }> = ({ msg }) => {
  if (!msg.text) return null;
  const c = {
    success: 'bg-[#FFF7F2] border-[#D4AF37] text-[#5F1517]',
    error: 'bg-red-50 border-red-400 text-red-700',
    info: 'bg-amber-50 border-amber-400 text-amber-800'
  };
  return (
    <div
      className={`border-l-4 px-4 py-3 rounded-r-lg text-sm mb-4 ${c[msg.type as keyof typeof c] || c.info}`}
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {msg.text}
    </div>
  );
};

export const Field: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: any;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
  rows?: number;
}> = ({ label, name, type = 'text', value, onChange, required, placeholder, readOnly, hint, rows }) => (
  <div>
    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {label}{required && <span className="text-[#D4AF37] ml-0.5">*</span>}
    </label>
    {rows ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] resize-none transition shadow-sm"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm ${readOnly ? 'bg-[#FFF7F2] text-[#5F1517]/50 cursor-default' : 'bg-white'}`}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      />
    )}
    {hint && <p className="text-[10px] text-[#5F1517]/40 mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{hint}</p>}
  </div>
);

export const GoldDivider = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
  </div>
);

export const SCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 sm:p-8 mb-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl drop-shadow-sm">{icon}</span>
      <h3 className="font-semibold text-[#5F1517] text-sm sm:text-base uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h3>
    </div>
    <GoldDivider />
    <div className="mt-5">{children}</div>
  </div>
);

export const ImgUpload: React.FC<{
  label: string;
  url: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  name: string;
}> = ({ label, url, onUpload, onClear, onChange, loading, name }) => (
  <div>
    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{label}</label>
    <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed ${loading ? 'border-[#D4AF37] bg-[#FFF7F2]' : 'border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FFF7F2]/50'} rounded-2xl p-6 cursor-pointer transition-all`}>
      <input type="file" accept="image/*" onChange={onUpload} disabled={loading} className="hidden" />
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#D4AF37] font-medium tracking-wide uppercase">Uploading…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-[#5F1517]/40">
          <span className="text-3xl">📁</span>
          <span className="text-xs font-medium uppercase tracking-widest">Click to upload</span>
        </div>
      )}
    </label>
    {url && (
      <div className="mt-4 flex items-center gap-4 bg-[#FFF7F2] p-2 rounded-xl border border-[#D4AF37]/20">
        <div className="relative group flex-shrink-0">
          <img src={getImageUrl(url)} alt="preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-[#D4AF37]/30 shadow-sm" />
          <button type="button" onClick={onClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[#5F1517] text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110">✕</button>
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <input type="text" name={name} value={url} onChange={onChange} placeholder="Or paste URL"
            className="w-full px-3 py-2 border-b border-[#D4AF37]/30 text-xs bg-transparent text-[#5F1517] focus:outline-none focus:border-[#D4AF37] transition" style={{ fontFamily: 'Montserrat, sans-serif' }} />
        </div>
      </div>
    )}
    {!url && (
      <input type="text" name={name} value={url} onChange={onChange} placeholder="Or paste image URL…"
        className="w-full mt-3 px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-xs text-[#5F1517] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }} />
    )}
  </div>
);
