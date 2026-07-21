import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mobile shows first 4 (grid-cols-4), desktop shows all 9 (grid-cols-9 condensed into 3 rows of 3? No - we want scroll)
// Mobile: 4 cols visible in a horizontal scroll, Desktop: 9 items in 3×3-ish
import catMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';

const categories = [
  { label: "Silk Saree",   img: "/images/saree_banner.png",                     wa: "Sarees",       vs: "Saree" },
  { label: "Ring",         img: "/images/gallery/gold_rings_coral.png",         wa: "Rings",        vs: "Rings" },
  { label: "Necklace",     img: "/images/gallery/chunky_gold_chain.png",        wa: "Necklaces",    vs: "Necklaces" },
  { label: "Bracelet",     img: "/images/gallery/gold_bracelet_hand.png",       wa: "Bracelets",    vs: "Others" },
  { label: "Earring",      img: "/images/slider/south_indian_jewelry_3.png",    wa: "Earrings",     vs: "Earrings" },
  { label: "Bangle",       img: "/images/gallery/indian_gold_bangle.png",       wa: "Bangles",      vs: "Bangles" },
  { label: "Pendant",      img: "/images/slider/south_indian_jewelry_2.png",    wa: "Pendants",     vs: "Pendants" },
  { label: "Mangalsutra",  img: catMangalsutra,                                 wa: "Mangalsutra",  vs: "Necklaces" },
  { label: "Kada",         img: "/images/gallery/indian_gold_bangle.png",       wa: "Kadas",        vs: "Bangles" },
  { label: "Chain",        img: "/images/gallery/chunky_gold_chain.png",        wa: "Chains",       vs: "Necklaces" },
];


const CollectionShowcase = () => {
  return (
    <section className="w-[calc(100%-2rem)] max-w-7xl mx-auto bg-[#110A08] rounded-[2rem] md:rounded-[3rem] px-5 py-10 lg:py-14 lg:px-10 flex flex-col mt-8 mb-8 shadow-2xl">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="font-sans text-[#D4AF37]/60 text-[9px] md:text-[10px] tracking-[3px] md:tracking-[4px] uppercase mb-1 md:mb-2">Explore</p>
          <h2 className="font-serif text-[20px] md:text-[32px] lg:text-[42px] text-white leading-tight tracking-wide">
            Choose The Type!
          </h2>
          <p className="font-sans text-[11px] md:text-[14px] text-white/50 mt-1.5 md:mt-2 max-w-md leading-relaxed font-light">
            Discover our exquisite range of handcrafted jewellery — each piece tells a unique story of artistry and elegance.
          </p>
        </div>

        {/* Live Video Chat CTA */}
        <Link
          to="/virtual-shopping"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-[#5F1517] text-[#D4AF37] font-sans font-bold text-[11px] md:text-[12px] tracking-[1.5px] uppercase px-4 py-2.5 rounded-full no-underline hover:bg-[#801416] transition-all duration-300 shadow-lg self-start md:self-auto border border-[#D4AF37]/30"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
          </span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Book Live Video Session
        </Link>
      </div>

      {/* Category Grid
          Mobile: 4 columns (first 8 items visible), overflow-x scroll
          Desktop: all 9 in a single row of 9 columns
      */}

      {/* Mobile + Tablet: horizontal scroll with arrow navigators */}
      <div className="lg:hidden relative pb-2">
        {/* Left Arrow */}
        <button 
          onClick={(e) => {
            const container = (e.currentTarget.parentElement as HTMLElement)?.querySelector('.scroll-container') as HTMLElement;
            if (container) container.scrollBy({ left: -160, behavior: 'smooth' });
          }}
          className="absolute left-0 top-[40%] -translate-y-1/2 z-10 bg-[#D4AF37] text-[#110A08] w-7 h-7 rounded-full flex items-center justify-center shadow-md"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Scroll Container — no scrollbar line */}
        <div className="scroll-container flex gap-3 px-8 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/virtual-shopping?category=${encodeURIComponent(cat.vs)}`}
              className="flex flex-col items-center group cursor-pointer no-underline flex-shrink-0 w-[72px]"
            >
              <div className="w-[72px] h-[96px] rounded-[2rem] bg-[#1A110E] overflow-hidden shadow-md group-hover:-translate-y-1.5 transition-transform duration-300 border border-[#D4AF37]/20 p-[3px]">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover rounded-[1.75rem] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="font-serif text-[11px] text-[#D4AF37] mt-2 mb-1.5 tracking-wide text-center leading-tight">{cat.label}</span>
              <div className="bg-[#D4AF37] text-[#110A08] w-4 h-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={10} strokeWidth={3} />
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={(e) => {
            const container = (e.currentTarget.parentElement as HTMLElement)?.querySelector('.scroll-container') as HTMLElement;
            if (container) container.scrollBy({ left: 160, behavior: 'smooth' });
          }}
          className="absolute right-0 top-[40%] -translate-y-1/2 z-10 bg-[#D4AF37] text-[#110A08] w-7 h-7 rounded-full flex items-center justify-center shadow-md"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Desktop: 10 columns grid */}
      <div className="hidden lg:grid grid-cols-5 lg:grid-cols-10 gap-3">
        {categories.map((cat, i) => (
          <Link
            key={i}
            to={`/virtual-shopping?category=${encodeURIComponent(cat.vs)}`}
            className="flex flex-col items-center group cursor-pointer no-underline"
          >
            <div className="w-full aspect-[3/4] rounded-[2.5rem] bg-[#1A110E] overflow-hidden shadow-lg group-hover:-translate-y-2 transition-transform duration-300 border border-[#D4AF37]/20 p-[4px]">
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover rounded-[2.2rem] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="font-serif text-[14px] text-[#D4AF37] mt-3 mb-2 tracking-wide text-center">{cat.label}</span>
            <div className="bg-[#D4AF37] text-[#110A08] w-5 h-5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Plus size={11} strokeWidth={3} />
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
};

export default CollectionShowcase;
