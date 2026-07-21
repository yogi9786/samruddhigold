import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Video } from 'lucide-react';

interface SareeCollectionShowcaseProps {
  categorySlug?: string;
}

const SareeCollectionShowcase: React.FC<SareeCollectionShowcaseProps> = ({ categorySlug = 'Saree' }) => {
  const shopUrl = `/shop?category=${encodeURIComponent(categorySlug)}`;
  const virtualShoppingUrl = `/virtual-shopping?category=${encodeURIComponent(categorySlug)}`;

  return (
    <section className="w-[calc(100%-2rem)] max-w-7xl mx-auto bg-[#110A08] rounded-[2rem] md:rounded-[3rem] px-5 py-8 md:py-12 lg:px-10 flex flex-col mt-6 mb-8 shadow-2xl border border-[#D4AF37]/20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p className="font-sans text-[#D4AF37]/60 text-[9px] md:text-[10px] tracking-[3px] md:tracking-[4px] uppercase mb-1 md:mb-2 font-semibold">
            Silk Collection
          </p>
          <h2 className="font-serif text-[22px] md:text-[36px] lg:text-[42px] text-white leading-tight tracking-wide" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Sirisamruddhi Sarees
          </h2>
          <p className="font-sans text-[11px] md:text-[14px] text-white/50 mt-1 md:mt-2 max-w-lg leading-relaxed font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Handcrafted Sirisamruddhi Silks &amp; Bridal Collection paired seamlessly with your fine jewellery.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <Link
            to={shopUrl}
            className="inline-flex items-center gap-2 bg-[#5F1517] text-[#D4AF37] font-sans font-bold text-[11px] md:text-[12px] tracking-[1.5px] uppercase px-5 py-2.5 rounded-full no-underline hover:bg-[#801416] transition-all duration-300 shadow-md border border-[#D4AF37]/30"
          >
            <ShoppingBag size={14} />
            Explore Sarees
          </Link>

          <Link
            to={virtualShoppingUrl}
            className="inline-flex items-center gap-2 bg-transparent text-white/80 border border-white/20 font-sans font-bold text-[11px] md:text-[12px] tracking-[1.5px] uppercase px-4 py-2.5 rounded-full no-underline hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
          >
            <Video size={14} />
            Live Shopping
          </Link>
        </div>
      </div>

      {/* 2 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Card 1: Sirisamruddhi Pure Silks */}
        <Link
          to={shopUrl}
          className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-[#D4AF37]/20 bg-[#1A110E] aspect-[16/9] flex flex-col justify-end p-5 md:p-8 no-underline shadow-lg"
        >
          <img
            src="/images/saree_banner.png"
            alt="Sirisamruddhi Pure Silk Sarees"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#110A08] via-[#110A08]/40 to-transparent" />
          
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <span className="text-[9px] md:text-[10px] text-[#D4AF37] uppercase tracking-[2.5px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Pure Silk Mark
              </span>
              <h3 className="text-lg md:text-2xl font-serif text-white font-bold tracking-tight mt-0.5" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Sirisamruddhi Pure Silks
              </h3>
            </div>
            
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#D4AF37] text-[#110A08] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
              <ArrowRight size={16} strokeWidth={2.5} />
            </div>
          </div>
        </Link>

        {/* Card 2: Sirisamruddhi Bridal Silks */}
        <Link
          to={shopUrl}
          className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-[#D4AF37]/20 bg-[#1A110E] aspect-[16/9] flex flex-col justify-end p-5 md:p-8 no-underline shadow-lg"
        >
          <img
            src="/images/saree_bridal.png"
            alt="Sirisamruddhi Royal Bridal Sarees"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#110A08] via-[#110A08]/40 to-transparent" />
          
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <span className="text-[9px] md:text-[10px] text-[#D4AF37] uppercase tracking-[2.5px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Bridal Special
              </span>
              <h3 className="text-lg md:text-2xl font-serif text-white font-bold tracking-tight mt-0.5" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Sirisamruddhi Bridal Silks
              </h3>
            </div>
            
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#D4AF37] text-[#110A08] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
              <ArrowRight size={16} strokeWidth={2.5} />
            </div>
          </div>
        </Link>

      </div>

    </section>
  );
};

export default SareeCollectionShowcase;
