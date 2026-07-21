import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { Home as HomeIcon, ShoppingBag, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FFF7F2] pb-16 lg:pb-0 overflow-x-hidden font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center py-16 px-4 md:py-24">
        <div className="max-w-2xl w-full text-center bg-white rounded-3xl p-8 md:p-14 shadow-xl border border-[#5F1517]/10 relative overflow-hidden">
          {/* Subtle gold background ornament */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#801416]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-20 h-20 bg-[#FFF7F2] border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center mx-auto mb-6 text-[#801416] shadow-inner">
            <Search size={36} strokeWidth={1.5} className="text-[#A56B25]" />
          </div>

          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2 px-4 py-1 bg-[#FFF7F2] rounded-full border border-[#D4AF37]/20">
            Error 404
          </span>

          <h1 className="text-3xl md:text-5xl font-serif text-[#5F1517] font-bold mb-4">
            Page Is Not Available
          </h1>

          <p className="text-gray-600 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            The URL or page you are trying to reach does not exist or may have been moved. Let us help you find what you are looking for.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#801416] text-white px-7 py-3 rounded-full text-sm font-bold shadow-md hover:bg-[#5F1517] transition-all no-underline"
            >
              <HomeIcon size={16} />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFF7F2] text-[#801416] border border-[#801416]/30 px-7 py-3 rounded-full text-sm font-bold hover:bg-[#801416] hover:text-white transition-all no-underline"
            >
              <ShoppingBag size={16} />
              <span>Browse Shop</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default NotFound;
