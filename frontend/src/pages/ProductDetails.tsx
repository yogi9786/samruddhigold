import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl, addToCart, addToWishlist, removeFromWishlist } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Share2, Star, Search, Tag, Award, Truck, ShieldCheck, RotateCcw, BellRing } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  discount_text?: string;
  image_url?: string;
  gallery_urls?: string[];
  category_id?: string;
  description?: string;
  weight?: string;
  quantity?: number;
  status?: string;
  ready_to_dispatch?: boolean;
  transit_insurance?: boolean;
  price_breakup?: any;
  basic_info?: any;
  stone_info?: any;
  other_info?: any;
  return_policy?: any;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const navigate = useNavigate();

  // Cart & Wishlist state
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'price' | 'shipping'>('details');

  const similarScrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkTabsScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 5);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const handleTabsScroll = (direction: 'left' | 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    const scrollAmount = 150;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (el) {
      el.addEventListener('scroll', checkTabsScroll);
      checkTabsScroll();
      window.addEventListener('resize', checkTabsScroll);
      const t = setTimeout(checkTabsScroll, 300);
      return () => {
        el.removeEventListener('scroll', checkTabsScroll);
        window.removeEventListener('resize', checkTabsScroll);
        clearTimeout(t);
      };
    }
  }, [product, activeTab]);

  const handleAddToCart = async () => {
    if (cartSuccess) {
      navigate('/cart');
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    setCartSuccess(false);
    try {
      await addToCart(product.id, 1);
      setCartSuccess(true);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Could not add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (!localStorage.getItem('access_token')) {
      alert("Please login to use the wishlist.");
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        const userRes = await api.get('/auth/me');
        await addToWishlist(product.id, userRes.data.id);
        setIsInWishlist(true);
      }
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Error updating wishlist:', err);
      alert('Failed to update wishlist');
    }
  };

  useEffect(() => {
    if (!product) return;
    const fetchWishlistStatus = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          const res = await api.get('/wishlist/');
          const inWishlist = res.data.some((item: any) => item.id === product.id);
          setIsInWishlist(inWishlist);
        }
      } catch (err) {}
    };
    fetchWishlistStatus();
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data;
        if (data.image_url) data.image_url = getImageUrl(data.image_url);
        if (data.gallery_urls) data.gallery_urls = data.gallery_urls.map((img: string) => getImageUrl(img));
        setProduct(data);
        setSelectedImage(data.image_url || '');
        setSelectedImageIdx(0);

        // Track recently viewed in localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
          const filtered = stored.filter((p: any) => p.id !== data.id).slice(0, 11);
          filtered.unshift({ id: data.id, name: data.name, price: data.price, image_url: data.image_url, original_price: data.original_price });
          localStorage.setItem('recently_viewed', JSON.stringify(filtered.slice(0, 12)));
        } catch {}

        // Fetch similar products
        try {
          const simRes = await api.get(`/products/${id}/similar`);
          const simData = simRes.data.map((p: any) => ({
            ...p,
            image_url: p.image_url ? getImageUrl(p.image_url) : undefined,
          }));
          setSimilarProducts(simData);
        } catch {}

      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
  const scrollHorizontal = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // Dynamically calculate the price breakup if not present or incomplete
  const breakup = useMemo(() => {
    if (!product) return null;
    const rate = product.price_breakup?.gold_rate || 13275;
    const weight = parseFloat(product.price_breakup?.gold_weight || product.basic_info?.approx_gross_weight || product.weight || '2.568');
    
    // Fallback metal value
    const metalVal = product.price_breakup?.metal_value || Math.round(rate * weight);
    
    // Making charges estimations
    const makingCharges = product.price_breakup?.making_charges_value || Math.round(metalVal * 0.207);
    const makingDiscount = product.price_breakup?.making_charges_discount || Math.round(makingCharges * 0.2);
    const makingFinal = product.price_breakup?.making_charges_final || (makingCharges - makingDiscount);
    
    // Subtotals
    const subtotalVal = product.price_breakup?.sub_total_value || (metalVal + makingCharges);
    const subtotalFinal = product.price_breakup?.sub_total_final || (metalVal + makingFinal);
    
    // Taxes (GST 3%)
    const taxVal = product.price_breakup?.tax_value || Math.round(subtotalVal * 0.03);
    const taxFinal = product.price_breakup?.tax_final || Math.round(subtotalFinal * 0.03);
    
    // Grand Totals
    const grandVal = product.price_breakup?.grand_total_value || (subtotalVal + taxVal);
    const grandFinal = product.price_breakup?.grand_total_final || (subtotalFinal + taxFinal);

    return {
      gold_rate: rate,
      gold_weight: weight,
      metal_value: metalVal,
      making_charges_value: makingCharges,
      making_charges_discount: makingDiscount,
      making_charges_final: makingFinal,
      sub_total_value: subtotalVal,
      sub_total_final: subtotalFinal,
      tax_value: taxVal,
      tax_final: taxFinal,
      grand_total_value: grandVal,
      grand_total_final: product.price || grandFinal
    };
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
        <Header />
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">Loading masterpiece…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
        <Header />
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="text-6xl mb-4 opacity-30">💍</div>
          <p className="text-xl font-serif text-[var(--color-royal)]/60">Product not found</p>
          <Link to="/shop" className="mt-4 text-sm text-[var(--color-royal)] underline underline-offset-4">Browse Collection</Link>
        </div>
      </div>
    );
  }

  const galleryImages = product.gallery_urls?.length ? product.gallery_urls : (product.image_url ? [product.image_url] : []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory)] font-sans">
      <Header />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-12 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium text-left">
          <Link to="/" className="hover:text-[var(--color-royal)] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[var(--color-royal)] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[var(--color-royal)] font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ─── Product Hero: Image + Info ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12">

          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm group cursor-zoom-in">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingBag size={60} />
                </div>
              )}
            </div>

            {/* Thumbnail strip (centered below image) */}
            {galleryImages.length > 1 && (
              <div className="flex justify-center gap-3 flex-wrap">
                {galleryImages.map((img, idx) => (
                  <button key={idx} onClick={() => { setSelectedImage(img); setSelectedImageIdx(idx); }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIdx === idx 
                        ? 'border-[var(--color-royal)] shadow-sm' 
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                    }`}>
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col text-left">
            {/* Bestseller Badge and Top Right Actions */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#FDF0EC] text-[#A56B25] px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <Star size={12} fill="currentColor" /> BESTSELLER
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[var(--color-royal)] border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-all hover:bg-gray-50 font-medium">
                  <Share2 size={13} /> Share
                </button>
                <button onClick={toggleWishlist} className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 bg-white transition-all hover:bg-gray-50 font-medium ${isInWishlist ? 'text-red-500 border-red-200 bg-red-50/20' : 'text-gray-500 border-gray-200'}`}>
                  <Heart size={13} fill={isInWishlist ? 'currentColor' : 'none'} /> Wishlist
                </button>
                <button onClick={() => navigate('/shop')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[var(--color-royal)] border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-all hover:bg-gray-50 font-medium">
                  View Similar
                </button>
              </div>
            </div>

            {/* SKU and Code */}
            <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Product Code: {product.sku}</p>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-serif text-[var(--color-royal)] font-light leading-snug mb-4">
              {product.name}
            </h1>

            {/* ── Spec Cards ── */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              {[
                { label: product.other_info?.ring_size ? 'Ring Size' : 'Bangle Size', value: product.other_info?.ring_size || product.other_info?.bangle_size || '18' },
                { label: 'Weight', value: product.basic_info?.approx_gross_weight ? `${product.basic_info.approx_gross_weight}g` : (product.weight ? `${product.weight}g` : '44g') },
                { label: 'Qty', value: '1' },
              ].map((spec) => (
                <div key={spec.label} className="relative overflow-hidden bg-[var(--color-ivory)] border border-[var(--color-primary)]/30 rounded-xl sm:rounded-2xl px-2 py-3 sm:p-4 text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/60 transition-all duration-300 group">
                  {/* Top gold accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--color-primary)] rounded-t-xl opacity-70" />
                  <span className="block font-sans font-bold text-[8px] sm:text-[9px] text-[var(--color-royal)] uppercase tracking-[0.12em] sm:tracking-widest mb-1">
                    {spec.label}
                  </span>
                  <span className="font-sans font-bold text-base sm:text-xl text-[var(--color-royal)] leading-none">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-sans font-extrabold text-[#5F1517]">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-gray-400 line-through text-lg font-sans font-medium">₹{product.original_price.toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                MRP inclusive of all taxes. <a href="#price-breakup" className="text-[var(--color-royal)] font-semibold underline ml-1">View Details</a>
              </p>
              <button 
                onClick={() => window.dispatchEvent(new Event('openSubscribeModal'))}
                className="text-[10px] sm:text-xs text-[var(--color-royal)] hover:text-opacity-80 mt-3.5 flex items-center gap-1.5 font-bold uppercase tracking-wider transition-colors border border-[var(--color-primary)]/20 px-3.5 py-2.5 bg-[var(--color-ivory)] hover:bg-[#FFF2EC] rounded-xl shadow-sm"
              >
                <BellRing size={13} className="text-[#A56B25] fill-[#A56B25]/10 animate-bounce" /> 
                Notify Price Drop
              </button>
            </div>

            {/* Add to Cart and Pincode */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`px-8 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 min-w-[160px] flex items-center justify-center gap-2 ${
                    cartSuccess 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-[#5F1517] hover:bg-[#4A1012] text-white shadow-md'
                  }`}
                >
                  <ShoppingBag size={14} />
                  {addingToCart ? 'Adding...' : cartSuccess ? 'View Cart' : 'Add to Cart'}
                </button>

                {/* Pincode Checker */}
                <div className="flex-1 flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <input type="text" placeholder="Enter a pincode" className="px-4 py-2.5 text-xs text-gray-700 outline-none w-full bg-transparent placeholder-gray-400 font-semibold" />
                  <button className="bg-[#5F1517] text-white px-4 hover:bg-[#4A1012] transition-colors flex items-center justify-center">
                    <Search size={14} />
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-left">
                <input type="checkbox" className="rounded text-[#5F1517] focus:ring-[#5F1517]/20 border-gray-300 w-3.5 h-3.5" />
                <span className="text-xs text-gray-500 font-semibold">For international shipment</span>
              </label>
            </div>

            {/* Experience Virtual Shopping Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Video Call box */}
              <div className="bg-[#FAF3E3] rounded-2xl p-4 border border-[#E9D7B7]/40 flex flex-col justify-between items-start text-left">
                <div>
                  <h4 className="font-bold text-[#801416] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    📹 Video Call Us
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-snug font-semibold mb-3">
                    Get on a video chat with us to take a closer look
                  </p>
                </div>
                <a href={`https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'd%20like%20a%20Video%20Call%20to%20see%20this%20product:%20${product.name}%20(SKU:%20${product.sku}).`} target="_blank" rel="noopener noreferrer" className="inline-block text-center bg-[#801416] text-white text-[10px] font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                  Video call
                </a>
              </div>

              {/* WhatsApp box */}
              <div className="bg-[#EAF6EC] rounded-2xl p-4 border border-[#CDE5D2]/40 flex flex-col justify-between items-start text-left">
                <div>
                  <h4 className="font-bold text-[#1F5F29] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    💬 Whatsapp
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-snug font-semibold mb-3">
                    Get Whatsapp Assistance - Chat with us
                  </p>
                </div>
                <a href={`https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20have%20an%20enquiry%20about:%20${product.name}%20(SKU:%20${product.sku}).`} target="_blank" rel="noopener noreferrer" className="inline-block text-center bg-[#1F5F29] text-white text-[10px] font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                  Chat with Us
                </a>
              </div>
            </div>
          </div>
        </div>


        {/* ─── Luxury Upper Divider ─── */}
        <div className="flex items-center justify-center gap-4 my-12 sm:my-16">
          <div className="h-px w-full max-w-[150px] sm:max-w-[240px] bg-[var(--color-primary)]/35" />
          <span className="w-2.5 h-2.5 rotate-45 border border-[var(--color-primary)] bg-white" />
          <div className="h-px w-full max-w-[150px] sm:max-w-[240px] bg-[var(--color-primary)]/35" />
        </div>

        {/* ─── Trust Markers ─── */}
        <div className="mb-12 sm:mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
            {[
              { icon: <Award size={32} strokeWidth={1} />, title: 'BIS Hallmark Jewellery', sub: 'Authenticity Guaranteed, Purity Assured' },
              { icon: <Truck size={32} strokeWidth={1} />, title: 'Fast Shipping', sub: 'Swift & Secure Delivery to Your Doorstep' },
              { icon: <ShieldCheck size={32} strokeWidth={1} />, title: 'Free Insured Shipping', sub: 'Your Precious Jewellery, Protected Every Step' },
              { icon: <RotateCcw size={32} strokeWidth={1} />, title: 'Return Policy', sub: '15 Days Easy Returns Guaranteed' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center px-4 py-3 group">
                {/* Icon circle */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-[var(--color-royal)] mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" style={{background: 'rgba(255, 203, 8, 0.15)', border: '1px solid rgba(130, 12, 15, 0.1)'}}>
                  {item.icon}
                </div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--color-royal)] leading-tight mb-2 tracking-wide">{item.title}</h4>
                <p className="font-sans text-[10px] sm:text-xs text-gray-500 leading-relaxed max-w-[160px] font-medium">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tabbed Section ─── */}
        <div className="mb-20">
          {/* Tab Selector */}
          <div className="relative flex items-center border-b border-[var(--color-primary)]/30 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Left Scroll Button */}
            {showLeftArrow && (
              <button 
                onClick={() => handleTabsScroll('left')}
                className="absolute left-1 z-20 p-1.5 bg-[#FFF7F2] border border-[#D4AF37]/30 rounded-full shadow-md text-[#5F1517] hover:bg-[#FFE8DC] hover:border-[#D4AF37] transition sm:hidden"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Scrollable Tabs Wrapper */}
            <div 
              ref={tabsRef}
              className="w-full overflow-x-auto scrollbar-hide flex scroll-smooth"
            >
              <div className="flex gap-1 sm:gap-6 mx-auto">
                {[
                  { key: 'details' as const, label: 'Product Description' },
                  ...(breakup ? [{ key: 'price' as const, label: 'Price Breakup' }] : []),
                  { key: 'shipping' as const, label: 'Shipping & Returns' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex-shrink-0 px-4 sm:px-10 py-4 font-serif font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap text-[11px] sm:text-sm ${
                      activeTab === tab.key
                        ? 'text-[var(--color-royal)] scale-105'
                        : 'text-gray-400 hover:text-[var(--color-royal)]/70'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3px] bg-[var(--color-royal)] rounded-t-full shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Scroll Button */}
            {showRightArrow && (
              <button 
                onClick={() => handleTabsScroll('right')}
                className="absolute right-1 z-20 p-1.5 bg-[#FFF7F2] border border-[#D4AF37]/30 rounded-full shadow-md text-[#5F1517] hover:bg-[#FFE8DC] hover:border-[#D4AF37] transition sm:hidden"
                aria-label="Scroll Right"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Tab Content — high-end luxury card matching brand specs */}
          <div className="rounded-2xl shadow-sm border border-[var(--color-primary)]/15 overflow-hidden transition-all duration-300" style={{background: 'linear-gradient(135deg, #FCF8F4, #FFFDFB)'}}>

            {/* ── Story & Specs Tab ── */}
            {activeTab === 'details' && (
              <div className="p-6 sm:p-10 space-y-10 text-left">
                {/* Product Description */}
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-royal)] mb-4 tracking-wide uppercase border-b border-[var(--color-primary)]/20 pb-2">Product Description</h3>
                  <div className="bg-white/70 rounded-xl p-5 sm:p-8 border border-[var(--color-primary)]/10 shadow-inner">
                    <p className="font-sans text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed sm:leading-loose">
                      {product.description || `Make a bold yet refined statement with this beautifully crafted gold jewellery, featuring exceptional craftsmanship and premium purity. Each piece is BIS Hallmark certified, ensuring authenticity and quality you can trust.`}
                    </p>
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-royal)] mb-6 tracking-wide uppercase border-b border-[var(--color-primary)]/20 pb-2">Product Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Metal and Purity */}
                    <div className="bg-white/80 border border-[var(--color-primary)]/15 rounded-xl p-5 shadow-sm hover:border-[var(--color-royal)]/30 transition-all duration-300">
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Metal & Purity</p>
                      <p className="font-sans text-sm sm:text-base text-[var(--color-royal)] font-bold mt-2">
                        {product.basic_info?.metal || 'Gold'} {product.basic_info?.metal_purity || '91.6'}
                      </p>
                    </div>

                    {/* Size */}
                    <div className="bg-white/80 border border-[var(--color-primary)]/15 rounded-xl p-5 shadow-sm hover:border-[var(--color-royal)]/30 transition-all duration-300">
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Size</p>
                      <p className="font-sans text-sm sm:text-base text-[var(--color-royal)] font-bold mt-2">
                        {product.other_info?.ring_size || product.other_info?.bangle_size || '—'}
                      </p>
                    </div>

                    {/* Weight */}
                    <div className="bg-white/80 border border-[var(--color-primary)]/15 rounded-xl p-5 shadow-sm hover:border-[var(--color-royal)]/30 transition-all duration-300">
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Weight</p>
                      <p className="font-sans text-sm sm:text-base text-[var(--color-royal)] font-bold mt-2">
                        {product.basic_info?.approx_gross_weight ? `${product.basic_info.approx_gross_weight}gms` : (product.weight ? `${product.weight}gms` : '—')}
                      </p>
                    </div>

                    {/* Certification */}
                    <div className="bg-white/80 border border-[var(--color-primary)]/15 rounded-xl p-5 shadow-sm hover:border-[var(--color-royal)]/30 transition-all duration-300">
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Certification</p>
                      <p className="font-sans text-sm sm:text-base text-[var(--color-royal)] font-bold mt-2">
                        {product.other_info?.gold_certification || 'BIS Hallmark'}
                      </p>
                    </div>

                    {/* Product Code */}
                    <div className="bg-white/80 border border-[var(--color-primary)]/15 rounded-xl p-5 shadow-sm hover:border-[var(--color-royal)]/30 transition-all duration-300 col-span-2 md:col-span-1">
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Product Code</p>
                      <p className="font-mono text-xs sm:text-sm text-[var(--color-royal)] font-bold mt-2">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Price Breakup Tab ── */}
            {activeTab === 'price' && breakup && (
              <div className="p-6 sm:p-10 text-left space-y-6">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-royal)] mb-4 tracking-wide uppercase border-b border-[var(--color-primary)]/20 pb-2">Price Breakup</h3>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full min-w-[550px] border-collapse">
                    {/* Header */}
                    <thead>
                      <tr className="border-b border-[var(--color-royal)]/30">
                        {['Component', 'Rate', 'Weight', 'Value', 'Discount', 'Final Value'].map((h, i) => (
                          <th key={h} className={`pb-3.5 font-sans font-bold text-[10px] sm:text-xs text-[var(--color-royal)] uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'} pr-4 sm:pr-6`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {/* Gold row */}
                      <tr className="border-b border-gray-200/50 hover:bg-white/40 transition-all duration-200">
                        <td className="py-4 pr-4 sm:pr-6 font-serif font-bold text-xs sm:text-sm text-[var(--color-royal)]">{product.basic_info?.metal_purity || '91.6'} Gold</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-600">₹{breakup.gold_rate?.toLocaleString('en-IN')}</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-600">{breakup.gold_weight} g</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-700 font-semibold">₹{breakup.metal_value?.toLocaleString('en-IN')}</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-600">₹0</td>
                        <td className="py-4 text-right text-xs sm:text-sm text-gray-800 font-bold">₹{breakup.metal_value?.toLocaleString('en-IN')}</td>
                      </tr>
                      {/* Making Charges */}
                      <tr className="border-b border-gray-200/50 hover:bg-white/40 transition-all duration-200">
                        <td className="py-4 pr-4 sm:pr-6 font-serif font-bold text-xs sm:text-sm text-[var(--color-royal)]">Making Charges</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-400">—</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-400">—</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-gray-700 font-semibold">₹{breakup.making_charges_value?.toLocaleString('en-IN')}</td>
                        <td className="py-4 pr-4 sm:pr-6 text-xs sm:text-sm text-emerald-600 font-semibold">₹{breakup.making_charges_discount?.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right text-xs sm:text-sm text-gray-800 font-bold">₹{breakup.making_charges_final?.toLocaleString('en-IN')}</td>
                      </tr>
                      {/* Total */}
                      <tr className="border-b-2 border-[var(--color-royal)]/30 bg-[var(--color-primary)]/5">
                        <td className="py-4 pr-4 sm:pr-6 font-serif font-bold text-xs sm:text-sm text-[var(--color-royal)]">Total</td>
                        <td className="py-4 pr-4 sm:pr-6"></td>
                        <td className="py-4 pr-4 sm:pr-6"></td>
                        <td className="py-4 pr-4 sm:pr-6 font-sans font-semibold text-xs sm:text-sm text-gray-700">₹{breakup.sub_total_value?.toLocaleString('en-IN')}</td>
                        <td className="py-4 pr-4 sm:pr-6 font-sans font-semibold text-xs sm:text-sm text-emerald-600">₹{breakup.making_charges_discount?.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right font-sans font-bold text-xs sm:text-sm text-[var(--color-royal)]">₹{breakup.sub_total_final?.toLocaleString('en-IN')}</td>
                      </tr>
                      {/* GST */}
                      <tr className="border-b border-gray-200 hover:bg-white/40 transition-all duration-200">
                        <td className="py-4 pr-4 sm:pr-6 font-serif font-bold text-xs sm:text-sm text-[var(--color-royal)]/80">GST (3%)</td>
                        <td className="py-4 pr-4 sm:pr-6"></td>
                        <td className="py-4 pr-4 sm:pr-6"></td>
                        <td className="py-4 pr-4 sm:pr-6 font-sans text-xs sm:text-sm text-gray-700">₹{breakup.tax_value?.toLocaleString('en-IN')}</td>
                        <td className="py-4 pr-4 sm:pr-6"></td>
                        <td className="py-4 text-right font-sans text-xs sm:text-sm text-gray-800 font-bold">₹{breakup.tax_final?.toLocaleString('en-IN')}</td>
                      </tr>
                      {/* Grand Total */}
                      <tr className="bg-[var(--color-royal)]/[0.03]">
                        <td className="py-5 pr-4 sm:pr-6 font-serif font-extrabold text-sm sm:text-base text-[var(--color-royal)]">Grand Total</td>
                        <td className="py-5 pr-4 sm:pr-6"></td>
                        <td className="py-5 pr-4 sm:pr-6"></td>
                        <td className="py-5 pr-4 sm:pr-6 font-sans font-bold text-sm sm:text-base text-[var(--color-royal)]">₹{breakup.grand_total_value?.toLocaleString('en-IN')}</td>
                        <td className="py-5 pr-4 sm:pr-6"></td>
                        <td className="py-5 text-right font-sans font-extrabold text-base sm:text-lg text-[var(--color-royal)]">₹{breakup.grand_total_final?.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Shipping & Returns Tab ── */}
            {activeTab === 'shipping' && (
              <div className="p-6 sm:p-10 space-y-6 text-left">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-royal)] mb-4 tracking-wide uppercase border-b border-[var(--color-primary)]/20 pb-2">Shipping & Return Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: <Truck size={24} strokeWidth={1.2} />, title: 'Free Insured Delivery', desc: 'We offer free insured shipping to your doorstep for all orders within India. Every shipment is fully insured until it reaches you.' },
                    { icon: <Award size={24} strokeWidth={1.2} />, title: 'Purity & Hallmarking', desc: 'Every piece is certified with government-approved BIS Hallmarking, guaranteeing the gold purity of your precious jewellery.' },
                    { icon: <RotateCcw size={24} strokeWidth={1.2} />, title: '15 Days Returns', desc: 'Not satisfied? Enjoy easy returns or exchanges within 15 days of receiving the item. No questions asked.' },
                  ].map((p) => (
                    <div key={p.title} className="bg-white/80 border border-[var(--color-primary)]/15 rounded-2xl p-6 space-y-4 hover:border-[var(--color-royal)]/30 transition-all duration-300 shadow-sm group">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--color-royal)] transition-transform duration-300 group-hover:scale-105" style={{background: 'rgba(255, 203, 8, 0.15)', border: '1px solid rgba(130, 12, 15, 0.05)'}}>
                        {p.icon}
                      </div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--color-royal)]">{p.title}</h4>
                      <p className="font-sans text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── Luxury Brand Ornament Divider ─── */}
        <div className="flex items-center justify-center gap-4 my-16 sm:my-20">
          <div className="h-px w-full max-w-[120px] sm:max-w-[200px] bg-[var(--color-primary)]/40" />
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            <Star size={16} fill="var(--color-primary)" strokeWidth={1} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
          </div>
          <div className="h-px w-full max-w-[120px] sm:max-w-[200px] bg-[var(--color-primary)]/40" />
        </div>

        {/* ─── Similar Designs Section ─── */}
        {similarProducts.length > 0 && (
          <section className="mb-16 text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mb-8">
              <div className="text-center sm:text-left">
                <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-gray-400 font-bold mb-1">Curated Selection</p>
                <h2 className="text-2xl sm:text-3xl font-serif text-[var(--color-royal)] tracking-wide font-light leading-tight">Similar Designs</h2>
                <p className="font-serif italic text-xs sm:text-sm text-gray-500 mt-1">Handpicked masterpieces that complement your choice</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollHorizontal(similarScrollRef, 'left')}
                  className="w-10 h-10 rounded-full border border-[var(--color-primary)]/20 flex items-center justify-center text-gray-400 hover:text-[var(--color-royal)] hover:border-[var(--color-primary)] hover:bg-[#FFFBF7] transition-all bg-white shadow-sm">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => scrollHorizontal(similarScrollRef, 'right')}
                  className="w-10 h-10 rounded-full border border-[var(--color-primary)]/20 flex items-center justify-center text-gray-400 hover:text-[var(--color-royal)] hover:border-[var(--color-primary)] hover:bg-[#FFFBF7] transition-all bg-white shadow-sm">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div ref={similarScrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
              {similarProducts.map((p) => {
                const discountVal = p.original_price && p.original_price > p.price
                  ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                  : null;

                return (
                  <Link to={`/shop/${p.id}`} key={p.id}
                    className="flex-shrink-0 w-[200px] sm:w-[260px] bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[var(--color-primary)]/40 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
                    
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={30} /></div>
                      )}

                      {/* Small Star & Discount Badge */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button className="w-7 h-7 rounded-full bg-white/90 backdrop-blur text-yellow-500 transition-all shadow flex items-center justify-center">
                          <Star size={12} fill="currentColor" />
                        </button>
                        {discountVal && (
                          <button className="w-7 h-7 rounded-full bg-white/90 backdrop-blur text-red-500 transition-all shadow flex items-center justify-center">
                            <Tag size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col justify-start text-left bg-white">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-gray-800 text-sm sm:text-base">₹{p.price.toLocaleString('en-IN')}</span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="font-sans text-[10px] sm:text-xs text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      
                      {discountVal ? (
                        <span className="text-[10px] text-red-500 font-bold mt-1">{discountVal}% Off</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-semibold mt-1">{p.basic_info?.metal_purity || '22K Gold'}</span>
                      )}

                      <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-2 block truncate font-semibold">
                        {p.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
