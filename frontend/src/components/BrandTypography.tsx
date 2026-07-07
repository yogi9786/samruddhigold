import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/samruddhi-logo.png';

import imgGoldBride    from '../assets/gen/gold_bride_1782213365863.png';
import imgGoldSet      from '../assets/gen/gold_set_1782213378462.png';
import imgSangeet      from '../assets/gen/sangeet_bride_1782213396287.png';
import imgPolki        from '../assets/gen/polki_set_1782213407545.png';
import imgMehendi      from '../assets/gen/mehendi_bride_1782213420944.png';
import imgMeenakari    from '../assets/gen/meenakari_set_1782213433201.png';

const HOVER_IMAGES = [imgGoldBride, imgGoldSet, imgSangeet, imgPolki, imgMehendi, imgMeenakari];

const BrandTypography: React.FC = () => {
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
    if (isMobile) return;

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
      const DELAY = 0.20;
      const p = Math.max(0, Math.min(1, (rawP - DELAY) / (1 - DELAY)));

      // Smooth zoom: 1x to 16x
      const eased = Math.pow(p, 1.4);
      const scale = 1 + eased * 15;
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

  // Split text for per-letter hover
  const BRAND_TEXT = "SIRISAMRUDDHI GOLD".split("");

  // ──────────────────────────────────────────────────────────────────────────
  // MOBILE DISPLAY: No scroll effect, smaller text, zero dead gaps
  // ──────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="w-full bg-[#FFF7F2] py-8 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Logo - Made larger for mobile */}
        <img
          src={logo}
          alt="Siri Samruddhi Gold"
          className="w-[85px] h-auto object-contain mb-2 pointer-events-none select-none"
        />

        {/* Eyebrow */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="block w-4 h-[1px] bg-[#D4AF37] opacity-60" />
          <span className="font-sans text-[#D4AF37] text-[10px] tracking-[1.5px] uppercase font-semibold leading-none">
            Est. Tradition &amp; Craft
          </span>
          <span className="block w-4 h-[1px] bg-[#D4AF37] opacity-60" />
        </div>

        {/* Brand Name - Smaller for mobile */}
        <span
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 'clamp(1.4rem, 7vw, 2.2rem)',
            fontWeight: 700,
            color: '#5F1517',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          SIRISAMRUDDHI GOLD
        </span>

        {/* Gold Divider */}
        <span
          className="block h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          style={{ width: '36px', marginTop: '6px' }}
        />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DESKTOP DISPLAY: Scroll Zoom effect + Hover Images
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div ref={wrapRef} className="w-full relative overflow-hidden" style={{ height: '120vh' }}>
      <div
        style={{
          position: 'sticky',
          top: '30vh',
          height: '40vh',
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
            background: '#FFF7F2', // Matches other section backgrounds
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
          {/* Logo - Larger on desktop */}
          <img
            src={logo}
            alt="Siri Samruddhi Gold"
            style={{
              width: 'clamp(70px, 8vw, 110px)',
              height: 'auto',
              objectFit: 'contain',
              marginBottom: '3px',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
            <span className="block w-4 h-[1px] bg-[#D4AF37] opacity-60" />
            <span className="font-sans text-[#D4AF37] text-[10px] tracking-[1.5px] uppercase font-semibold leading-none whitespace-nowrap">
              Est. Tradition &amp; Craft
            </span>
            <span className="block w-4 h-[1px] bg-[#D4AF37] opacity-60" />
          </div>

          <div
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: 'clamp(1.3rem, 7.8vw, 6.5rem)',
              fontWeight: 700,
              color: '#5F1517',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {BRAND_TEXT.map((char, index) => {
              if (char === " ") return <span key={index} style={{ width: '0.25em' }} />;
              
              const imgUrl = HOVER_IMAGES[index % HOVER_IMAGES.length];
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
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none transition-all duration-300 z-50"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 10px) scale(0.9)',
                    }}
                  >
                    <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 rounded-md overflow-hidden shadow-xl border-2 border-white/80 bg-white">
                      <img src={imgUrl} alt="Jewellery" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </span>
              );
            })}
          </div>

          <span
            className="block h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
            style={{ width: '32px', marginTop: '6px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandTypography;
