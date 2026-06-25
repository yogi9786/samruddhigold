import { Play, Plus } from 'lucide-react';

const CollectionShowcase = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 lg:py-16 flex flex-col gap-20">

      {/* SECTION 2: Choose The Type */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        
        {/* Left Large Video with Play Button Overlay */}
        <div className="w-full lg:w-1/2 relative rounded-[2.5rem] overflow-hidden shadow-sm aspect-[4/3] bg-[#FFF7F2]">
          {/* Jewelry video placeholder from a royalty-free stock video library */}
          <video 
            src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-wearing-a-gold-ring-4182-large.mp4" 
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
            <button className="bg-white/95 text-[#5F1517] w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <Play fill="currentColor" size={32} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h2 className="font-serif text-[36px] md:text-[46px] text-[#5F1517] mb-5 leading-tight">
            Choose The Type!
          </h2>
          <p className="font-sans text-[14px] md:text-[15px] text-[#5F1517]/70 mb-12 leading-relaxed max-w-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>

          <div className="flex flex-row justify-between sm:justify-start sm:gap-12 lg:gap-10 xl:gap-14">
            
            {/* Category 1 */}
            <a 
              href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20exploring%20your%20collection%20of%20Rings."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group cursor-pointer w-1/3 sm:w-auto no-underline"
            >
              <div className="w-[85px] h-[120px] md:w-[100px] md:h-[140px] rounded-[3rem] bg-[#FFF7F2] overflow-hidden p-[6px] shadow-sm group-hover:-translate-y-2 transition-transform duration-300 relative border border-[#5F1517]/10">
                <img src="/images/gallery/gold_rings_coral.png" alt="Ring" className="w-full h-full object-cover rounded-[2.5rem]" />
              </div>
              <span className="font-serif text-[18px] md:text-[20px] text-[#5F1517] mt-5 mb-3">Ring</span>
              <div className="bg-[#801416] text-white w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-[#5F1517] transition-colors shadow-sm">
                <Plus size={14} strokeWidth={3} />
              </div>
            </a>
            
            {/* Category 2 */}
            <a 
              href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20exploring%20your%20collection%20of%20Necklaces."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group cursor-pointer w-1/3 sm:w-auto no-underline"
            >
              <div className="w-[85px] h-[120px] md:w-[100px] md:h-[140px] rounded-[3rem] bg-[#FFF7F2] overflow-hidden p-[6px] shadow-sm group-hover:-translate-y-2 transition-transform duration-300 relative border border-[#5F1517]/10">
                <img src="/images/gallery/chunky_gold_chain.png" alt="Necklace" className="w-full h-full object-cover rounded-[2.5rem]" />
              </div>
              <span className="font-serif text-[18px] md:text-[20px] text-[#5F1517] mt-5 mb-3">Necklace</span>
              <div className="bg-[#801416] text-white w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-[#5F1517] transition-colors shadow-sm">
                <Plus size={14} strokeWidth={3} />
              </div>
            </a>

            {/* Category 3 */}
            <a 
              href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20exploring%20your%20collection%20of%20Bracelets."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group cursor-pointer w-1/3 sm:w-auto no-underline"
            >
              <div className="w-[85px] h-[120px] md:w-[100px] md:h-[140px] rounded-[3rem] bg-[#FFF7F2] overflow-hidden p-[6px] shadow-sm group-hover:-translate-y-2 transition-transform duration-300 relative border border-[#5F1517]/10">
                <img src="/images/gallery/gold_bracelet_hand.png" alt="Bracelet" className="w-full h-full object-cover rounded-[2.5rem]" />
              </div>
              <span className="font-serif text-[18px] md:text-[20px] text-[#5F1517] mt-5 mb-3">Bracelet</span>
              <div className="bg-[#801416] text-white w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-[#5F1517] transition-colors shadow-sm">
                <Plus size={14} strokeWidth={3} />
              </div>
            </a>

          </div>
        </div>
      </div>

    </section>
  );
};

export default CollectionShowcase;
