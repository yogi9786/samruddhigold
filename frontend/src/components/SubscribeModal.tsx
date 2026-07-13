import React, { useState } from 'react';
import { X, Bell, Mail, Phone, CheckCircle } from 'lucide-react';
import api from '../api';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const prefilled = localStorage.getItem('prefilled_email');
      if (prefilled) {
        setEmail(prefilled);
        localStorage.removeItem('prefilled_email');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setError('Please provide at least an email address or a phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/subscriptions', {
        email: email || null,
        phone: phone || null
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Subscription failed. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className="bg-[#FFF7F2] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-[#5F1517]/10 transform transition-all duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 text-[#5F1517]/50 hover:text-[#5F1517] transition z-10 bg-white/50 hover:bg-white rounded-full p-1.5 shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Modal Header Icon */}
        <div className="px-8 pt-10 pb-4 text-center">
          <div className="w-16 h-16 bg-[#820C0F]/10 text-[#820C0F] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#820C0F]/20 relative">
            <Bell size={28} className="animate-bounce" />
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFCB08] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FFCB08]"></span>
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#820C0F] mb-2 leading-tight">
            Stay Notified
          </h2>
          <p className="text-[13px] text-[#820C0F]/70 font-medium">
            Be the first to hear about rate changes, exclusive drops, and VIP collections.
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-10">
          {success ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#820C0F]">Subscribed Successfully!</h3>
              <p className="text-[#820C0F]/70 mt-2 font-medium">
                Thank you! We will keep you updated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs text-center font-medium">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#820C0F] block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#820C0F]/40">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#FFCB08]/25 rounded-xl focus:ring-2 focus:ring-[#820C0F]/10 focus:border-[#820C0F] outline-none transition text-[#820C0F] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal text-sm"
                    placeholder="example@domain.com"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#820C0F] block">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#820C0F]/40">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#FFCB08]/25 rounded-xl focus:ring-2 focus:ring-[#820C0F]/10 focus:border-[#820C0F] outline-none transition text-[#820C0F] shadow-sm font-medium placeholder:text-gray-400 placeholder:font-normal text-sm"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-[#820C0F] hover:bg-[#A3161A] text-white rounded-xl font-bold tracking-wider text-xs uppercase shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#FFCB08]/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
