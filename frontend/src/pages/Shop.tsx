import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Filter, X, ChevronDown } from 'lucide-react';

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
}

interface Category {
  id: string;
  name: string;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
    // Only show active products
    let result = products.filter(p => !p.status || p.status === 'active');

    // Category Filter
    if (selectedCategoryId !== 'all') {
      result = result.filter(p => p.category_id === selectedCategoryId);
    }

    // Price Filter
    if (minPrice !== '') {
      result = result.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming newest are added at the end (or you can use created_at if available)
        result.reverse();
        break;
      default:
        // 'featured' - leave as is or apply specific logic
        break;
    }

    return result;
  }, [products, selectedCategoryId, minPrice, maxPrice, sortBy]);

  const toggleMobileFilter = () => setIsMobileFilterOpen(!isMobileFilterOpen);

  const FilterSidebar = () => (
    <div className="flex flex-col space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-serif text-[var(--color-royal)] mb-4 border-b border-[var(--color-primary)]/20 pb-2">Categories</h3>
        <ul className="space-y-3">
          <li>
            <button 
              onClick={() => setSelectedCategoryId('all')}
              className={`text-left w-full transition-colors ${selectedCategoryId === 'all' ? 'text-[var(--color-primary)] font-semibold' : 'text-gray-600 hover:text-[var(--color-primary)]'}`}
            >
              All Categories
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button 
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`text-left w-full transition-colors ${selectedCategoryId === cat.id ? 'text-[var(--color-primary)] font-semibold' : 'text-gray-600 hover:text-[var(--color-primary)]'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-serif text-[var(--color-royal)] mb-4 border-b border-[var(--color-primary)]/20 pb-2">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="Min (₹)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
            className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Max (₹)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
            className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
      <Header />
      
      {/* Mobile Filter Drawer */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden ${isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 left-0 w-80 bg-white p-6 shadow-xl transform transition-transform duration-300 overflow-y-auto ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif text-[var(--color-royal)]">Filters</h2>
            <button onClick={toggleMobileFilter} className="text-gray-500 hover:text-black">
              <X size={24} />
            </button>
          </div>
          <FilterSidebar />
          <div className="mt-8 pt-4 border-t">
            <button 
              onClick={toggleMobileFilter}
              className="w-full bg-[var(--color-royal)] text-white py-3 uppercase tracking-widest text-sm hover:bg-[var(--color-primary)] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-16 pt-36">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-royal)] mb-4 tracking-wide font-light">
            Our Exclusive Collection
          </h1>
          <div className="w-16 md:w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full mb-6"></div>
          <p className="text-[var(--color-text-dark)]/70 max-w-2xl mx-auto font-light text-base md:text-lg">
            Discover timeless elegance and masterful craftsmanship in every piece.
          </p>
        </div>
        
        {/* Top Bar: Mobile Filter Toggle & Desktop Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <button 
            onClick={toggleMobileFilter}
            className="lg:hidden flex items-center space-x-2 border border-gray-300 px-4 py-2 text-sm uppercase tracking-wider mb-4 md:mb-0 w-full md:w-auto justify-center"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>

          <div className="flex items-center space-x-2 text-sm w-full md:w-auto justify-end">
            <span className="text-gray-500 uppercase tracking-widest hidden md:inline">Sort by:</span>
            <div className="relative w-full md:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto appearance-none border border-gray-300 py-2 pl-4 pr-10 bg-transparent focus:outline-none focus:border-[var(--color-primary)] cursor-pointer uppercase tracking-wider text-xs"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar />
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 shadow-sm">
                <p className="text-xl font-serif text-[var(--color-royal)]/70 mb-4">No pieces match your selection.</p>
                <button 
                  onClick={() => { setSelectedCategoryId('all'); setMinPrice(''); setMaxPrice(''); }}
                  className="text-[var(--color-primary)] underline hover:text-[var(--color-royal)]"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-8">
                {filteredAndSortedProducts.map((product) => (
                  <Link to={`/shop/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[var(--color-soft-gold)]/30 hover:border-[var(--color-primary)] relative">
                    
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={getImageUrl(product.image_url)} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-serif">Awaiting Imagery</div>
                      )}
                      
                      {/* Subtle overlay gradient on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>

                      {product.discount_text && (
                        <div className="absolute top-4 right-4 bg-[var(--color-royal)] text-white text-xs font-semibold px-4 py-1.5 rounded-sm shadow-md tracking-wider uppercase">
                          {product.discount_text}
                        </div>
                      )}
                      
                      {/* Hover "View Details" button overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                        <div className="bg-white/90 backdrop-blur text-[var(--color-luxury)] py-3 text-center text-sm font-semibold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors">
                          View Details
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-3 md:p-6 flex flex-col flex-grow text-center relative z-10 bg-white">
                      <p className="text-[var(--color-text-dark)]/50 text-[10px] md:text-xs tracking-widest uppercase mb-1 md:mb-2">{product.sku}</p>
                      <h3 className="font-serif text-[var(--color-luxury)] text-sm md:text-lg mb-2 md:mb-4 group-hover:text-[var(--color-royal)] transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        <div className="flex items-center justify-center gap-2 md:gap-3">
                          <span className="text-[var(--color-luxury)] font-medium text-sm md:text-lg">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.original_price && (
                            <span className="text-[var(--color-text-dark)]/40 line-through text-[11px] md:text-sm">₹{product.original_price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
