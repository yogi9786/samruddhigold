import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WHATSAPP = "919035085397";


// Mobile shows first 4 (grid-cols-4), desktop shows all 9 (grid-cols-9 condensed into 3 rows of 3? No - we want scroll)
// Mobile: 4 cols visible in a horizontal scroll, Desktop: 9 items in 3×3-ish
import catMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';

const categories = [
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

// WhatsApp SVG icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const CollectionShowcase = () => {
  return (
    <section className="w-[calc(100%-2rem)] max-w-7xl mx-auto bg-[#110A08] rounded-[2rem] md:rounded-[3rem] px-5 py-10 lg:py-14 lg:px-10 flex flex-col mt-8 mb-8 shadow-2xl">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="font-sans text-[#D4AF37]/60 text-[10px] tracking-[4px] uppercase mb-2">Explore</p>
          <h2 className="font-serif text-[28px] md:text-[42px] text-white leading-tight tracking-wide">
            Choose The Type!
          </h2>
          <p className="font-sans text-[12px] md:text-[14px] text-white/50 mt-2 max-w-md leading-relaxed font-light">
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

      {/* Mobile: horizontal scroll, 4 per "page" */}
      <div className="lg:hidden overflow-x-auto pb-2 -mx-1">
        <div className="flex gap-3 px-1 w-max">
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
      </div>

      {/* Desktop: 9 columns grid */}
      <div className="hidden lg:grid grid-cols-9 gap-4">
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
