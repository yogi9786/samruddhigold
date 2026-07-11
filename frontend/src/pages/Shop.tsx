import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl, getWishlist, addToWishlist, removeFromWishlist } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, Heart, SlidersHorizontal, Sparkles, Star, Truck, Tag, Eye, Search } from 'lucide-react';

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

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-[var(--color-royal)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-royal)] font-semibold">{selectedCategoryName}</span>
        </nav>

        {/* ─── Header: Centered All Jewellery Title ─── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif text-[var(--color-royal)] tracking-wide font-light">
            {selectedCategoryName}
          </h1>
          <div className="w-12 h-0.5 bg-[var(--color-primary)] mx-auto mt-3"></div>
        </div>

        {/* ─── Category Carousel (Squares with rounded-2xl) ─── */}
        <div className="relative mb-12 flex items-center justify-center px-8 sm:px-12 group/carousel">
          <button onClick={() => scrollCarousel('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#FFF5F5] hover:bg-[var(--color-royal)] hover:text-white rounded-full flex items-center justify-center border border-[#5F1517]/10 text-[var(--color-royal)] shadow transition-all duration-300">
            <ChevronLeft size={20} />
          </button>

          <div ref={carouselRef} className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-2 px-1 max-w-full">
            {/* All Category Option */}
            <button onClick={() => setSelectedCategoryId('all')}
              className="flex-shrink-0 flex flex-col items-center group transition-all duration-300">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow border transition-all duration-300 flex items-center justify-center ${selectedCategoryId === 'all'
                  ? 'border-[var(--color-royal)] ring-2 ring-[var(--color-primary)]/30 scale-105'
                  : 'border-gray-200 group-hover:border-[var(--color-primary)]'
                }`}>
                <img src={imgGoldSet} alt="" className="w-full h-full object-cover" />
              </div>
              <span className={`text-[11px] sm:text-xs font-serif mt-2 font-medium tracking-wide transition-colors ${selectedCategoryId === 'all' ? 'text-[var(--color-royal)] font-bold' : 'text-gray-600 group-hover:text-[var(--color-royal)]'}`}>
                All Jewellery
              </span>
            </button>

            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
                className="flex-shrink-0 flex flex-col items-center group transition-all duration-300">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow border transition-all duration-300 ${selectedCategoryId === cat.id
                    ? 'border-[var(--color-royal)] ring-2 ring-[var(--color-primary)]/30 scale-105'
                    : 'border-gray-200 group-hover:border-[var(--color-primary)]'
                  }`}>
                  <img src={cat.image_url ? getImageUrl(cat.image_url) : getCategoryFallbackImage(cat.name)} alt="" className="w-full h-full object-cover" />
                </div>
                <span className={`text-[11px] sm:text-xs font-serif mt-2 font-medium tracking-wide transition-colors whitespace-nowrap ${selectedCategoryId === cat.id ? 'text-[var(--color-royal)] font-bold' : 'text-gray-600 group-hover:text-[var(--color-royal)]'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          <button onClick={() => scrollCarousel('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#FFF5F5] hover:bg-[var(--color-royal)] hover:text-white rounded-full flex items-center justify-center border border-[#5F1517]/10 text-[var(--color-royal)] shadow transition-all duration-300">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ─── Toolbar: Filters Button + Item Count + Sort Dropdown ─── */}
        <div className="flex flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200/60">
          <div className="flex items-center">
            {/* Filters Button */}
            <button onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-2 border font-semibold text-xs sm:text-sm tracking-wider px-5 py-2.5 rounded-lg transition-all duration-300 ${isFiltersOpen
                  ? 'bg-[var(--color-royal)] text-white border-[var(--color-royal)]'
                  : 'bg-[#FFF5F5] hover:bg-[#FFE0E0] border border-[#5F1517]/15 text-[#5F1517]'
                }`}>
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-[var(--color-primary)] text-[var(--color-royal)] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Items Count */}
            <span className="text-gray-500 font-semibold text-[11px] sm:text-xs uppercase tracking-[0.15em] ml-4">
              {filteredAndSortedProducts.length} ITEMS
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Selector */}
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#FFF5F5] hover:bg-[#FFE0E0] border border-[#5F1517]/15 rounded-lg py-2.5 pl-4 pr-10 text-xs sm:text-sm font-semibold text-[#5F1517] focus:outline-none cursor-pointer transition-all">
                <option value="newest">Sort: New Drop</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
              <span className="absolute right-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F1517] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Collapsible Filters Panel (Sits above products, fully responsive) ─── */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFiltersOpen ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'
          }`}>
          <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-royal)] uppercase tracking-wider mb-2">Search Collection</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by name, SKU..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[var(--color-primary)]" />
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-royal)] uppercase tracking-wider mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="₹ Min" value={minPrice}
                  onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[var(--color-primary)]" />
                <span className="text-gray-300">—</span>
                <input type="number" placeholder="₹ Max" value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[var(--color-primary)]" />
              </div>
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button onClick={clearAllFilters}
                className="w-full py-2.5 border border-[#5F1517]/30 hover:border-[var(--color-royal)] text-[#5F1517] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#FFF5F5] transition-all">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* ─── Active Tag Filter Pills (Premium Blue, Pink, Gold Pills) ─── */}
        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 mb-8">
          <button onClick={() => setActiveTagFilter(activeTagFilter === 'new_drop' ? null : 'new_drop')}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeTagFilter === 'new_drop'
                ? 'bg-[#3B72F1] text-white shadow-md'
                : 'bg-[#DCE7FC] text-[#3B72F1] hover:bg-[#DCE7FC]/80 border border-[#3B72F1]/10'
              }`}>
            <Sparkles size={12} />
            New Drop
          </button>

          <button onClick={() => setActiveTagFilter(activeTagFilter === 'bestseller' ? null : 'bestseller')}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeTagFilter === 'bestseller'
                ? 'bg-[#E03A3E] text-white shadow-md'
                : 'bg-[#FFEBEB] text-[#E03A3E] hover:bg-[#FFEBEB]/80 border border-[#E03A3E]/10'
              }`}>
            <Star size={12} fill="currentColor" />
            Bestseller
          </button>

          <button onClick={() => setActiveTagFilter(activeTagFilter === 'quick_delivery' ? null : 'quick_delivery')}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeTagFilter === 'quick_delivery'
                ? 'bg-[#D19B00] text-white shadow-md'
                : 'bg-[#FFF5D6] text-[#D19B00] hover:bg-[#FFF5D6]/80 border border-[#D19B00]/10'
              }`}>
            <Truck size={12} />
            Quick Delivery
          </button>
        </div>

        {/* ─── Product Grid (1:1 aspect-square cards spanning full width) ─── */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-80">
              <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">Loading collection…</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-6xl mb-6 opacity-40">💍</div>
              <p className="text-xl font-serif text-[var(--color-royal)]/60 mb-3">No pieces match your selection</p>
              <button onClick={clearAllFilters}
                className="px-6 py-3 bg-[var(--color-royal)] text-white text-sm font-semibold uppercase tracking-wider rounded-xl hover:bg-[var(--color-royal)]/90 transition-colors shadow-md">
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredAndSortedProducts.map((product) => {
                const discountVal = product.original_price && product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : null;

                return (
                  <Link to={`/shop/${product.id}`} key={product.id}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[var(--color-primary)]/40 shadow-sm hover:shadow-xl transition-all duration-500 relative">

                    {/* Image Container (1:1 aspect-square) */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {product.image_url ? (
                        <img src={getImageUrl(product.image_url)} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={40} />
                        </div>
                      )}

                      {/* Sparkle rating button on top-left */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-yellow-500 hover:text-yellow-600 transition-all shadow-md flex items-center justify-center">
                          <Star size={14} fill="currentColor" />
                        </button>
                        {discountVal && (
                          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-red-500 hover:text-red-600 transition-all shadow-md flex items-center justify-center">
                            <Tag size={14} />
                          </button>
                        )}
                      </div>

                      {/* Wishlist button on top-right */}
                      <div role="button" onClick={(e) => toggleWishlist(e, product.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md z-20 cursor-pointer ${wishlist.has(product.id)
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white/90 backdrop-blur text-gray-400 hover:text-red-500 hover:scale-105'
                          }`}>
                        <Heart size={14} fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
                      </div>

                      {/* Eye Icon Hover effect */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur p-3 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300 text-[var(--color-royal)]">
                          <Eye size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-5 flex flex-col justify-start text-left bg-white">
                      {/* Price Section */}
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-gray-800">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">
                            ₹{product.original_price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Discount Text */}
                      {discountVal ? (
                        <span className="text-xs text-red-500 font-bold mt-1">
                          {discountVal}% Off
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium mt-1">
                          {product.basic_info?.metal_purity || '22K Gold'}
                        </span>
                      )}

                      {/* Subtle, elegant title label */}
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 block truncate font-medium">
                        {product.name}
                      </span>
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
