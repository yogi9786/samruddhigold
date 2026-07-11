import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl, addToCart, addToWishlist, removeFromWishlist } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Share2, Star, Search, Tag } from 'lucide-react';

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

  const similarScrollRef = useRef<HTMLDivElement>(null);

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
            <div className="relative aspect-square overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300" />
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

            {/* Ring / Bangle Size and Quantity Selectors (side by side) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Ring Size */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ring Size</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:ring-1 focus:ring-[var(--color-royal)] font-semibold shadow-sm">
                  <option>{product.other_info?.ring_size || '18'}</option>
                  <option>12</option>
                  <option>14</option>
                  <option>16</option>
                  <option>20</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Weight</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:ring-1 focus:ring-[var(--color-royal)] font-semibold shadow-sm">
                  <option>{product.basic_info?.approx_gross_weight ? `${product.basic_info.approx_gross_weight}g` : (product.weight ? `${product.weight}g` : '2.56g')}</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Quantity</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:ring-1 focus:ring-[var(--color-royal)] font-semibold shadow-sm">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                </select>
                <span className="text-[9px] text-gray-400 block mt-1 leading-tight font-medium">*Maximum allowed qty 3</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#5F1517]">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-gray-400 line-through text-lg font-medium">₹{product.original_price.toLocaleString('en-IN')}</span>
                    <span className="text-[#801416] font-bold text-sm">({Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                MRP inclusive of all taxes. <a href="#price-breakup" className="text-[var(--color-royal)] font-semibold underline ml-1">View Details</a>
              </p>
              <button className="text-xs text-gray-500 hover:text-[var(--color-royal)] mt-2.5 flex items-center gap-1 font-medium transition-colors">
                <span>🔔</span> Notify price drop
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

        {/* ─── Trust Markers Section (Hallmark, Fast Shipping, Free Insured Shipping, Return Policy) ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-gray-200/60 mb-12 bg-white rounded-2xl shadow-sm px-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 flex items-center justify-center text-xl mb-2 text-[#A56B25] bg-[#A56B25]/5 rounded-full">🛡️</div>
            <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-1">BIS Hallmark Jewellery</h5>
            <p className="text-[9px] text-gray-400 font-semibold max-w-[200px]">Authenticity Guaranteed, Purity Assured</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 flex items-center justify-center text-xl mb-2 text-[#A56B25] bg-[#A56B25]/5 rounded-full">🚀</div>
            <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-1">Fast Shipping</h5>
            <p className="text-[9px] text-gray-400 font-semibold max-w-[200px]">Swift & Secure Delivery to Your Doorstep</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 flex items-center justify-center text-xl mb-2 text-[#A56B25] bg-[#A56B25]/5 rounded-full">📦</div>
            <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-1">Free Insured Shipping</h5>
            <p className="text-[9px] text-gray-400 font-semibold max-w-[200px]">Your Precious Jewellery, Protected Every Step</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 flex items-center justify-center text-xl mb-2 text-[#A56B25] bg-[#A56B25]/5 rounded-full">🔄</div>
            <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-1">Return Policy</h5>
            <p className="text-[9px] text-gray-400 font-semibold max-w-[200px]">15 Days Easy Returns Guaranteed</p>
          </div>
        </div>

        {/* ─── Product Description & Information Box ─── */}
        <div className="bg-[#FAF5EE] rounded-3xl p-6 sm:p-10 mb-12 border border-[#EBE1D4]/40">
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Description Block */}
            <div className="text-left">
              <h3 className="text-base font-bold text-[#801416] mb-3 font-serif uppercase tracking-wider">Product Description</h3>
              <div className="bg-white rounded-2xl p-6 border border-[#EBE1D4]/30 shadow-sm">
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-pre-line font-medium">
                  {product.description || `Make a bold yet refined statement with this beautifully crafted gold ring, featuring a striking striped design at its center complemented by black enamel work on both sides. The contrast between the radiant gold and the deep black enamel creates a sophisticated dual-tone effect, adding depth and character to the overall design. The central stripe pattern enhances its modern appeal, while the enamel detailing brings a touch of uniqueness and style. Crafted with precision, the ring offers a smooth finish and a comfortable fit, making it suitable for everyday wear as well as special occasions.`}
                </p>
              </div>
            </div>

            {/* Information Block */}
            <div className="text-left">
              <h3 className="text-base font-bold text-[#801416] mb-3 font-serif uppercase tracking-wider">Product Information</h3>
              <div className="bg-white rounded-2xl p-6 border border-[#EBE1D4]/30 shadow-sm max-w-lg">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#801416]">Metal and Purity</h4>
                    <p className="text-sm text-gray-500 font-semibold mt-0.5">
                      {product.basic_info?.metal || 'Gold'} {product.basic_info?.metal_purity || '91.6'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-1">
                    <div>
                      <h4 className="text-sm font-bold text-[#801416]">Size</h4>
                      <p className="text-sm text-gray-500 font-semibold mt-0.5">
                        {product.other_info?.ring_size || product.other_info?.bangle_size || '18'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#801416]">Weight</h4>
                      <p className="text-sm text-gray-500 font-semibold mt-0.5">
                        {product.basic_info?.approx_gross_weight ? `${product.basic_info.approx_gross_weight}gms` : (product.weight ? `${product.weight}gms` : '2.568gms')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Price Breakup Section (Minimal Gitanjali/GRT Table Layout) ─── */}
        {breakup && (
          <section id="price-breakup" className="mb-16 text-left max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-150">
              <h2 className="text-xl font-serif text-[#801416] tracking-wide font-bold">
                Price Breakup <span className="text-xs text-[#801416] underline font-sans ml-3 cursor-pointer">View Less</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-gray-500">
                <thead>
                  <tr className="text-gray-400 font-medium border-b border-gray-150">
                    <th className="py-3 text-left font-normal">Component</th>
                    <th className="py-3 text-left font-normal">Rate</th>
                    <th className="py-3 text-left font-normal">Weight</th>
                    <th className="py-3 text-left font-normal">Value</th>
                    <th className="py-3 text-left font-normal">Discount</th>
                    <th className="py-3 text-right font-normal">Final Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold">
                  {/* Gold Row */}
                  <tr>
                    <td className="py-4 text-[#801416] font-bold">Gold</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-right font-bold">—</td>
                  </tr>
                  <tr className="text-gray-500 font-medium">
                    <td className="py-3 pl-4 text-gray-400 font-medium">
                      {product.basic_info?.metal_purity || '91.6'} Gold
                    </td>
                    <td className="py-3">{breakup.gold_rate}</td>
                    <td className="py-3">{breakup.gold_weight}</td>
                    <td className="py-3">₹{breakup.metal_value.toLocaleString('en-IN')}</td>
                    <td className="py-3">₹0</td>
                    <td className="py-3 text-right font-semibold">₹{breakup.metal_value.toLocaleString('en-IN')}</td>
                  </tr>

                  {/* Making Charges Row */}
                  <tr className="font-medium text-gray-500">
                    <td className="py-4 text-[#801416] font-bold">Making Charges</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4">₹{breakup.making_charges_value.toLocaleString('en-IN')}</td>
                    <td className="py-4">₹{breakup.making_charges_discount.toLocaleString('en-IN')}</td>
                    <td className="py-4 text-right font-semibold">₹{breakup.making_charges_final.toLocaleString('en-IN')}</td>
                  </tr>

                  {/* Total Row */}
                  <tr className="border-t border-b border-gray-200 font-bold bg-gray-50/10">
                    <td className="py-4 text-[#801416] font-bold">Total</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-gray-700">₹{breakup.sub_total_value.toLocaleString('en-IN')}</td>
                    <td className="py-4 text-red-500">₹{breakup.making_charges_discount.toLocaleString('en-IN')}</td>
                    <td className="py-4 text-right text-gray-800 font-bold">₹{breakup.sub_total_final.toLocaleString('en-IN')}</td>
                  </tr>

                  {/* GST Row */}
                  <tr className="font-medium text-gray-500">
                    <td className="py-4 text-[#801416] font-bold">GST(3%)</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4">₹{breakup.tax_value.toLocaleString('en-IN')}</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-right font-semibold">₹{breakup.tax_final.toLocaleString('en-IN')}</td>
                  </tr>

                  {/* Grand Total Row */}
                  <tr className="border-t-2 border-b border-gray-300 bg-gray-50/20 font-bold text-gray-900">
                    <td className="py-4 text-[#801416] font-extrabold text-sm">Grand Total</td>
                    <td className="py-4">—</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-[#801416] font-extrabold">₹{breakup.grand_total_value.toLocaleString('en-IN')}</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-right text-[#801416] text-sm font-black">₹{breakup.grand_total_final.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── Similar Designs Section ─── */}
        {similarProducts.length > 0 && (
          <section className="mb-16 text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[var(--color-primary)] rounded-full"></span>
                <h2 className="text-xl sm:text-2xl font-serif text-[var(--color-royal)] tracking-wide font-light">Similar Designs</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollHorizontal(similarScrollRef, 'left')}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[var(--color-royal)] hover:border-[var(--color-primary)] transition-all bg-white">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => scrollHorizontal(similarScrollRef, 'right')}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[var(--color-royal)] hover:border-[var(--color-primary)] transition-all bg-white">
                  <ChevronRight size={16} />
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
                        <span className="font-bold text-gray-800 text-sm sm:text-base">₹{p.price.toLocaleString('en-IN')}</span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
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
