import React, { useEffect, useState } from 'react';
import NewArrivalsHero from '../components/NewArrivalsHero';
import api from '../api';

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
    <div className="h-screen w-full overflow-hidden bg-black m-0 p-0 fixed inset-0 z-50">
      <NewArrivalsHero products={products} />
    </div>
  );
};

export default NewArrivals;
