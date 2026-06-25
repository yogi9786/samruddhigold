import React from 'react';

const categories = [
  {
    id: 1,
    title: 'WOMEN',
    subtitle: 'Elegance Redefined',
    image: '/images/slider/south_indian_jewelry_3.png',
  },
  {
    id: 2,
    title: 'MEN',
    subtitle: 'Classic & Bold',
    image: '/images/gallery/chunky_gold_chain.png', // Chunky chain represents men's jewelry well
  },
  {
    id: 3,
    title: 'KIDS',
    subtitle: 'Joyful Beginnings',
    image: '/images/gallery/indian_gold_bangle.png', // Small bangles represent kids
  }
];

const GenderCategories: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-16 lg:mb-24 mt-4 md:mt-8">
      <div className="text-center mb-8 md:mb-12">
        <p className="font-sans text-[#801416] mb-3 uppercase tracking-[0.2em] text-[11px] md:text-[12px] font-bold">
          Discover
        </p>
        <h2 className="font-serif text-[32px] md:text-[42px] text-[#5F1517] mb-5 leading-tight font-bold">
          Shop by Category
        </h2>
        <div className="w-16 h-[2px] bg-[#801416]/20 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="relative group rounded-[2rem] overflow-hidden aspect-[4/5] shadow-sm border border-[#5F1517]/10 cursor-pointer">
            <img 
              src={cat.image} 
              alt={cat.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#110A08]/90 via-[#110A08]/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-90" />
            
            {/* Text Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center text-center transform transition-transform duration-500 group-hover:-translate-y-2">
              <span className="text-[#F8D76B]/90 font-sans text-[11px] md:text-[12px] tracking-[0.25em] uppercase font-bold mb-2 drop-shadow-sm">
                {cat.subtitle}
              </span>
              <h3 className="text-white font-serif text-[32px] md:text-[36px] font-bold tracking-wide drop-shadow-md">
                {cat.title}
              </h3>
              
              {/* Animated underline */}
              <div className="w-0 h-[2px] bg-[#F8D76B] mt-4 transition-all duration-500 ease-out group-hover:w-16 shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderCategories;
