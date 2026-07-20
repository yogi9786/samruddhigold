import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Truck, Store, Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Calendar, MapPin, Bell, Coins } from 'lucide-react';
import logo from '../assets/samruddhi-logo.png';
import LoginModal from './LoginModal';
import SubscribeModal from './SubscribeModal';

import { Link, useNavigate } from 'react-router-dom';
import api, { getCart, getWishlist, getImageUrl } from '../api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [metalPrices, setMetalPrices] = useState<any[]>([]);
  const [showMetalPrices, setShowMetalPrices] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Auto-typing placeholder effect
  const searchPlaceholders = [
    "Search for Rings...",
    "Search for Necklaces...",
    "Search for Earrings...",
    "Search for Bangles...",
    "Search for Pendants...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100;
    const currentWord = searchPlaceholders[placeholderIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting && placeholderText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
      } else {
        setPlaceholderText(currentWord.substring(0, placeholderText.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, placeholderIndex]);

  // Fetch all products and categories for search
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setAllProducts(prodRes.data);
        setAllCategories(catRes.data);
      } catch (err) {
        console.error('Failed to fetch search data', err);
      }
    };
    fetchSearchData();
  }, []);

  // Handle click outside for desktop search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => !p.status || p.status === 'active');

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const cat = allCategories.find(c => c.id === p.category_id);
        const catName = cat ? cat.name.toLowerCase() : '';
        return (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          catName.includes(q);
      });
    }
    return result;
  }, [allProducts, searchQuery, selectedCategory, allCategories]);

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
      const cartRes = await getCart();
      const totalQty = cartRes.data.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalQty);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
    
    if (localStorage.getItem('access_token')) {
      try {
        const wishRes = await getWishlist();
        setWishlistCount(wishRes.data.length || 0);
      } catch (err) {
        console.error('Failed to fetch wishlist count:', err);
      }
    } else {
      setWishlistCount(0);
    }
  };

  const topLevelCategories = useMemo(() => {
    return allCategories.filter(c => !c.parent_id);
  }, [allCategories]);

  const getSubcategories = useCallback((parentId: string) => {
    return allCategories.filter(c => c.parent_id === parentId);
  }, [allCategories]);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCounts();
    };
    const handleOpenSubscribe = () => {
      setIsSubscribeOpen(true);
    };
    const handleOpenLogin = () => {
      setIsLoginModalOpen(true);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleCartUpdate);
    window.addEventListener('openSubscribeModal', handleOpenSubscribe);
    window.addEventListener('openLoginModal', handleOpenLogin);
    window.addEventListener('userLogout', handleLogout);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleCartUpdate);
      window.removeEventListener('openSubscribeModal', handleOpenSubscribe);
      window.removeEventListener('openLoginModal', handleOpenLogin);
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  useEffect(() => {
    fetchCounts(); // Fetch initial cart count for guests
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
                className="relative flex items-center py-1"
                onMouseEnter={() => setShowMetalPrices(true)}
                onMouseLeave={() => setShowMetalPrices(false)}
              >
                <Link to="/gold-rates" className="flex items-center gap-1 hover:opacity-80 no-underline text-[#801416] font-medium">
                  <span className="text-[#A56B25]"><Coins className="w-5 h-5" /></span>
                  {metalPrices.find(p => p.id === 'gold_22k')
                    ? `TODAY'S GOLD RATE`
                    : 'GOLD 22 KT/1g - ₹ 13,230'
                  }
                  <ChevronDown size={12} />
                </Link>

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
          <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14 flex items-center justify-between py-1.5 lg:py-2">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer mr-6">
              <img
                src={logo}
                alt="Samruddhi Gold Palace"
                className="h-12 md:h-16 lg:h-[4.5rem] object-contain"
              />
            </Link>

            {/* Quick Delivery & Virtual Shopping */}
            <div className="hidden lg:flex items-center gap-6 text-[12px] lg:text-[11px] font-bold text-[#801416] mr-8 tracking-wide">
              <Link to="/shipping" className="flex items-center gap-2 cursor-pointer hover:opacity-80 no-underline text-[#801416]">
                <Truck size={18} strokeWidth={1.5} className="text-[#A56B25]" /> QUICK DELIVERY
              </Link>
              <Link to="/virtual-shopping" className="flex items-center gap-2 cursor-pointer hover:opacity-80 no-underline text-[#801416]">
                <Store size={18} strokeWidth={1.5} /> VIRTUAL SHOPPING
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-[600px] mr-8 relative" ref={searchRef}>
              <div className="flex w-full items-center bg-white rounded-full overflow-hidden border border-[#5F1517]/20 shadow-sm focus-within:border-[#801416] focus-within:ring-1 focus-within:ring-[#801416]/30 transition-all duration-300">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-[#801416] font-semibold text-[13px] pl-4 pr-2 py-2.5 outline-none border-r border-[#5F1517]/10 cursor-pointer hover:bg-[#FFF7F2] transition-colors max-w-[140px] truncate"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="px-3 text-[#A56B25]">
                  <Search size={16} strokeWidth={2} className="lg:w-[15px] lg:h-[15px]" />
                </div>
                <input
                  type="text"
                  placeholder={placeholderText}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="bg-transparent py-2.5 px-1 outline-none text-sm lg:text-[13px] w-full text-[#5F1517] placeholder-[#5F1517]/50 font-medium"
                />
                <button
                  className="bg-[#801416] text-white px-6 py-2.5 hover:bg-[#5F1517] transition-colors flex items-center justify-center font-bold text-sm tracking-wide"
                  onClick={() => setIsSearchOpen(true)}
                >
                  SEARCH
                </button>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white border border-[#5F1517]/15 shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col max-h-[70vh] animate-fade-in">
                  {/* Results Count Header */}
                  <div className="px-5 py-3.5 border-b border-[#5F1517]/10 bg-[#FFF7F2] flex justify-between items-center text-[13px] text-[#801416] font-bold tracking-wide font-sans">
                    <span>{filteredProducts.length} EXCLUSIVE DESIGNS FOUND</span>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-[#A56B25] hover:text-[#801416] underline underline-offset-2 transition-colors font-semibold">Clear Search</button>
                    )}
                  </div>

                  {/* Results List */}
                  <div className="overflow-y-auto p-3 flex-grow scrollbar-thin scrollbar-thumb-[#801416]/20 scrollbar-track-transparent">
                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1.5">
                        {filteredProducts.map(product => {
                          const cat = allCategories.find(c => c.id === product.category_id);
                          return (
                            <Link
                              key={product.id}
                              to={`/shop/${product.id}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-4 p-2.5 hover:bg-[#FFF7F2] rounded-xl transition-all duration-300 group border border-transparent hover:border-[#5F1517]/10"
                            >
                              <div className="w-14 h-14 bg-[#FFF7F2] rounded-lg overflow-hidden flex-shrink-0 border border-[#5F1517]/5">
                                {product.image_url ? (
                                  <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#A56B25]/50">
                                    <Search size={18} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow min-w-0 flex flex-col justify-center">
                                <h4 className="text-[13px] font-bold text-[#5F1517] truncate group-hover:text-[#A56B25] transition-colors font-sans">{product.name}</h4>
                                <p className="text-[11px] text-[#801416]/70 mt-0.5 font-medium uppercase tracking-widest">{cat ? cat.name : 'Jewellery'}</p>
                              </div>
                              <div className="text-right flex-shrink-0 flex flex-col justify-center">
                                <p className="text-sm font-bold text-[#801416]">₹{product.price.toLocaleString('en-IN')}</p>
                                {product.original_price && product.original_price > product.price && (
                                  <p className="text-[11px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#FFF7F2] rounded-full flex items-center justify-center mb-4">
                          <Search size={28} className="text-[#A56B25]/40" />
                        </div>
                        <p className="text-[#801416] font-semibold text-[15px]">No Exquisite Pieces Found</p>
                        <p className="text-[12px] text-gray-500 mt-1">Try a different category or search term</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Icons */}
            <div className="hidden lg:flex items-center gap-5 text-[#801416] font-medium text-[13px] lg:text-[12px]">
              {/* Subscription Bell */}
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="relative cursor-pointer hover:opacity-80 text-[#801416] bg-transparent border-0 p-0 outline-none transition-all duration-300"
                aria-label="Subscribe to notifications"
              >
                <Bell size={22} strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFCB08] w-2 h-2 rounded-full animate-pulse"></span>
              </button>
              {/* Login */}
              {user ? (
                <Link to="/account" className="flex items-center gap-2 cursor-pointer hover:opacity-80 no-underline text-[#801416]">
                  <span className="uppercase">ACCOUNT</span> <User size={20} strokeWidth={1.5} />
                </Link>
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
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="hover:opacity-80 transition relative"
                aria-label="Subscribe to notifications"
              >
                <Bell size={22} strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFCB08] w-1.5 h-1.5 rounded-full animate-pulse"></span>
              </button>
              <button className="hover:opacity-80 transition" onClick={() => setIsMobileSearchOpen(true)}>
                <Search size={22} strokeWidth={1.5} />
              </button>
              {user ? (
                <Link to="/account" className="hover:opacity-80 transition text-[#801416]">
                  <User size={22} strokeWidth={1.5} />
                </Link>
              ) : (
                <button className="hover:opacity-80 transition text-[#801416]" onClick={() => setIsLoginModalOpen(true)}>
                  <User size={22} strokeWidth={1.5} />
                </button>
              )}
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
        <nav className="hidden lg:flex w-full bg-[#FFF7F2] border-b border-[#5F1517]/10">
          <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-10 xl:px-14">
            <ul className="flex items-center justify-center gap-5 xl:gap-6 py-2.5 text-[13.5px] lg:text-[12.5px] font-medium text-[#801416] font-sans w-full">
              <li className="whitespace-nowrap"><Link to="/shop" className="text-[#801416] no-underline hover:opacity-80 transition font-bold">Shop All</Link></li>
              <li className="whitespace-nowrap"><Link to="/new-arrivals" className="text-[#801416] no-underline hover:opacity-80 transition font-bold">New Arrivals</Link></li>
              
              {topLevelCategories.map(cat => {
                const subCats = getSubcategories(cat.id);
                if (subCats.length > 0) {
                  return (
                    <li key={cat.id} className="whitespace-nowrap group relative z-50">
                      <Link to={`/shop?category=${cat.id}`} className="text-[#801416] no-underline flex items-center gap-1 hover:opacity-80 transition font-bold">
                        {cat.name} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                      </Link>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <div className="bg-white border border-[#5F1517]/10 shadow-xl rounded-xl w-48 py-2 relative before:absolute before:-top-3 before:left-0 before:w-full before:h-3">
                          {subCats.map(sub => (
                            <Link key={sub.id} to={`/shop?category=${sub.id}`} className="block px-5 py-2.5 text-[13px] text-[#801416] hover:bg-[#FFF7F2] font-semibold transition-colors border-b border-gray-50 last:border-0">
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                } else {
                  return (
                    <li key={cat.id} className="whitespace-nowrap">
                      <Link to={`/shop?category=${cat.id}`} className="text-[#801416] no-underline hover:opacity-80 transition font-bold">{cat.name}</Link>
                    </li>
                  );
                }
              })}

              <li className="whitespace-nowrap"><Link to="/gold-rates" className="text-[#801416] no-underline hover:opacity-80 transition font-bold">Today's Gold Rate</Link></li>
              <li className="ml-2">
                <Link
                  to="/virtual-shopping"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide shadow-sm hover:opacity-90 transition no-underline"
                >
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
                  Live Video Call
                </Link>
              </li>
            </ul>
          </div>
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
                <Link to="/virtual-shopping" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-bold text-sm no-underline">Virtual Shopping</Link>
              </li>
              
              {/* Divider for Categories */}
              {topLevelCategories.length > 0 && (
                <li className="px-6 py-4 bg-[#FFF7F2] flex items-center gap-3">
                  <div className="flex-grow h-px bg-[#5F1517]/10"></div>
                  <span className="text-[10px] uppercase tracking-widest text-[#801416]/60 font-bold whitespace-nowrap">Collections</span>
                  <div className="flex-grow h-px bg-[#5F1517]/10"></div>
                </li>
              )}
              {topLevelCategories.length > 0 && (
                <li className="px-4 py-4 border-b border-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    {topLevelCategories.map(cat => {
                      const subCats = getSubcategories(cat.id);
                      const isExpanded = expandedMobileCategory === cat.id;
                      
                      return (
                        <div key={cat.id} className="bg-white border border-[#5F1517]/10 rounded-xl overflow-hidden shadow-sm flex flex-col">
                          <div className="flex items-stretch justify-between">
                            <Link to={`/shop?category=${cat.id}`} onClick={() => setIsMobileMenuOpen(false)} className="flex-grow p-3 text-[#801416] font-bold text-[13px] flex items-center justify-center text-center leading-tight no-underline">
                              {cat.name}
                            </Link>
                            {subCats.length > 0 && (
                              <button onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)} className="px-2 text-[#801416] border-l border-[#5F1517]/10 bg-[#FFF7F2]/30 hover:bg-[#FFF7F2] flex items-center justify-center">
                                <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          
                          {/* Subcategories Accordion */}
                          {isExpanded && subCats.length > 0 && (
                            <div className="bg-[#FFF7F2]/50 border-t border-[#5F1517]/10 flex flex-col">
                              {subCats.map(sub => (
                                <Link key={sub.id} to={`/shop?category=${sub.id}`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-[#801416]/80 font-medium text-[11px] no-underline hover:bg-white/50 border-b border-white last:border-0">
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </li>
              )}
              <li className="border-b border-gray-50 hover:bg-[#FFF7F2]">
                <Link to="/gold-rates" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3 text-[#801416] font-medium text-sm no-underline">Today's Gold Rate</Link>
              </li>
            </ul>
          </div>
        )}

        {/* ── MOBILE SEARCH FULLSCREEN OVERLAY ── */}
        {isMobileSearchOpen && (
          <div className="lg:hidden fixed inset-0 bg-[#FFF7F2] z-[70] flex flex-col animate-fade-in">
            <div className="p-4 border-b border-[#5F1517]/10 flex items-center gap-3 bg-white shadow-sm">
              <button onClick={() => setIsMobileSearchOpen(false)} className="text-[#801416] hover:bg-[#FFF7F2] p-1.5 rounded-full transition-colors">
                <X size={24} strokeWidth={2} />
              </button>
              <div className="flex-grow flex items-center bg-[#FFF7F2] border border-[#5F1517]/20 rounded-full overflow-hidden px-4 focus-within:border-[#801416] focus-within:ring-1 focus-within:ring-[#801416]/20 transition-all">
                <Search size={16} className="text-[#A56B25] flex-shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder={placeholderText}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-transparent outline-none text-[13px] font-medium py-3 px-3 text-[#5F1517] placeholder-[#5F1517]/40"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-white border-b border-[#5F1517]/10 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-[#A56B25] font-bold whitespace-nowrap">Filter By:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-[#801416] font-bold text-[13px] outline-none text-right appearance-none pl-4 cursor-pointer"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="text-[#801416] ml-1 pointer-events-none" />
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              <div className="mb-4 text-[11px] tracking-widest uppercase text-[#801416]/60 font-bold">{filteredProducts.length} Results Found</div>
              {filteredProducts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredProducts.map(product => {
                    const cat = allCategories.find(c => c.id === product.category_id);
                    return (
                      <Link
                        key={product.id}
                        to={`/shop/${product.id}`}
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm border border-[#5F1517]/5 active:scale-[0.98] transition-transform"
                      >
                        <div className="w-16 h-16 bg-[#FFF7F2] rounded-xl overflow-hidden flex-shrink-0 border border-[#5F1517]/10">
                          {product.image_url ? (
                            <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#A56B25]/30">
                              <Search size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col justify-center">
                          <h4 className="text-[13px] font-bold text-[#5F1517] truncate leading-tight">{product.name}</h4>
                          <p className="text-[10px] text-[#A56B25] mt-1 font-semibold uppercase tracking-wider">{cat ? cat.name : 'Jewellery'}</p>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-[14px] font-bold text-[#801416]">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-[10px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-[#5F1517]/5 flex items-center justify-center mb-5">
                    <Search size={32} className="text-[#A56B25]/30" />
                  </div>
                  <p className="text-[#801416] font-bold text-base">No pieces found</p>
                  <p className="text-sm text-[#801416]/50 mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Red Offer Banner — NOT sticky, scrolls with content */}
      <div className="w-full bg-[#721013] text-center py-1 text-white text-[11px] md:text-[13px] font-medium tracking-wide">
        Flat 20% off on VA, for Online Gold Jewellery
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          fetchUserProfile();
          const redirectUrl = sessionStorage.getItem('redirect_after_login');
          if (redirectUrl) {
            sessionStorage.removeItem('redirect_after_login');
            navigate(redirectUrl);
          } else {
            navigate('/account');
          }
        }}
      />

      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
    </>
  );
};

export default Header;
