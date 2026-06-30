import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  discount_text?: string;
  image_url?: string;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-16 pt-36">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-[var(--color-royal)] mb-4 tracking-wide font-light">
            Our Exclusive Collection
          </h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full mb-6"></div>
          <p className="text-[var(--color-text-dark)]/70 max-w-2xl mx-auto font-light text-lg">
            Discover timeless elegance and masterful craftsmanship in every piece.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-royal)]/70">
            <p className="text-xl font-serif">No masterpieces available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product) => (
              <Link to={`/shop/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[var(--color-soft-gold)]/30 hover:border-[var(--color-primary)] relative">
                
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
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
                <div className="p-6 flex flex-col flex-grow text-center relative z-10 bg-white">
                  <p className="text-[var(--color-text-dark)]/50 text-xs tracking-widest uppercase mb-2">{product.sku}</p>
                  <h3 className="font-serif text-[var(--color-luxury)] text-xl mb-4 group-hover:text-[var(--color-royal)] transition-colors line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <div className="mt-auto">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[var(--color-luxury)] font-medium text-lg">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.original_price && (
                        <span className="text-[var(--color-text-dark)]/40 line-through text-sm">₹{product.original_price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
