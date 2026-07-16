import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import { Award, ShieldCheck, Scale, Calculator, RefreshCw, ChevronRight, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetalRate {
  id: string;
  name: string;
  price: number;
  unit: string;
  updated_at: string;
}

const GoldRates: React.FC = () => {
  const [rates, setRates] = useState<MetalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [calcWeight, setCalcWeight] = useState<number>(10);
  const [calcKarat, setCalcKarat] = useState<string>('gold_22k');
  const [calcResult, setCalcResult] = useState<number>(0);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/metal-prices');
      setRates(res.data);
    } catch (err) {
      console.error('Error fetching metal rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Update calculator result when rates, weight or karat changes
  useEffect(() => {
    const selectedRate = rates.find(r => r.id === calcKarat);
    if (selectedRate) {
      const goldVal = selectedRate.price * calcWeight;
      // GST 3% is standard for gold purchases
      const gst = goldVal * 0.03;
      setCalcResult(Math.round(goldVal + gst));
    }
  }, [rates, calcWeight, calcKarat]);

  const getPriceBreakup = (basePrice: number) => {
    return {
      per1g: basePrice,
      per8g: basePrice * 8,
      per10g: basePrice * 10,
      per100g: basePrice * 100
    };
  };

  const getFormatDate = (dateStr?: string) => {
    if (!dateStr) return 'Today';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7F2] font-sans">
      <Header />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-10 pt-12 pb-20 text-left">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-[#801416] transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-[#801416] font-semibold">Today's Gold & Silver Rates</span>
        </nav>

        {/* Hero Header */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-[#D4AF37]/25 pb-8">
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <span className="text-xl text-[#D4AF37]"><Coins className="w-6 h-6" /></span>
              <span className="font-sans text-[10px] text-[#D4AF37] tracking-[4px] uppercase font-bold">Live Market Price</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#5F1517] leading-tight">
              Today's Gold & Silver Rates
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2">
              Daily updated official bullion rates at Siri Samruddhi Gold Palace.
            </p>
          </div>
          
          <button 
            onClick={fetchRates} 
            disabled={loading}
            className="flex items-center justify-center gap-2 self-center lg:self-end px-5 py-3 bg-white border border-[#D4AF37]/35 shadow-sm text-[#5F1517] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37] transition duration-300"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Rates
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Fetching current rates…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Rates Scoreboard Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rates.map((mp) => {
                  const breakup = getPriceBreakup(mp.price);
                  const isGold = mp.id.includes('gold');
                  return (
                    <div 
                      key={mp.id} 
                      className="bg-white rounded-3xl border border-[#D4AF37]/20 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#801416]" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#5F1517]">{mp.name}</h3>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Purity: {mp.id === 'gold_24k' ? '99.9%' : mp.id === 'gold_22k' ? '91.6% (Standard)' : mp.id === 'gold_18k' ? '75.0%' : '99.9%'}
                          </span>
                        </div>
                        <span className="text-2xl text-[#D4AF37]">{isGold ? '✨' : <Coins className="w-6 h-6" />}</span>
                      </div>

                      {/* Main Rate Display */}
                      <div className="bg-[#FFF7F2] rounded-2xl p-4 border border-[#D4AF37]/15 mb-4">
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Rate per 1 gram</span>
                        <span className="text-3xl font-extrabold text-[#801416]">
                          ₹{mp.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Quick Conversions */}
                      <div className="space-y-2.5 text-xs font-semibold text-[#5F1517]/85 border-t border-[#D4AF37]/10 pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">8 Grams (1 Sovereign)</span>
                          <span className="font-mono font-bold text-gray-800">₹{breakup.per8g.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">10 Grams (1 Tola)</span>
                          <span className="font-mono font-bold text-gray-800">₹{breakup.per10g.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">100 Grams</span>
                          <span className="font-mono font-bold text-gray-800">₹{breakup.per100g.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[9px] text-gray-400 font-medium">
                        <span>Updated: {getFormatDate(mp.updated_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust badges block */}
              <div className="bg-white rounded-3xl border border-[#D4AF37]/15 p-6 flex flex-col md:flex-row gap-6 shadow-sm justify-between">
                {[
                  { icon: <Award size={24} className="text-[#A56B25]" />, title: '100% Certified Purity', desc: 'All gold pieces are strictly BIS Hallmark certified.' },
                  { icon: <Scale size={24} className="text-[#A56B25]" />, title: 'Transparency Guaranteed', desc: 'Our daily live rates ensure you get absolute fair pricing.' },
                  { icon: <ShieldCheck size={24} className="text-[#A56B25]" />, title: 'Rate Protection Scheme', desc: 'Book gold jewelry at today\'s rate to secure against hikes.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#FFF7F2] border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-[#5F1517] tracking-wider uppercase mb-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 leading-normal font-semibold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Price Calculator Widget */}
            <div className="space-y-6">
              <div className="bg-[#5F1517] text-[#FFF7F2] rounded-3xl border border-[#D4AF37]/35 p-6 shadow-lg relative overflow-hidden" style={{ background: 'radial-gradient(circle at top right, #801416 0%, #4A1012 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="text-[#D4AF37] w-5 h-5" />
                  <h3 className="font-serif text-lg tracking-wider text-[#D4AF37] uppercase">Rate Calculator</h3>
                </div>
                <p className="text-[11px] text-[#FFF7F2]/60 font-semibold mb-6">
                  Estimate final pricing including 3% standard GST (excluding making charges).
                </p>

                <form className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Select Karat / Metal</label>
                    <select 
                      value={calcKarat} 
                      onChange={e => setCalcKarat(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-[#D4AF37]/30 text-[#FFF7F2] rounded-xl outline-none text-xs font-bold focus:border-[#D4AF37] cursor-pointer"
                    >
                      {rates.map(r => (
                        <option key={r.id} value={r.id} className="bg-[#4A1012] text-[#FFF7F2]">{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Weight (in Grams)</label>
                    <input 
                      type="number" 
                      min="0.1" 
                      step="0.001" 
                      value={calcWeight} 
                      onChange={e => setCalcWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-black/20 border border-[#D4AF37]/30 text-[#FFF7F2] rounded-xl outline-none text-xs font-mono font-bold focus:border-[#D4AF37]"
                    />
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[#D4AF37]/20 flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">Estimated Total (with 3% GST)</span>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    ₹{calcResult.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Call-to-action details */}
              <div className="bg-[#FFF7F2] rounded-3xl border border-[#D4AF37]/20 p-6 text-left">
                <h4 className="font-serif font-bold text-sm text-[#801416] mb-2">Need Custom Pricing?</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold mb-4">
                  For complex jewelry pieces with diamonds, gemstones, or custom specifications, get an exact quote from our design specialists.
                </p>
                <Link to="/contact" className="inline-block text-center w-full bg-[#801416] hover:bg-[#5F1517] text-[#D4AF37] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition duration-300 shadow">
                  Enquire Now
                </Link>
              </div>

              {/* WhatsApp Channel CTA */}
              <div className="bg-[#25D366]/10 rounded-3xl border border-[#25D366]/30 p-6 text-left">
                <h4 className="font-serif font-bold text-sm text-[#075E54] mb-2">Daily Rate Updates</h4>
                <p className="text-xs text-[#075E54]/70 leading-relaxed font-semibold mb-4">
                  Join our official WhatsApp channel to get instant daily notifications on gold and silver market rates directly on your phone.
                </p>
                <a href="https://whatsapp.com/channel/0029Va93M4cKmCPGRwv6lc1k" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition duration-300 shadow">
                  Join WhatsApp Channel
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GoldRates;
