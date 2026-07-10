import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/samruddhi-logo.png';
import { getImageUrl } from '../api';
import { ChevronDown } from 'lucide-react';

import imgGoldBride    from '../assets/gen/gold_bride_1782213365863.png';
import imgGoldSet      from '../assets/gen/gold_set_1782213378462.png';
import imgSangeet      from '../assets/gen/sangeet_bride_1782213396287.png';
import imgPolki        from '../assets/gen/polki_set_1782213407545.png';
import imgMehendi      from '../assets/gen/mehendi_bride_1782213420944.png';
import imgMeenakari    from '../assets/gen/meenakari_set_1782213433201.png';

const FALLBACK_IMAGES = [imgGoldBride, imgGoldSet, imgSangeet, imgPolki, imgMehendi, imgMeenakari];

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

    const onScroll = () => {
      const { top } = wrap.getBoundingClientRect();
      const scrollable = wrap.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const rawP = Math.max(0, Math.min(1, -top / scrollable));

      // Delay zoom so the banner sticks completely at rest first
      const DELAY = 0.15;
      const p = Math.max(0, Math.min(1, (rawP - DELAY) / (1 - DELAY)));

      // Smooth zoom: 1x to 15x (use slightly higher zoom power on mobile to stay smooth)
      const zoomPower = isMobile ? 1.5 : 1.4;
      const eased = Math.pow(p, zoomPower);
      
      const maxZoomScale = isMobile ? 12 : 15;
      const scale = 1 + eased * maxZoomScale;
      textEl.style.transform = `scale(${scale}) translateZ(0)`;

      // Gracefully fade text out at the very end
      const textOpacity = p < 0.65 ? 1 : 1 - ((p - 0.65) / 0.35);
      textEl.style.opacity = String(Math.max(0, textOpacity));

      // Fast background fade out
      const bgOpacity = p < 0.10 ? 1 : 1 - ((p - 0.10) / 0.80);
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
        height: isMobile ? '135vh' : '150vh', // Slows down scroll
        paddingTop: isMobile ? '8vh' : '10vh', // Reduced top padding to shift text to the top
      }}
    >
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
              fontSize: isMobile ? 'clamp(1rem, 7.8vw, 2.5rem)' : 'clamp(2rem, 8vw, 7rem)',
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
