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
    <div className="min-h-screen flex flex-col bg-[#FFF7F2]">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 pt-32">
        <h1 className="text-4xl font-serif text-[#5F1517] mb-8 text-center font-bold">Shop Our Collection</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F1517]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[#5F1517]/70">
            <p className="text-xl">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link to={`/shop/${product.id}`} key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#5F1517]/10 flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-[#FFF7F2] p-4 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  {product.discount_text && (
                    <div className="absolute top-4 left-4 bg-[#801416] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {product.discount_text}
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-[#5F1517] font-semibold text-lg line-clamp-2 mb-2 group-hover:text-[#801416] transition-colors">{product.name}</h3>
                  <div className="mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[#801416] font-bold text-xl">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.original_price && (
                        <span className="text-gray-400 line-through text-sm font-medium">₹{product.original_price.toLocaleString('en-IN')}</span>
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
