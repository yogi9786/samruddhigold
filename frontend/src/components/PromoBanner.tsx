import React from 'react';
import { Link } from 'react-router-dom';

// Assets
import featuredRing   from '../assets/gen/featured_bridal_ring.png';
import imgNecklace    from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import imgRing        from '../assets/gen/cat_rings_1782214860176.png';
import imgBangle      from '../assets/gen/cat_bangles_1782214893370.png';
import imgEarring     from '../assets/gen/cat_earrings_1782214875918.png';
import imgPendant     from '../assets/gen/cat_pendants_1782214847919.png';
import imgMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';

const WHATSAPP = "919900000000";

const cards = [
  { id: 1, name: "Necklace Set",   category: "Gold",    image: imgNecklace,    badge: "Bestseller" },
  { id: 2, name: "Signet Ring",    category: "Diamond", image: imgRing,        badge: "New Arrival" },
  { id: 3, name: "Kada Bangle",    category: "Gold",    image: imgBangle,      badge: "Exclusive" },
  { id: 4, name: "Jhumka Earring", category: "Heritage",image: imgEarring,     badge: "" },
  { id: 5, name: "Gold Pendant",   category: "Gold",    image: imgPendant,     badge: "Limited" },
  { id: 6, name: "Mangalsutra",    category: "Bridal",  image: imgMangalsutra, badge: "Trending" },
];

const badgeColor: Record<string, string> = {
  Bestseller:  "bg-[#D4AF37] text-white",
  "New Arrival":"bg-[#5F1517] text-white",
  Exclusive:   "bg-[#801416] text-white",
  Limited:     "bg-[#5F1517]/80 text-white",
  Trending:    "bg-[#D4AF37]/80 text-white",
};

const PromoBanner: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-10 lg:mb-20">

      {/* ── Section label ── */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="block w-10 md:w-16 h-[1px] bg-[#D4AF37]" />
        <span className="font-sans text-[10px] md:text-[11px] text-[#D4AF37] tracking-[4px] uppercase font-semibold">
          Our Collection
        </span>
        <span className="block w-10 md:w-16 h-[1px] bg-[#D4AF37]" />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-5">

        {/* ── LEFT: Feature Card ── */}
        <a
          href={`https://wa.me/${WHATSAPP}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20your%20featured%20bridal%20jewellery%20collection.`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden cursor-pointer no-underline block"
          style={{
            background: 'linear-gradient(160deg, #3d0c0e 0%, #1a0a09 100%)',
            borderRadius: 0,
            minHeight: '360px',
          }}
        >
          {/* Gold corner accents */}
          <span className="absolute top-0 left-0 w-10 h-10 border-t border-l border-[#D4AF37]/40 pointer-events-none z-10" />
          <span className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-[#D4AF37]/40 pointer-events-none z-10" />

          {/* Product image fills the card */}
          <div className="absolute inset-0">
            <img
              src={featuredRing}
              alt="Featured Bridal Ring"
              className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            {/* Gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a09]/90 via-[#1a0a09]/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-6" style={{ minHeight: '360px' }}>
            {/* Top badge */}
            <div className="self-start">
              <span className="bg-[#D4AF37] text-[#1a0a09] text-[9px] font-bold uppercase tracking-[2.5px] px-3 py-1.5">
                Feature Collection
              </span>
            </div>

            {/* Bottom text */}
            <div>
              <p className="font-sans text-[#D4AF37]/70 text-[10px] tracking-[3px] uppercase mb-2">Bridal · Gold</p>
              <h3 className="font-serif text-white text-[22px] md:text-[26px] leading-tight mb-4">
                Royal Bridal<br />
                <span className="italic text-[#D4AF37]">Jewellery Set</span>
              </h3>
              <div className="inline-flex items-center gap-2 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] tracking-[2px] uppercase font-semibold px-4 py-2 group-hover:bg-[#D4AF37] group-hover:text-[#1a0a09] transition-colors duration-300">
                <span>Enquire Now</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </a>

        {/* ── RIGHT: 3×2 Product Card Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {cards.map((card) => (
            <a
              key={card.id}
              href={`https://wa.me/${WHATSAPP}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20the%20${encodeURIComponent(card.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden cursor-pointer no-underline block bg-[#FFF9F2] border border-[#D4AF37]/20 hover:border-[#5F1517]/40 hover:shadow-[0_6px_30px_rgba(95,21,23,0.12)] transition-all duration-400"
              style={{ borderRadius: 0 }}
            >
              {/* Image */}
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-700 ease-out"
                  style={{ transition: 'transform 700ms ease-out' }}
                />
              </div>

              {/* Badge */}
              {card.badge && (
                <span className={`absolute top-2 right-2 text-[8px] md:text-[9px] font-bold uppercase tracking-[1.5px] px-2 py-1 ${badgeColor[card.badge] ?? 'bg-[#5F1517] text-white'}`}>
                  {card.badge}
                </span>
              )}

              {/* Hover overlay with enquire */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a09]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-end justify-center pb-4">
                <span className="font-sans text-white text-[9px] tracking-[2px] uppercase font-semibold border-b border-white/50 pb-0.5">
                  Enquire →
                </span>
              </div>

              {/* Label */}
              <div className="p-2.5 md:p-3 border-t border-[#D4AF37]/15">
                <p className="font-sans text-[8px] md:text-[9px] text-[#D4AF37] tracking-[2px] uppercase mb-0.5">{card.category}</p>
                <h4 className="font-serif text-[#5F1517] text-[12px] md:text-[13px] leading-snug group-hover:text-[#801416] transition-colors">
                  {card.name}
                </h4>
              </div>
            </a>
          ))}
        </div>

      </div>

      {/* ── CTA ── */}
      <div className="flex justify-center mt-8 md:mt-10">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-3 bg-[#5F1517] text-white px-10 md:px-14 py-3.5 font-sans font-semibold text-[11px] md:text-[12px] tracking-[2.5px] uppercase no-underline hover:bg-[#801416] hover:shadow-[0_6px_30px_rgba(95,21,23,0.4)] transition-all duration-300 overflow-hidden relative"
          style={{ borderRadius: 0 }}
        >
          <span className="relative z-10">View Full Collection</span>
          <svg className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {/* Shimmer */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
        </Link>
      </div>

    </div>
  );
};

export default PromoBanner;
