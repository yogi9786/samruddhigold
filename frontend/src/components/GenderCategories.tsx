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
    image: '/images/gallery/chunky_gold_chain.png',
  },
  {
    id: 3,
    title: 'KIDS',
    subtitle: 'Joyful Beginnings',
    image: '/images/gallery/indian_gold_bangle.png',
  }
];

const GenderCategories: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-10 lg:mb-16 mt-4 md:mt-6">
      <div className="text-center mb-6 md:mb-8">
        <p className="font-sans text-[#801416] mb-2 uppercase tracking-[0.2em] text-[10px] md:text-[11px] font-bold">
          Discover
        </p>
        <h2 className="font-serif text-[22px] md:text-[30px] lg:text-[34px] text-[#5F1517] mb-3 leading-tight font-bold">
          Shop by Category
        </h2>
        <div className="w-12 h-[2px] bg-[#801416]/20 mx-auto" />
      </div>

      {/* Desktop: 3 columns | Mobile: 2 columns (Women + Men), then Kids below */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`group relative flex flex-col items-center cursor-pointer${
              cat.id === 3 ? ' col-span-2 md:col-span-1' : ''
            }`}
          >
            {/* Arched Image Container — smaller on mobile */}
            <div className="relative w-full aspect-[3/4] md:aspect-[3/4] rounded-t-[6rem] md:rounded-t-[10rem] rounded-b-[1.5rem] md:rounded-b-[2rem] overflow-hidden shadow-md md:shadow-lg border-[4px] md:border-[6px] border-[#FFF8E7] transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-2 bg-[#FFF8E7]">
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {/* Inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#110A08]/70 via-[#110A08]/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Floating Tag inside image */}
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-max px-4 md:px-6 py-1.5 md:py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/30 transition-all duration-500 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37]">
                <span className="text-white text-[9px] md:text-[11px] tracking-[0.25em] md:tracking-[0.3em] uppercase font-bold group-hover:text-[#110A08] transition-colors">
                  {cat.subtitle}
                </span>
              </div>
            </div>

            {/* Typography Below */}
            <div className="mt-4 md:mt-6 text-center">
              <h3 className="text-[#5F1517] font-serif text-[22px] md:text-[34px] font-bold tracking-wider">
                {cat.title}
              </h3>
              <div className="w-0 h-[1.5px] bg-[#D4AF37] mx-auto mt-1.5 md:mt-2 transition-all duration-500 ease-out group-hover:w-12 md:group-hover:w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderCategories;
