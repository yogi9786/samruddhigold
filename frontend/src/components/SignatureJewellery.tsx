import React from 'react';
import ScrollReveal from './ScrollReveal';

// Import local generated premium Indian jewelry images
import goldBride from '../assets/gen/gold_bride_1782213365863.png';
import rings from '../assets/gen/cat_rings_1782214860176.png';
import earrings from '../assets/gen/cat_earrings_1782214875918.png';
import polkiSet from '../assets/gen/polki_set_1782213407545.png';
import bangles from '../assets/gen/cat_bangles_1782214893370.png';

interface SignatureItem {
  id: number;
  title: string;
  badge: string;
  image: string;
}

const SignatureJewellery: React.FC = () => {
  const items: SignatureItem[] = [
    {
      id: 1,
      title: "Royal Gold Choker Set",
      badge: "Exclusive",
      image: goldBride
    },
    {
      id: 2,
      title: "Kundan Statement Ring",
      badge: "Bestseller",
      image: rings
    },
    {
      id: 3,
      title: "Heritage Jhumka Earrings",
      badge: "Limited Edition",
      image: earrings
    },
    {
      id: 4,
      title: "Classic Polki Necklace",
      badge: "New Arrival",
      image: polkiSet
    },
    {
      id: 5,
      title: "Exquisite Gold Kada Set",
      badge: "Limited Edition",
      image: bangles
    }
  ];

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-[#5F1517] tracking-wider uppercase mb-3">
            Signature Jewellery
          </h2>
          <div className="w-24 h-[2px] bg-[#D4AF37] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 font-sans max-w-2xl mx-auto font-light text-sm md:text-base">
            Discover our curated masterpieces, hand-crafted to reflect the timeless heritage of royal Indian craftsmanship.
          </p>
        </div>
      </ScrollReveal>

      {/* Responsive Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Spans 2 rows on large screens (Gold Choker Set) */}
        <div className="lg:col-span-1 lg:row-span-2 h-full">
          <ScrollReveal delay={100} className="h-full">
            <div className="group flex flex-col h-full bg-white rounded-[20px] p-4 border border-[#D4AF37]/20 hover:border-[#5F1517] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
              {/* Image Box */}
              <div className="relative flex-grow rounded-[15px] overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[480px]">
                <img 
                  src={items[0].image} 
                  alt={items[0].title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <span className="absolute top-4 right-4 bg-[#5F1517] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                  {items[0].badge}
                </span>
              </div>
              {/* Card Label */}
              <div className="pt-4 pb-2 px-2 text-left">
                <h3 className="font-serif text-[#5F1517] font-bold text-lg md:text-xl uppercase tracking-wider group-hover:text-[#801416] transition-colors">
                  {items[0].title}
                </h3>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Middle Column: Two Stacked Cards (Ring & Jhumkas) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Top Card: Kundan Statement Ring */}
          <ScrollReveal delay={150}>
            <div className="group flex flex-col bg-white rounded-[20px] p-4 border border-[#D4AF37]/20 hover:border-[#5F1517] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
              <div className="relative rounded-[15px] overflow-hidden h-[180px] sm:h-[220px] lg:h-[180px]">
                <img 
                  src={items[1].image} 
                  alt={items[1].title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <span className="absolute top-4 right-4 bg-[#D4AF37] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                  {items[1].badge}
                </span>
              </div>
              <div className="pt-4 pb-1 px-2 text-left">
                <h3 className="font-serif text-[#5F1517] font-bold text-md md:text-lg uppercase tracking-wider group-hover:text-[#801416] transition-colors">
                  {items[1].title}
                </h3>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom Card: Heritage Jhumka Earrings */}
          <ScrollReveal delay={200}>
            <div className="group flex flex-col bg-white rounded-[20px] p-4 border border-[#D4AF37]/20 hover:border-[#5F1517] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
              <div className="relative rounded-[15px] overflow-hidden h-[180px] sm:h-[220px] lg:h-[180px]">
                <img 
                  src={items[2].image} 
                  alt={items[2].title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <span className="absolute top-4 right-4 bg-[#5F1517]/80 backdrop-blur text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                  {items[2].badge}
                </span>
              </div>
              <div className="pt-4 pb-1 px-2 text-left">
                <h3 className="font-serif text-[#5F1517] font-bold text-md md:text-lg uppercase tracking-wider group-hover:text-[#801416] transition-colors">
                  {items[2].title}
                </h3>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Two Stacked Cards (Polki Necklace & Gold Kada) */}
        <div className="flex flex-col gap-6 lg:col-span-1 md:col-span-2 lg:md:col-span-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            
            {/* Top Card: Classic Polki Necklace */}
            <ScrollReveal delay={250}>
              <div className="group flex flex-col bg-white rounded-[20px] p-4 border border-[#D4AF37]/20 hover:border-[#5F1517] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="relative rounded-[15px] overflow-hidden h-[180px] sm:h-[220px] lg:h-[180px]">
                  <img 
                    src={items[3].image} 
                    alt={items[3].title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                  <span className="absolute top-4 right-4 bg-[#5F1517] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                    {items[3].badge}
                  </span>
                </div>
                <div className="pt-4 pb-1 px-2 text-left">
                  <h3 className="font-serif text-[#5F1517] font-bold text-md md:text-lg uppercase tracking-wider group-hover:text-[#801416] transition-colors">
                    {items[3].title}
                  </h3>
                </div>
              </div>
            </ScrollReveal>

            {/* Bottom Card: Exquisite Gold Kada Set */}
            <ScrollReveal delay={300}>
              <div className="group flex flex-col bg-white rounded-[20px] p-4 border border-[#D4AF37]/20 hover:border-[#5F1517] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="relative rounded-[15px] overflow-hidden h-[180px] sm:h-[220px] lg:h-[180px]">
                  <img 
                    src={items[4].image} 
                    alt={items[4].title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                  <span className="absolute top-4 right-4 bg-[#D4AF37] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                    {items[4].badge}
                  </span>
                </div>
                <div className="pt-4 pb-1 px-2 text-left">
                  <h3 className="font-serif text-[#5F1517] font-bold text-md md:text-lg uppercase tracking-wider group-hover:text-[#801416] transition-colors">
                    {items[4].title}
                  </h3>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>

      </div>
    </section>
  );
};

export default SignatureJewellery;
