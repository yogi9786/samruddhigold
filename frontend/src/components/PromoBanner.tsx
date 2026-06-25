import React, { useRef } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Antique Gold Earring',
    price: '₹ 28,500',
    image: '/images/gallery/gold_earring_close.png'
  },
  {
    id: 2,
    name: 'Diamond Solitaire Ring',
    price: '₹ 85,000',
    image: '/images/gallery/diamond_ring_close.png'
  },
  {
    id: 3,
    name: 'Kasu Mala Necklace',
    price: '₹ 1,12,000',
    image: '/images/gallery/gold_necklace_close.png'
  },
  {
    id: 4,
    name: 'Traditional Jhumka',
    price: '₹ 45,000',
    image: '/images/gallery/traditional_jhumka.png'
  },
  {
    id: 5,
    name: 'Polki Bridal Choker',
    price: '₹ 2,40,000',
    image: '/images/gallery/indian_polki_necklace.png'
  },
  {
    id: 6,
    name: 'Temple Gold Bangle',
    price: '₹ 95,000',
    image: '/images/gallery/indian_gold_bangle.png'
  }
];

const PromoBanner: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-10 lg:mb-16">
      <div className="bg-[#FFF7F2] rounded-[2rem] p-6 md:p-10 flex flex-col xl:flex-row items-center gap-8 lg:gap-12 shadow-sm border border-[#801416]/5 relative">
        
        {/* Left Text */}
        <div className="xl:w-1/3 w-full text-left flex flex-col items-start relative z-10">
          <h2 className="font-serif text-[32px] md:text-[40px] text-[#5F1517] mb-4 leading-tight font-bold">
            Our Collection
          </h2>
          <p className="font-sans text-[13px] md:text-[14px] text-[#5F1517]/80 mb-8 leading-relaxed max-w-md font-medium">
            Explore our exclusive collection of handcrafted gold and diamond jewelry, meticulously designed to add timeless elegance and sophistication to your everyday style.
          </p>
          <div className="flex items-center gap-4">
            <button className="px-8 py-2.5 rounded-full border border-[#801416]/30 text-[13px] text-[#5F1517] hover:bg-[#801416] hover:text-white hover:border-[#801416] transition-all duration-300 font-sans font-semibold tracking-wide shadow-sm">
              See More
            </button>
            
            {/* Desktop Navigation Buttons */}
            <div className="hidden xl:flex gap-2 ml-4">
              <button onClick={scrollLeft} className="w-10 h-10 rounded-full border border-[#801416]/20 flex items-center justify-center text-[#5F1517] hover:bg-[#801416] hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={scrollRight} className="w-10 h-10 rounded-full border border-[#801416]/20 flex items-center justify-center text-[#5F1517] hover:bg-[#801416] hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Cards Slider Container */}
        <div className="xl:w-2/3 w-full relative">
          
          {/* Mobile/Tablet Navigation Buttons - Positioned Absolute Over Slider */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 xl:hidden">
            <button onClick={scrollLeft} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-[#5F1517] hover:bg-[#801416] hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 xl:hidden">
            <button onClick={scrollRight} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-[#5F1517] hover:bg-[#801416] hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div 
            ref={scrollContainerRef}
            className="w-full flex flex-row gap-4 md:gap-6 overflow-hidden pb-4 items-stretch px-2"
          >
            {products.map((product) => (
              <div key={product.id} className="w-[180px] md:w-[220px] flex-shrink-0 flex flex-col items-center group">
                <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 shadow-sm border border-[#5F1517]/10">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <button className="absolute top-3 right-3 bg-white/95 p-2 rounded-full text-[#801416] shadow-md hover:scale-110 transition-transform z-10">
                    <ShoppingBag size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <h3 className="font-serif text-[16px] md:text-[18px] text-[#5F1517] font-bold text-center line-clamp-1">{product.name}</h3>
                <span className="bg-white px-5 py-1.5 rounded-full text-[12px] font-sans text-[#5F1517] mt-2 font-semibold tracking-wide shadow-sm border border-[#5F1517]/5">{product.price}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PromoBanner;
