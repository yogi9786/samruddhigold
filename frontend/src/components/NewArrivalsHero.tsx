import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/samruddhi-logo.png';
import { getImageUrl } from '../api';
import { ChevronDown } from 'lucide-react';

import imgGoldBride from '../assets/gen/gold_bride_1782213365863.png';
import imgGoldSet from '../assets/gen/gold_set_1782213378462.png';
import imgSangeet from '../assets/gen/sangeet_bride_1782213396287.png';
import imgPolki from '../assets/gen/polki_set_1782213407545.png';
import imgMehendi from '../assets/gen/mehendi_bride_1782213420944.png';
import imgMeenakari from '../assets/gen/meenakari_set_1782213433201.png';
import imgHaldiBride from '../assets/gen/haldi_bride_1782213760602.png';
import imgHaldiSet from '../assets/gen/haldi_set_1782213772944.png';
import imgReceptionBride from '../assets/gen/reception_bride_1782213788636.png';
import imgReceptionSet from '../assets/gen/reception_set_1782213798792.png';

const FALLBACK_IMAGES = [imgGoldBride, imgGoldSet, imgSangeet, imgPolki, imgMehendi, imgMeenakari];

const FLOATING_IMAGES = [
  // Top Row
  { image: imgGoldBride, top: '13%', left: '3%', mobileTop: '10%', mobileLeft: '1.5%', speed: 0.02, size: 'w-14 sm:w-20 md:w-32 lg:w-40', rotate: 3 },
  { image: imgGoldSet, top: '16%', right: '4%', mobileTop: '12%', mobileRight: '1.5%', speed: 0.015, size: 'w-16 sm:w-24 md:w-36 lg:w-44', rotate: -6 },
  
  // Mid-Upper Row
  { image: imgSangeet, top: '28%', left: '7%', mobileTop: '22%', mobileLeft: '2.5%', speed: 0.01, size: 'w-12 sm:w-16 md:w-28 lg:w-36', rotate: 6 },
  { image: imgPolki, top: '32%', right: '6%', mobileTop: '26%', mobileRight: '2.5%', speed: -0.01, size: 'w-14 sm:w-20 md:w-32 lg:w-40', rotate: -3 },
  
  // Mid-Lower Row
  { image: imgMehendi, top: '44%', left: '2%', mobileTop: '38%', mobileLeft: '1.5%', speed: 0.02, size: 'w-16 sm:w-24 md:w-36 lg:w-44', rotate: 8 },
  { image: imgMeenakari, top: '48%', right: '3%', mobileTop: '42%', mobileRight: '1.5%', speed: -0.015, size: 'w-12 sm:w-16 md:w-28 lg:w-36', rotate: -8 },
  
  // Bottom-Center Images (framed around center)
  { image: imgHaldiBride, top: '74%', left: '34%', mobileTop: '72%', mobileLeft: '22%', speed: -0.01, size: 'w-14 sm:w-20 md:w-32 lg:w-40', rotate: 4 },
  { image: imgHaldiSet, top: '76%', right: '34%', mobileTop: '74%', mobileRight: '22%', speed: -0.02, size: 'w-16 sm:w-24 md:w-36 lg:w-44', rotate: -5 },
  
  // Outer Bottom Corner Images (Desktop only)
  { image: imgReceptionBride, top: '78%', left: '4%', speed: -0.02, size: 'w-14 sm:w-16 md:w-28 lg:w-36', rotate: 5, hideMobile: true },
  { image: imgReceptionSet, top: '82%', right: '5%', speed: -0.02, size: 'w-18 sm:w-24 md:w-36 lg:w-44', rotate: -7, hideMobile: true },
];

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  discount_text?: string;
  image_url?: string;
}

interface NewArrivalsHeroProps {
  products: Product[];
}

