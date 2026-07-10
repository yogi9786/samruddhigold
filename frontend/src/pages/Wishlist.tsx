import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist, addToCart, getImageUrl } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import api from '../api';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  original_price?: number;
}

const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndWishlist = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        const wishlistRes = await getWishlist();
        setWishlist(wishlistRes.data);
      } catch (err) {
        console.error('Not logged in or error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };
    if (localStorage.getItem('access_token')) {
      fetchUserAndWishlist();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item');
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, 1);
      // Optional: remove from wishlist after adding to cart
      // await handleRemove(product.id);
      alert('Added to cart!');
      // Dispatch an event to update header cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col font-outfit">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-serif text-[var(--color-royal)] mb-8 flex items-center gap-3">
          <Heart className="w-8 h-8 fill-current" /> My Wishlist
        </h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-gold)] mx-auto"></div>
          </div>
        ) : !user ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[var(--color-gold)]/20">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-medium text-gray-600 mb-4">Please log in to view your wishlist</h2>
            <Link to="/login" className="bg-[var(--color-gold)] text-white px-8 py-3 rounded-full font-medium hover:bg-yellow-600 transition-colors">
              Login
            </Link>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[var(--color-gold)]/20">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-medium text-gray-600 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love and buy them later.</p>
            <Link to="/shop" className="bg-[var(--color-royal)] text-white px-8 py-3 rounded-full font-medium hover:bg-blue-900 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group">
                <Link to={`/product/${product.id}`} className="block relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>
                
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                </Link>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.original_price && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
