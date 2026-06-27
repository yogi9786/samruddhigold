import React, { useState, useEffect } from 'react';
import { Truck, Store, Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Calendar, MapPin } from 'lucide-react';
import logo from '../assets/samruddhi-logo.png';
import LoginModal from './LoginModal';

import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('access_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <>
      <header className="w-full flex flex-col font-sans relative z-40 bg-[#FFF7F2]">
        
        {/* Secondary Top Bar (White) */}
        <div className="hidden lg:block w-full bg-[#FFF7F2] border-b border-[#5F1517]/10">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14 flex items-center justify-between py-1.5">
             <div className="flex gap-4 items-center">
                <span className="text-royal font-sans font-medium text-[13px] lg:text-[12px] tracking-wide">Our Branch: Yelahanka, Udupi, Kolar</span>
             </div>
             <div className="flex items-center gap-5 text-[12px] lg:text-[11px] text-[#801416] font-medium">
                <span className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                  <span className="text-[#A56B25]">🪙</span> GOLD 22 KT/1g - ₹ 13,230 <ChevronDown size={12}/>
                </span>
                <span className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                  <MapPin size={14} />
                </span>
                <span className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                  <Calendar size={14} />
                </span>
                <span className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                  <div className="w-3.5 h-3.5 bg-orange-500 rounded-full overflow-hidden flex flex-col relative">
                    <div className="h-1/3 w-full bg-orange-500"></div>
                    <div className="h-1/3 w-full bg-white flex justify-center items-center"><div className="w-[2px] h-[2px] bg-blue-800 rounded-full"></div></div>
                    <div className="h-1/3 w-full bg-green-600"></div>
                  </div>
                  INR
                </span>
                <span className="cursor-pointer hover:opacity-80">Need help?</span>
             </div>
          </div>
        </div>

        {/* ── MAIN HEADER BAR ── */}
        <div className="w-full bg-[#FFF7F2] border-b border-[#5F1517]/10">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14 flex items-center justify-between py-3 lg:py-2">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer mr-6">
              <img
                src={logo}
                alt="Samruddhi Gold Palace"
                className="h-16 md:h-20 lg:h-[4.5rem] object-contain"
              />
            </Link>

            {/* Quick Delivery & Virtual Shopping */}
            <div className="hidden lg:flex items-center gap-6 text-[12px] lg:text-[11px] font-bold text-[#801416] mr-8 tracking-wide">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <Truck size={18} strokeWidth={1.5} className="text-[#A56B25]" /> QUICK DELIVERY
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <Store size={18} strokeWidth={1.5} /> VIRTUAL SHOPPING <ChevronDown size={14}/>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-[500px] mr-8">
              <div className="flex w-full items-center bg-[#F5F5F5] rounded-sm overflow-hidden">
                <div className="px-3 text-gray-400">
                  <Search size={16} strokeWidth={2} className="lg:w-[14px] lg:h-[14px]" />
                </div>
                <input
                  type="text"
                  placeholder="Search for jewellery..."
                  className="bg-transparent py-2.5 px-2 outline-none text-sm lg:text-[13px] w-full text-gray-700 placeholder-gray-500"
                />
                <button className="bg-[#801416] text-white px-4 py-2.5 hover:bg-opacity-90 transition flex items-center justify-center">
                  <Search size={18} strokeWidth={2} className="lg:w-[16px] lg:h-[16px]" />
                </button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="hidden lg:flex items-center gap-5 text-[#801416] font-medium text-[13px] lg:text-[12px]">
               {/* Login */}
               {user ? (
                 <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={handleLogout}>
                   <span className="uppercase">LOGOUT</span> <User size={20} strokeWidth={1.5} />
                 </div>
               ) : (
                 <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setIsLoginModalOpen(true)}>
                   <span>LOG IN</span> <User size={20} strokeWidth={1.5} />
                 </div>
               )}
               {/* Heart */}
               <div className="relative cursor-pointer hover:opacity-80">
                 <Heart size={22} strokeWidth={1.5} />
                 <span className="absolute -top-2 -right-2 bg-[#801416] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
               </div>
               {/* Cart */}
               <Link to="/shop" className="relative cursor-pointer hover:opacity-80">
                 <ShoppingBag size={22} strokeWidth={1.5} />
                 <span className="absolute -top-2 -right-2 bg-[#801416] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
               </Link>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-4 text-[#801416]">
              <button className="hover:opacity-80 transition">
                <Search size={22} strokeWidth={1.5} />
              </button>
              <button 
                className="hover:opacity-80 transition"
                onClick={() => user ? handleLogout() : setIsLoginModalOpen(true)}
              >
                <User size={22} strokeWidth={1.5} />
              </button>
              <Link to="/shop" className="hover:opacity-80 transition relative">
                <ShoppingBag size={22} strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 bg-[#801416] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">0</span>
              </Link>
              <button
                className="hover:opacity-80 transition"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION BAR (Desktop) ── */}
        <nav className="hidden lg:flex w-full bg-[#FFF7F2] justify-center border-b border-[#5F1517]/10">
          <ul className="flex items-center gap-4 xl:gap-5 py-2.5 text-[13.5px] lg:text-[12.5px] font-medium text-[#801416] font-sans">
            <li className="whitespace-nowrap"><Link to="/shop" className="text-[#801416] no-underline hover:opacity-80 transition font-bold">Shop All</Link></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20interested%20in%20your%20Express%20Delivery%20options." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Express Delivery</a></li>
            <li className="whitespace-nowrap"><a href="#gold" className="text-[#801416] no-underline hover:opacity-80 transition">Earrings</a></li>
            <li className="whitespace-nowrap"><a href="#gold" className="text-[#801416] no-underline hover:opacity-80 transition">Pendants</a></li>
            <li className="whitespace-nowrap"><a href="#gold" className="text-[#801416] no-underline hover:opacity-80 transition">Rings</a></li>
            <li className="whitespace-nowrap"><a href="#diamond" className="text-[#801416] no-underline hover:opacity-80 transition">Diamond Jewellery</a></li>
            <li className="whitespace-nowrap"><a href="#categories-section" className="text-[#801416] no-underline hover:opacity-80 transition">More Jewellery</a></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20looking%20for%20gifting%20recommendations." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Gifting</a></li>
            <li className="whitespace-nowrap"><a href="#look-book" className="text-[#801416] no-underline hover:opacity-80 transition">Wedding Collections</a></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I'd%20like%20to%20know%20more%20about%20your%20current%20offers." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Offers</a></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20please%20share%20today's%20gold%20rate." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Today's Gold Rate</a></li>
            <li className="ml-2">
              <a 
                href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20would%20like%20to%20know%20more%20about%20your%20Jewellery%20Purchase%20Plan."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#801416] text-white px-4 py-1.5 rounded-full text-[12.5px] font-medium tracking-wide shadow-sm hover:opacity-90 transition no-underline inline-block"
              >
                Jewellery Purchase Plan
              </a>
            </li>
          </ul>
        </nav>
        
        {/* Red Banner Below Nav */}
        <div className="hidden lg:block w-full bg-[#721013] text-center py-1.5 text-white text-[13px] font-medium tracking-wide">
           Flat 20% off on VA, for Online Gold Jewellery
        </div>

        {/* ── MOBILE DRAWER ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#FFF7F2] shadow-2xl flex flex-col z-50 max-h-[85vh] overflow-y-auto border-t border-[#5F1517]/10">
            <ul className="flex flex-col py-2 font-sans">
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-bold text-sm no-underline">Shop All</Link>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20have%20an%20enquiry%20about%20Express%20Delivery%20options." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Express Delivery</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#gold" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Earrings</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#gold" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Pendants</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#gold" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Rings</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#diamond" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Diamond Jewellery</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#categories-section" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">More Jewellery</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20looking%20for%20gifting%20recommendations." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Gifting</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#look-book" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Wedding Collections</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I'd%20like%20to%20know%20more%20about%20your%20current%20offers." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Offers</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20please%20share%20today's%20gold%20rate." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Today's Gold Rate</a>
              </li>
            </ul>
          </div>
        )}
      </header>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(token) => fetchUserProfile(token)}
      />
    </>
  );
};

export default Header;
