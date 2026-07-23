import React, { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    desktop: "/images/slider/hero_slider_1.png",
    mobile: "/images/slider/hero_slider_1.png"
  },
  {
    id: 2,
    desktop: "/images/slider/hero_slider_2.png",
    mobile: "/images/slider/hero_slider_2.png"
  },
  {
    id: 3,
    desktop: "/images/slider/hero_slider_3.png",
    mobile: "/images/slider/hero_slider_3.png"
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative">
      <div className="relative w-full h-screen h-[100vh] overflow-hidden bg-luxury">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <picture className="w-full h-full block">
              <source media="(max-width: 768px)" srcSet={slide.mobile} />
              <img
                src={slide.desktop}
                alt={`Premium Gold Jewellery Slide ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </picture>
          </div>
        ))}
        {/* Dark top/bottom vignette overlay for transparent header readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60 z-10 pointer-events-none"></div>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                index === current ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
