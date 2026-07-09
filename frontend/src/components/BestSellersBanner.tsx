import React from 'react';
import tempImg from '../assets/gen/indian_model_ship_1783420166146.png';

const BestSellersBanner: React.FC = () => {
  return (
    <section className="w-[calc(100%-2rem)] max-w-7xl mx-auto bg-[#110A08] rounded-[2rem] md:rounded-[3rem] py-12 md:py-16 px-4 md:px-8 mt-6 md:mt-10 overflow-hidden shadow-2xl">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24">
        
        {/* Left Side: Arched Image & Badge */}
        <div className="relative w-full max-w-[260px] md:max-w-[320px]">
          {/* Arched Container */}
          <div className="w-full aspect-[4/5] rounded-t-full rounded-b-lg overflow-hidden shadow-2xl border-4 border-[#110A08]">
            <img 
              src={tempImg} 
              alt="Indian Model on Ship" 
              className="w-full h-full object-cover object-top"
              id="best-sellers-image"
            />
          </div>

          {/* Rotating Stamp / Badge */}
          <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-24 h-24 md:w-32 md:h-32 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-xl animate-[spin_20s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#110A08]">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
              <text fontSize="10" fontWeight="bold" letterSpacing="2.5" fill="currentColor">
                <textPath href="#circlePath" startOffset="0%">
                  • BEST SELLERS • EXCLUSIVE COLLECTION 
                </textPath>
              </text>
            </svg>
            {/* Inner small circle/star */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#110A08]" />
          </div>
        </div>

        {/* Right Side: Typography & CTA */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
          {/* Cursive / Elegant sub-text */}
          <p 
            className="text-[#D4AF37] text-[24px] md:text-[34px] mb-2" 
            style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontStyle: "italic" }}
          >
            let's shop our
          </p>
          
          {/* Main Title */}
          <h2 className="font-serif text-white text-[40px] md:text-[84px] leading-[0.95] tracking-wide mb-6">
            BEST SELLERS
          </h2>

          {/* Added Content */}
          <p className="font-sans text-white/80 text-[13px] md:text-[15px] leading-relaxed mb-8 max-w-md font-light">
            Discover our most loved and highly coveted designs, hand-selected by our master craftsmen. Experience breathtaking elegance and purity that truly stands the test of time.
          </p>
          
          {/* CTA Button */}
          <a 
            href="#categories-section"
            className="inline-block border border-[#D4AF37] bg-transparent text-[#D4AF37] text-[11px] md:text-[13px] font-sans font-bold uppercase tracking-[3px] px-8 py-3.5 hover:bg-[#D4AF37] hover:text-[#110A08] transition-colors duration-300"
          >
            SHOP NOW
          </a>
        </div>
      </div>
    </section>
  );
};

export default BestSellersBanner;
