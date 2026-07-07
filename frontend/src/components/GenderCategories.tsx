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
          <div key={cat.id} className="group relative flex flex-col items-center cursor-pointer">
            {/* The Arched Image Container */}
            <div className="relative w-full aspect-[3/4] rounded-t-[10rem] rounded-b-[2rem] overflow-hidden shadow-lg border-[6px] border-[#FFF8E7] transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-2 bg-[#FFF8E7]">
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              {/* Inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#110A08]/70 via-[#110A08]/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
              
              {/* Floating Tag inside image */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-max px-6 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/30 transition-all duration-500 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37]">
                <span className="text-white text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-bold group-hover:text-[#110A08] transition-colors">
                  {cat.subtitle}
                </span>
              </div>
            </div>

            {/* Typography Below */}
            <div className="mt-6 text-center">
              <h3 className="text-[#5F1517] font-serif text-[28px] md:text-[34px] font-bold tracking-wider">
                {cat.title}
              </h3>
              <div className="w-0 h-[1.5px] bg-[#D4AF37] mx-auto mt-2 transition-all duration-500 ease-out group-hover:w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderCategories;
