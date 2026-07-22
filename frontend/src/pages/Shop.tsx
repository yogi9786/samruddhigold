import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getImageUrl, getWishlist, addToWishlist, removeFromWishlist } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, Heart, SlidersHorizontal, Sparkles, Star, Truck, Eye, Search } from 'lucide-react';

import imgCatRings from '../assets/gen/cat_rings_1782214860176.png';
import imgCatEarrings from '../assets/gen/cat_earrings_1782214875918.png';
import imgCatBangles from '../assets/gen/cat_bangles_1782214893370.png';
import imgCatPendants from '../assets/gen/cat_pendants_1782214847919.png';
import imgCatMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';
import imgCatSets from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import imgGoldSet from '../assets/gen/gold_set_1782213378462.png';

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
  status?: string;
  weight?: string;
  ready_to_dispatch?: boolean;
  basic_info?: { approx_gross_weight?: string; metal_purity?: string };
}

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

const getCategoryFallbackImage = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('ring')) return imgCatRings;
  if (lower.includes('earring')) return imgCatEarrings;
  if (lower.includes('bangle') || lower.includes('bracelet') || lower.includes('kangan')) return imgCatBangles;
  if (lower.includes('pendant')) return imgCatPendants;
  if (lower.includes('mangalsutra')) return imgCatMangalsutra;
  if (lower.includes('necklace') || lower.includes('set')) return imgCatSets;
  return imgGoldSet;
};

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Panel visibility state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Category carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search') || searchParams.get('q');
    if (catParam) {
      setSelectedCategoryId(catParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => !p.status || p.status === 'active');

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }

    // Category Filter
    if (selectedCategoryId !== 'all') {
      result = result.filter(p => p.category_id === selectedCategoryId);
    }

    // Price Filter
    if (minPrice !== '') result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice !== '') result = result.filter(p => p.price <= Number(maxPrice));

    // Tag filter from live layout pills
    if (activeTagFilter === 'new_drop') {
      result = result.filter(p => p.discount_text || p.sku.toLowerCase().includes('new'));
    } else if (activeTagFilter === 'bestseller') {
      result = result.filter(p => p.price > 40000);
    } else if (activeTagFilter === 'quick_delivery') {
      result = result.filter(p => p.ready_to_dispatch === true);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.reverse(); break;
      default: break;
    }
    return result;
  }, [products, selectedCategoryId, minPrice, maxPrice, sortBy, searchQuery, activeTagFilter]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          const res = await getWishlist();
          setWishlist(new Set(res.data.map((item: any) => item.id)));
        }
      } catch (err) {
        console.error('Error fetching wishlist', err);
      }
    };
    fetchWishlist();
  }, []);
  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 220;
      carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleWishlist = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('access_token')) {
      alert("Please login to use the wishlist.");
      return;
    }
    try {
      if (wishlist.has(id)) {
        await removeFromWishlist(id);
        setWishlist(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        const userRes = await api.get('/auth/me');
        await addToWishlist(id, userRes.data.id);
        setWishlist(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
      alert('Failed to update wishlist');
    }
  };

  const selectedCategoryName = selectedCategoryId === 'all'
    ? 'All Jewellery'
    : categories.find(c => c.id === selectedCategoryId)?.name || 'All Jewellery';

  const activeFiltersCount = [
    selectedCategoryId !== 'all',
    minPrice !== '',
    maxPrice !== '',
    searchQuery.trim() !== '',
    activeTagFilter !== null,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategoryId('all');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('newest');
    setActiveTagFilter(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
      <Header />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">

        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-sans tracking-wider">
          <Link to="/" className="hover:text-[var(--color-royal)] transition-colors">Home</Link>
          <span className="text-[var(--color-primary)]">›</span>
          <span className="text-[var(--color-royal)] font-semibold">{selectedCategoryName}</span>
        </nav>

        {/* ─── Editorial Header ─── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif text-[var(--color-royal)] tracking-wide font-light">
            {selectedCategoryName}
          </h1>
          <div className="w-12 h-0.5 bg-[var(--color-primary)] mx-auto mt-3"></div>
        </div>

        {/* ─── Category Carousel ─── */}
        <div className="flex items-center gap-4 sm:gap-6 mb-12 w-full px-2 sm:px-4">
          <button onClick={() => scrollCarousel('left')}
            className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-[var(--color-royal)] hover:text-white rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-royal)] shadow-md transition-all duration-300 mx-1 sm:mx-2">
            <ChevronLeft size={18} />
          </button>

          <div ref={carouselRef} className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-2 flex-grow px-4 sm:px-6">
            {/* All Category */}
            <button onClick={() => setSelectedCategoryId('all')}
              className="flex-shrink-0 flex flex-col items-center group transition-all duration-300">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 ${selectedCategoryId === 'all'
                  ? 'ring-2 ring-[var(--color-royal)] ring-offset-2 shadow-md scale-105'
                  : 'shadow border border-[var(--color-primary)]/15'
                }`}>
                <img src={imgGoldSet} alt="" className="w-full h-full object-cover" />
              </div>
              <span className={`text-xs sm:text-sm font-serif mt-2 tracking-wide transition-colors ${selectedCategoryId === 'all' ? 'text-[var(--color-royal)] font-bold' : 'text-gray-600 group-hover:text-[var(--color-royal)]'}`}>
                All Jewellery
              </span>
            </button>

            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
                className="flex-shrink-0 flex flex-col items-center group transition-all duration-300">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 ${selectedCategoryId === cat.id
                    ? 'ring-2 ring-[var(--color-royal)] ring-offset-2 shadow-md scale-105'
                    : 'shadow border border-[var(--color-primary)]/15'
                  }`}>
                  <img src={cat.image_url ? getImageUrl(cat.image_url) : getCategoryFallbackImage(cat.name)} alt="" className="w-full h-full object-cover" />
                </div>
                <span className={`text-xs sm:text-sm font-serif mt-2 tracking-wide transition-colors whitespace-nowrap ${selectedCategoryId === cat.id ? 'text-[var(--color-royal)] font-bold' : 'text-gray-600 group-hover:text-[var(--color-royal)]'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          <button onClick={() => scrollCarousel('right')}
            className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-[var(--color-royal)] hover:text-white rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-royal)] shadow-md transition-all duration-300 mx-1 sm:mx-2">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* ─── Toolbar ─── */}
        <div className="flex flex-row items-center justify-between gap-3 mb-6 pb-5 border-b border-[var(--color-primary)]/15">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-2 font-sans font-semibold text-xs sm:text-sm tracking-widest uppercase px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 border ${isFiltersOpen
                  ? 'bg-[var(--color-royal)] text-white border-[var(--color-royal)] shadow-md'
                  : 'bg-white hover:bg-[#FFF5F5] border-[var(--color-primary)]/20 text-[var(--color-royal)]'
                }`}>
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-[var(--color-primary)] text-[var(--color-royal)] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters}
                className="font-sans font-bold text-xs sm:text-sm tracking-widest uppercase px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-[var(--color-royal)]/25 text-[var(--color-royal)] bg-white hover:bg-[var(--color-royal)]/[0.04] transition-all duration-300 flex items-center gap-1">
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-[var(--color-primary)]/20 rounded-xl py-2.5 sm:py-3 pl-4 sm:pl-5 pr-10 font-sans text-xs sm:text-sm font-semibold text-[var(--color-royal)] focus:outline-none cursor-pointer transition-all hover:border-[var(--color-primary)]/50 shadow-sm">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-royal)] pointer-events-none" />
          </div>
        </div>

        {/* ─── Collapsible Filters Panel ─── */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFiltersOpen ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="bg-white border border-[var(--color-primary)]/15 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-serif font-bold text-sm text-[var(--color-royal)] mb-3">Search Collection</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by name, SKU..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm font-sans bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block font-serif font-bold text-sm text-[var(--color-royal)] mb-3">Price Range</label>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="₹ Min" value={minPrice}
                  onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm font-sans bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                <span className="text-gray-300 font-light">—</span>
                <input type="number" placeholder="₹ Max" value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm font-sans bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={clearAllFilters}
                className="w-full py-3 border border-[var(--color-primary)]/30 hover:border-[var(--color-royal)] text-[var(--color-royal)] font-serif font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#FFF8F8] transition-all">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tag Filter Pills ─── */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
          <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-gray-400 font-semibold mr-1">Filter by:</span>

          <button onClick={() => setActiveTagFilter(activeTagFilter === 'new_drop' ? null : 'new_drop')}
            className={`rounded-xl px-5 py-2.5 font-sans font-bold text-[10px] sm:text-xs tracking-widest uppercase flex items-center gap-2 transition-all duration-300 border ${
              activeTagFilter === 'new_drop'
                ? 'bg-[#2E5A44] text-[#F9F6F0] border-[#2E5A44] shadow-md scale-[1.02]'
                : 'bg-white text-[#2E5A44] border-[#2E5A44]/20 hover:border-[#2E5A44]/50 shadow-sm'
            }`}>
            <Sparkles size={13} strokeWidth={2} />
            New Drop
          </button>

          <button onClick={() => setActiveTagFilter(activeTagFilter === 'bestseller' ? null : 'bestseller')}
            className={`rounded-xl px-5 py-2.5 font-sans font-bold text-[10px] sm:text-xs tracking-widest uppercase flex items-center gap-2 transition-all duration-300 border ${
              activeTagFilter === 'bestseller'
                ? 'bg-[var(--color-royal)] text-[var(--color-primary)] border-[var(--color-royal)] shadow-md scale-[1.02]'
                : 'bg-white text-[var(--color-royal)] border-[var(--color-primary)]/25 hover:border-[var(--color-primary)]/50 shadow-sm'
            }`}>
            <Star size={13} strokeWidth={2} fill={activeTagFilter === 'bestseller' ? 'currentColor' : 'none'} />
            Bestseller
          </button>

          <button onClick={() => setActiveTagFilter(activeTagFilter === 'quick_delivery' ? null : 'quick_delivery')}
            className={`rounded-xl px-5 py-2.5 font-sans font-bold text-[10px] sm:text-xs tracking-widest uppercase flex items-center gap-2 transition-all duration-300 border ${
              activeTagFilter === 'quick_delivery'
                ? 'bg-[#8B6914] text-white border-[#8B6914] shadow-md scale-[1.02]'
                : 'bg-white text-[#8B6914] border-[#A37027]/20 hover:border-[#A37027]/50 shadow-sm'
            }`}>
            <Truck size={13} strokeWidth={2} />
            Quick Delivery
          </button>
        </div>

        {/* ─── Product Grid ─── */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-5" />
              <p className="font-serif text-base text-[var(--color-royal)]/50 tracking-widest">Loading Collection…</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-28 bg-white rounded-3xl border border-[var(--color-primary)]/10 shadow-sm">
              <div className="text-6xl mb-6 opacity-30">💍</div>
              <p className="font-serif text-2xl text-[var(--color-royal)]/50 mb-2 font-light">No pieces found</p>
              <p className="font-sans text-sm text-gray-400 mb-8">Try adjusting your filters or browse all collections</p>
              <button onClick={clearAllFilters}
                className="px-8 py-3.5 bg-[var(--color-royal)] text-white font-serif font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-royal)]/90 transition-colors shadow-md">
                View All Jewellery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
              {filteredAndSortedProducts.map((product) => {
                const discountVal = product.original_price && product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : null;

                return (
                  <Link to={`/shop/${product.id}`} key={product.id}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 shadow-sm hover:shadow-2xl transition-all duration-500 relative">

                    {/* Gold top accent bar — hidden until hover */}
                    <div className="h-[2px] w-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-[#F9F5EF]">
                      {product.image_url ? (
                        <div className="w-full h-full relative">
                          {/* Primary Image */}
                          <img src={getImageUrl(product.image_url)} alt={product.name}
                            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                              product.gallery_urls && product.gallery_urls.length > 1
                                ? 'group-hover:opacity-0 group-hover:scale-105'
                                : 'group-hover:scale-110'
                            }`} loading="lazy" />
                          {/* Hover Alternate Image */}
                          {product.gallery_urls && product.gallery_urls.length > 1 && (
                            <img src={getImageUrl(product.gallery_urls[1])} alt={`${product.name} hover`}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-105 group-hover:scale-110" loading="lazy" />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={40} />
                        </div>
                      )}

                      {/* Wishlist */}
                      <div role="button" onClick={(e) => toggleWishlist(e, product.id)}
                        className={`absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md z-20 cursor-pointer ${wishlist.has(product.id)
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white/90 backdrop-blur text-gray-400 hover:text-red-500 hover:scale-105'
                          }`}>
                        <Heart size={13} fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[var(--color-royal)]/5 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur px-4 py-2.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 text-[var(--color-royal)] flex items-center gap-2">
                          <Eye size={14} />
                          <span className="font-serif text-xs font-bold tracking-wide">Quick View</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 sm:px-5 pt-4 pb-5 flex flex-col justify-start text-left bg-white flex-1">
                      {/* Price & Original Price side-by-side */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="font-sans text-xs sm:text-sm text-slate-400/80 line-through font-medium">
                            ₹{product.original_price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Red Discount tag below prices */}
                      {discountVal && (
                        <p className="text-[11px] font-bold text-red-500 mt-0.5">
                          {discountVal}% Off
                        </p>
                      )}

                      {/* Product Name — uppercase, tracked, muted */}
                      <p className="font-sans text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-widest mt-2 block truncate font-medium group-hover:text-[var(--color-royal)] transition-colors duration-300">
                        {product.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