const NewArrivalsHero: React.FC<NewArrivalsHeroProps> = ({ products }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const floatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const bg = bgRef.current;
    const textEl = textRef.current;
    if (!wrap || !bg || !textEl) return;

    // Apply initial translation to floating images
    floatRefs.current.forEach((el, idx) => {
      if (el) {
        el.style.transform = 'translateY(0px) translateZ(0)';
      }
    });

    const onScroll = () => {
      const scrolledPixels = window.scrollY;

      // Update parallax positions of floating images
      floatRefs.current.forEach((el, idx) => {
        if (!el) return;
        const imgData = FLOATING_IMAGES[idx];
        const yTranslation = scrolledPixels * imgData.speed;
        el.style.transform = `translateY(${yTranslation}px) translateZ(0)`;
      });

      const { top } = wrap.getBoundingClientRect();
      const scrollable = wrap.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.max(0, Math.min(1, -top / scrollable));

      // Smooth zoom: slow and smooth start, linear progression
      const zoomPower = 1.3;
      const eased = Math.pow(p, zoomPower);

      // High max scale to ensure text goes completely off-screen for a full zoom portal effect
      const maxZoomScale = isMobile ? 22 : 32;
      const scale = 1 + eased * maxZoomScale;
      textEl.style.transform = `scale(${scale}) translateZ(0)`;

      // Gracefully fade text out at the very end of the scroll range
      const textOpacity = p < 0.70 ? 1 : 1 - ((p - 0.70) / 0.30);
      textEl.style.opacity = String(Math.max(0, textOpacity));

      // Fade background out continuously over the entire scroll duration
      const bgOpacity = 1 - p;
      bg.style.opacity = String(Math.max(0, bgOpacity));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  // Split text "NEW ARRIVALS" for per-letter hover
  const BRAND_TEXT = "NEW ARRIVALS".split("");

  // Determine hover image for each letter
  const getHoverImage = (charIndex: number) => {
    if (products.length > 0) {
      // Find the index of non-space letters to map them cleanly
      let nonSpaceCount = 0;
      for (let i = 0; i <= charIndex; i++) {
        if (BRAND_TEXT[i] !== " ") {
          nonSpaceCount++;
        }
      }
      const prod = products[nonSpaceCount % products.length];
      if (prod && prod.image_url) {
        return getImageUrl(prod.image_url);
      }
    }
    return FALLBACK_IMAGES[charIndex % FALLBACK_IMAGES.length];
  };

  return (
    <div
      ref={wrapRef}
      className="w-full relative overflow-hidden"
      style={{
        height: isMobile ? '70vh' : '125vh', // Stretches scroll distance to make zoom slow and smooth
        paddingTop: isMobile ? '8vh' : '10vh', // Reduced top padding to shift text to the top
      }}
    >
      {/* Floating Parallax Jewellery Images */}
      {FLOATING_IMAGES.map((item, index) => {
        if (isMobile && item.hideMobile) return null;

        const topPos = isMobile && item.mobileTop !== undefined ? item.mobileTop : item.top;
        const leftPos = isMobile && item.mobileLeft !== undefined ? item.mobileLeft : (item as any).left;
        const rightPos = isMobile && item.mobileRight !== undefined ? item.mobileRight : (item as any).right;

        return (
          <div
            key={index}
            ref={el => { floatRefs.current[index] = el; }}
            className="absolute transition-transform duration-75 ease-out z-20"
            style={{
              top: topPos,
              ...(leftPos !== undefined ? { left: leftPos } : { right: rightPos }),
              aspectRatio: '1/1',
              willChange: 'transform',
            }}
          >
            {/* Inner container to separate CSS hover scale/shadow from JS translations */}
            <div
              className={`pointer-events-auto cursor-pointer border-[3px] md:border-[6px] lg:border-[8px] border-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-108 hover:shadow-2xl ${item.size}`}
              style={{
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              <img
                src={item.image}
                alt="Showcase Jewellery"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'sticky',
          top: isMobile ? '8vh' : '10vh', // Reduced top sticky threshold
          height: isMobile ? '30vh' : '45vh',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div
          ref={bgRef}
          className="absolute inset-0 transition-opacity duration-75"
          style={{
            background: '#FFF7F2',
            zIndex: 1,
          }}
        />

        <div
          ref={textRef}
          style={{
            position: 'relative',
            zIndex: 2,
            transformOrigin: 'center center',
            willChange: 'transform, opacity',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            padding: '0 8px',
          }}
        >
          {/* Logo */}
          <img
            src={logo}
            alt="Siri Samruddhi Gold"
            style={{
              width: isMobile ? '70px' : 'clamp(70px, 8vw, 100px)',
              height: 'auto',
              objectFit: 'contain',
              marginBottom: isMobile ? '8px' : '4px',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          <div className="flex items-center gap-1.5" style={{ marginBottom: isMobile ? '10px' : '6px' }}>
            <span className="block w-4 h-[1px] bg-[#D4AF37] opacity-60" />
            <span className="font-sans text-[#D4AF37] text-[9px] md:text-[10px] tracking-[2px] uppercase font-semibold leading-none whitespace-nowrap">
              Freshly Crafted Treasures
            </span>
            <span className="block w-4 h-[1px] bg-[#D4AF37] opacity-60" />
          </div>

          <div
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: isMobile ? 'clamp(1rem, 6.2vw, 2.1rem)' : 'clamp(2rem, 7vw, 6rem)',
              fontWeight: 700,
              color: '#5F1517',
              letterSpacing: isMobile ? '0.02em' : '0.05em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {BRAND_TEXT.map((char, index) => {
              if (char === " ") return <span key={index} style={{ width: '0.25em' }} />;

              const imgUrl = getHoverImage(index);
              const isHovered = hoveredIndex === index;

              return (
                <span
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative transition-colors duration-300 cursor-default"
                  style={{
                    color: isHovered ? '#D4AF37' : '#5F1517',
                  }}
                >
                  {char}
                  {/* Hover Image popup */}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none transition-all duration-300 z-50"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 10px) scale(0.9)',
                    }}
                  >
                    <div
                      className="rounded-md overflow-hidden shadow-2xl border-2 border-white/95 bg-white"
                      style={{
                        width: isMobile ? '56px' : '96px',
                        height: isMobile ? '72px' : '112px'
                      }}
                    >
                      <img src={imgUrl} alt="New Arrival Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </span>
              );
            })}
          </div>

          <span
            className="block h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
            style={{ width: '40px', marginTop: '10px' }}
          />

          {/* Bouncing Scroll Down Symbol */}
          <div className="flex flex-col items-center gap-1 mt-6 animate-bounce text-[#D4AF37] pointer-events-none">
            <span className="font-sans text-[8px] uppercase tracking-[3px] opacity-75">
              Scroll Down
            </span>
            <ChevronDown size={14} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrivalsHero;
