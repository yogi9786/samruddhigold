import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewArrivalsHero from '../components/NewArrivalsHero';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import api, { getImageUrl } from '../api';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  discount_text?: string;
  image_url?: string;
  status?: string;
}

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await api.get('/products');
        const activeProds = response.data.filter((p: Product) => !p.status || p.status === 'active');
        const sorted = [...activeProds].reverse();
        setProducts(sorted);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FAFAFA] overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <NewArrivalsHero products={products} />

      {/* Product Grid Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-[#5F1517] mb-4">Latest Additions</h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our newest masterpieces, fresh from the atelier.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.slice(0, 8).map((product) => (
            <Link to={`/shop/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-[#E5D3B3]/50 hover:border-[#5F1517] relative">
              <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={getImageUrl(product.image_url)} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-serif">No Image</div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>

                {product.discount_text && (
                  <div className="absolute top-3 right-3 bg-[#5F1517] text-white text-[10px] font-semibold px-3 py-1 rounded-sm tracking-wider uppercase">
                    {product.discount_text}
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                  <div className="bg-white/90 backdrop-blur text-[#5F1517] py-2 text-center text-sm font-semibold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-colors">
                    View Details
                  </div>
                </div>
              </div>
              
              <div className="p-3 md:p-5 flex flex-col flex-grow text-center relative z-10 bg-white">
                <p className="text-gray-400 text-[10px] md:text-xs tracking-widest uppercase mb-1">{product.sku}</p>
                <h3 className="font-serif text-[#5F1517] text-sm md:text-lg mb-2 md:mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <div className="mt-auto">
                  <div className="flex items-center justify-center gap-1.5 md:gap-2">
                    <span className="text-[#5F1517] font-medium text-sm md:text-base">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.original_price && (
                      <span className="text-gray-400 line-through text-[11px] md:text-xs">₹{product.original_price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default NewArrivals;
