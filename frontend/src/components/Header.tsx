import React, { useState, useEffect } from 'react';
import { Truck, Store, Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Calendar, MapPin } from 'lucide-react';
import logo from '../assets/samruddhi-logo.png';
import LoginModal from './LoginModal';

import { Link } from 'react-router-dom';
import api, { getCart, getWishlist } from '../api';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [metalPrices, setMetalPrices] = useState<any[]>([]);
  const [showMetalPrices, setShowMetalPrices] = useState(false);
  
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      if (response.data && response.data.id) {
        localStorage.setItem('user_id', response.data.id);
      }
      fetchCounts();
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setUser(null);
    }
  };

  const fetchCounts = async () => {
    try {
      const [cartRes, wishRes] = await Promise.all([
        getCart(),
        getWishlist()
      ]);
      setCartCount(cartRes.data.length || 0);
      setWishlistCount(wishRes.data.length || 0);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  };

  useEffect(() => {
    const handleCartUpdate = () => {
      if (localStorage.getItem('access_token')) {
        fetchCounts();
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/metal-prices');
        setMetalPrices(res.data);
      } catch (err) {
        console.error('Failed to fetch metal rates:', err);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
  };

  return (
    <>
      <header className="w-full flex flex-col font-sans sticky top-0 z-50 bg-[#FFF7F2] shadow-sm">

        {/* ── STICKY TOP MARQUEE BANNER ── */}
        <div className="w-full bg-[#5F1517] text-white text-[11px] md:text-[12px] py-1.5 overflow-hidden font-medium font-sans relative flex items-center">
          <style>{`
            @keyframes topMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .top-marquee { animation: topMarquee 30s linear infinite; display: flex; width: max-content; white-space: nowrap; }
            .top-marquee:hover { animation-play-state: paused; }
          `}</style>
          <div className="top-marquee cursor-default">
            {[
              "🎉 Up to 100% Free Making Charges*",
              "🎉 Free Gold Coin on Purchase of Every ₹2.5 Lakh",
              "🎉 Samruddhi Golden Flexi Offer – Rate Protection for 90 Days",
              "🎉 Up to 100% Free Making Charges*",
              "🎉 Free Gold Coin on Purchase of Every ₹2.5 Lakh",
              "🎉 Samruddhi Golden Flexi Offer – Rate Protection for 90 Days",
            ].map((offer, i) => (
              <span key={i} className="px-8 tracking-wide">{offer}</span>
            ))}
          </div>
        </div>

        {/* Secondary Top Bar (White) */}
        <div className="hidden lg:block w-full bg-[#FFF7F2] border-b border-[#5F1517]/10">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14 flex items-center justify-between py-1.5">
             <div className="flex gap-4 items-center">
                <span className="text-royal font-sans font-medium text-[13px] lg:text-[12px] tracking-wide">Our Branch: Yelahanka, Udupi, Kolar</span>
             </div>
             <div className="flex items-center gap-5 text-[12px] lg:text-[11px] text-[#801416] font-medium">
                <div 
                  className="relative flex items-center gap-1 cursor-pointer hover:opacity-80 py-1"
                  onMouseEnter={() => setShowMetalPrices(true)}
                  onMouseLeave={() => setShowMetalPrices(false)}
                >
                  <span className="text-[#A56B25]">🪙</span> 
                  {metalPrices.find(p => p.id === 'gold_22k') 
                    ? `TODAY'S GOLD RATE`
                    : 'GOLD 22 KT/1g - ₹ 13,230'
                  }
                  <ChevronDown size={12}/>
                  
                  {showMetalPrices && metalPrices.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#D4AF37]/20 rounded-2xl shadow-xl p-4 text-[#5F1517] z-50 animate-fade-in">
                      <h4 className="font-bold text-[10px] uppercase tracking-wider text-[#D4AF37] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Daily Metal Rates</h4>
                      <div className="flex flex-col gap-2.5">
                        {metalPrices.map(mp => (
                          <div key={mp.id} className="flex justify-between items-center text-xs font-semibold py-1 border-b border-gray-100 last:border-0">
                            <span>{mp.name} / {mp.unit}</span>
                            <span className="font-mono text-[#801416]">₹{mp.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                <Link to="/new-arrivals" className="flex items-center gap-1 cursor-pointer hover:opacity-80 no-underline text-[#801416] font-medium text-[11px]">New Arrivals</Link>
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
               <Link to="/wishlist" className="relative cursor-pointer hover:opacity-80">
                 <Heart size={22} strokeWidth={1.5} />
                 {wishlistCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-[#801416] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
                 )}
               </Link>
               {/* Cart */}
               <Link to="/cart" className="relative cursor-pointer hover:opacity-80">
                 <ShoppingBag size={22} strokeWidth={1.5} />
                 {cartCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-[#801416] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                 )}
               </Link>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-3.5 text-[#801416]">
              <button className="hover:opacity-80 transition">
                <Search size={22} strokeWidth={1.5} />
              </button>
              <button 
                className="hover:opacity-80 transition"
                onClick={() => user ? handleLogout() : setIsLoginModalOpen(true)}
              >
                <User size={22} strokeWidth={1.5} />
              </button>
              {/* Shop icon — next to account */}
              <Link to="/cart" className="hover:opacity-80 transition relative">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#801416] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
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
            <li className="whitespace-nowrap"><Link to="/new-arrivals" className="text-[#801416] no-underline hover:opacity-80 transition font-bold">New Arrivals</Link></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20interested%20in%20your%20Express%20Delivery%20options." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Express Delivery</a></li>
            <li className="whitespace-nowrap"><a href="#gold" className="text-[#801416] no-underline hover:opacity-80 transition">Earrings</a></li>
            <li className="whitespace-nowrap"><a href="#gold" className="text-[#801416] no-underline hover:opacity-80 transition">Pendants</a></li>
            <li className="whitespace-nowrap"><a href="#gold" className="text-[#801416] no-underline hover:opacity-80 transition">Rings</a></li>
            <li className="whitespace-nowrap"><a href="#diamond" className="text-[#801416] no-underline hover:opacity-80 transition">Diamond Jewellery</a></li>
            <li className="whitespace-nowrap"><a href="#categories-section" className="text-[#801416] no-underline hover:opacity-80 transition">More Jewellery</a></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20looking%20for%20gifting%20recommendations." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Gifting</a></li>
            <li className="whitespace-nowrap"><a href="#look-book" className="text-[#801416] no-underline hover:opacity-80 transition">Wedding Collections</a></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'd%20like%20to%20know%20more%20about%20your%20current%20offers." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Offers</a></li>
            <li className="whitespace-nowrap"><a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20please%20share%20today's%20gold%20rate." target="_blank" rel="noopener noreferrer" className="text-[#801416] no-underline hover:opacity-80 transition">Today's Gold Rate</a></li>
            <li className="ml-2">
              <a 
                href={`https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20would%20like%20a%20Live%20Video%20Call%20to%20see%20your%20jewellery.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide shadow-sm hover:opacity-90 transition no-underline"
              >
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
                Live Video Call
              </a>
            </li>
          </ul>
        </nav>
        


        {/* ── MOBILE DRAWER ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#FFF7F2] shadow-2xl flex flex-col z-50 max-h-[85vh] overflow-y-auto border-t border-[#5F1517]/10">
            <ul className="flex flex-col py-2 font-sans">
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-bold text-sm no-underline">Shop All</Link>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <Link to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-bold text-sm no-underline">New Arrivals</Link>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20have%20an%20enquiry%20about%20Express%20Delivery%20options." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Express Delivery</a>
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
                <a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20looking%20for%20gifting%20recommendations." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Gifting</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="#look-book" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Wedding Collections</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'd%20like%20to%20know%20more%20about%20your%20current%20offers." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Offers</a>
              </li>
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <a href="https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20please%20share%20today's%20gold%20rate." target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Today's Gold Rate</a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Red Offer Banner — NOT sticky, scrolls with content */}
      <div className="w-full bg-[#721013] text-center py-1.5 text-white text-[12px] md:text-[13px] font-medium tracking-wide">
        Flat 20% off on VA, for Online Gold Jewellery
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={() => fetchUserProfile()}
      />
    </>
  );
};

export default Header;
