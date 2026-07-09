import imgGoldBride from '../assets/gen/gold_bride_1782213365863.png';
import imgGoldSet from '../assets/gen/gold_set_1782213378462.png';
import imgSangeetBride from '../assets/gen/sangeet_bride_1782213396287.png';
import imgPolkiSet from '../assets/gen/polki_set_1782213407545.png';
import imgMehendiBride from '../assets/gen/mehendi_bride_1782213420944.png';
import imgMeenakariSet from '../assets/gen/meenakari_set_1782213433201.png';
import imgHaldiBride from '../assets/gen/haldi_bride_1782213760602.png';
import imgHaldiSet from '../assets/gen/haldi_set_1782213772944.png';
import imgReceptionBride from '../assets/gen/reception_bride_1782213788636.png';
import imgReceptionSet from '../assets/gen/reception_set_1782213798792.png';

const lookbookItems = [
  {
    id: 1,
    num: '01',
    brideImg: imgGoldBride,
    productImg: imgGoldSet,
    title: 'The Gold Bride',
    subtitle: 'Featuring intricately layered gold silhouettes perfect for a regal look',
    tag: 'Wedding Day',
  },
  {
    id: 2,
    num: '02',
    brideImg: imgSangeetBride,
    productImg: imgPolkiSet,
    title: 'Sangeet Look',
    subtitle: 'A captivating blend of polki, diamond, and created Russian emerald stone',
    tag: 'Sangeet',
  },
  {
    id: 3,
    num: '03',
    brideImg: imgMehendiBride,
    productImg: imgMeenakariSet,
    title: 'Mehendi Muse',
    subtitle: 'Vibrant meenakari work with turquoise stones for the joyful Mehendi day',
    tag: 'Mehendi',
  },
  {
    id: 4,
    num: '04',
    brideImg: imgHaldiBride,
    productImg: imgHaldiSet,
    title: 'Haldi Harmony',
    subtitle: 'Lightweight floral-inspired gold designs perfect for Haldi ceremonies',
    tag: 'Haldi',
  },
  {
    id: 5,
    num: '05',
    brideImg: imgReceptionBride,
    productImg: imgReceptionSet,
    title: 'Reception Glow',
    subtitle: 'Contemporary diamond elegance for a breathtaking reception night',
    tag: 'Reception',
  },
];

// Duplicate for seamless infinite scroll
const doubled = [...lookbookItems, ...lookbookItems, ...lookbookItems]; // Triple to ensure wide screens don't run out

const WeddingLookBook = () => {
  return (
    <section id="look-book" className="bg-[#FFF7F2] py-6 md:py-8 mt-4 md:mt-6 overflow-hidden w-full">
      <style>{`
        @keyframes scroll-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-scroll-infinite {
          animation: scroll-infinite 35s linear infinite;
          display: flex;
          width: max-content;
          will-change: transform;
        }
        .animate-scroll-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Header — centred on all breakpoints */}
      <div className="flex flex-col items-center text-center px-4 md:px-10 mb-6 md:mb-10 max-w-7xl mx-auto">
        <p className="font-sans text-[#801416] mb-3 uppercase tracking-[0.25em] text-[12px] font-semibold">
          Editorial
        </p>
        <h2 className="font-serif text-[28px] md:text-[38px] lg:text-[46px] font-bold mb-4 text-[#5F1517] leading-tight">
          Wedding <span className="italic text-[#801416] font-light">Look</span> Book
        </h2>
        <div className="w-16 md:w-24 h-[1px] bg-[#801416]/40 mb-5" />
        <p className="font-sans text-[#5F1517]/70 max-w-lg leading-relaxed font-medium text-[13px] md:text-[15px]">
          Discover uniquely crafted pieces that celebrate heritage craftsmanship and contemporary aesthetics for today's bride
        </p>
      </div>

      {/* ── Auto-scrolling track ── */}
      <div className="relative w-full overflow-hidden">
        {/* Scroll strip */}
        <div 
          className="animate-scroll-infinite gap-6 md:gap-10 pb-8" 
          aria-label="Wedding look book carousel"
        >
          {doubled.map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={`https://wa.me/919035085397?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20interested%20in%20the%20${encodeURIComponent(item.title)}%20(${encodeURIComponent(item.tag)})%20look%20from%20your%20Wedding%20Look%20Book.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 group w-[240px] md:w-[280px] bg-white rounded-3xl p-3 shadow-sm border border-[#5F1517]/5 no-underline block"
            >
              {/* Images Container */}
              <div className="relative w-full aspect-square rounded-2xl mb-5">
                {/* Main Bride Image (Square) */}
                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                  <img
                    src={item.brideImg}
                    alt={item.title + ' bride'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Number Overlay */}
                  <span className="absolute top-3 left-3 font-serif font-light text-white/90 drop-shadow-md select-none leading-none z-10 text-2xl md:text-3xl">
                    {item.num}
                  </span>
                </div>

                {/* Right Image (Product) - Smaller overlaid square */}
                <div className="absolute -bottom-4 -right-2 w-20 h-20 md:w-24 md:h-24 rounded-[1rem] overflow-hidden shadow-lg border-[3px] border-white bg-white z-20">
                  <img
                    src={item.productImg}
                    alt={item.title + ' jewellery'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col text-left px-2">
                <span className="text-[#801416] text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-1.5">
                  {item.tag}
                </span>
                <h4 className="font-serif font-bold text-[#5F1517] leading-tight text-[18px] md:text-[20px] mb-1.5">
                  {item.title}
                </h4>
                <p className="font-sans text-[#5F1517]/70 leading-relaxed text-[11px] md:text-[13px] font-medium mb-3">
                  {item.subtitle}
                </p>
                <div className="mt-auto font-sans text-[#801416] group-hover:text-[#5F1517] transition-colors text-left flex items-center gap-1.5 text-[11px] md:text-[12px] tracking-wide font-bold uppercase">
                  Explore Look
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeddingLookBook;
