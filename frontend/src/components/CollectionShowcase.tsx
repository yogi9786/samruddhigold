import { Play, Plus } from 'lucide-react';

const CollectionShowcase = () => {
  return (
    <section className="w-[calc(100%-2rem)] max-w-7xl mx-auto bg-[#110A08] rounded-[2rem] md:rounded-[3rem] px-6 py-10 lg:py-16 lg:px-12 flex flex-col mt-8 mb-8 shadow-2xl">

      {/* SECTION 2: Choose The Type */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        
        {/* Left Large Video (YouTube Embed) */}
        <div className="w-full lg:w-1/2 relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] bg-[#1A110E] border-4 border-[#1A110E]">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/-m6UKhyTtkU?rel=0" 
            title="Siri Samruddhi Gold Video" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          ></iframe>
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h2 className="font-serif text-[36px] md:text-[46px] text-white mb-5 leading-tight tracking-wide">
            Choose The Type!
          </h2>
          <p className="font-sans text-[14px] md:text-[15px] text-white/70 mb-12 leading-relaxed max-w-lg font-light">
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
              <div className="w-[85px] h-[120px] md:w-[100px] md:h-[140px] rounded-[3rem] bg-[#1A110E] overflow-hidden p-[6px] shadow-lg group-hover:-translate-y-2 transition-transform duration-300 relative border border-[#D4AF37]/30">
                <img src="/images/gallery/gold_rings_coral.png" alt="Ring" className="w-full h-full object-cover rounded-[2.5rem]" />
              </div>
              <span className="font-serif text-[18px] md:text-[20px] text-[#D4AF37] mt-5 mb-3 tracking-wide">Ring</span>
              <div className="bg-[#D4AF37] text-[#110A08] w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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
              <div className="w-[85px] h-[120px] md:w-[100px] md:h-[140px] rounded-[3rem] bg-[#1A110E] overflow-hidden p-[6px] shadow-lg group-hover:-translate-y-2 transition-transform duration-300 relative border border-[#D4AF37]/30">
                <img src="/images/gallery/chunky_gold_chain.png" alt="Necklace" className="w-full h-full object-cover rounded-[2.5rem]" />
              </div>
              <span className="font-serif text-[18px] md:text-[20px] text-[#D4AF37] mt-5 mb-3 tracking-wide">Necklace</span>
              <div className="bg-[#D4AF37] text-[#110A08] w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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
              <div className="w-[85px] h-[120px] md:w-[100px] md:h-[140px] rounded-[3rem] bg-[#1A110E] overflow-hidden p-[6px] shadow-lg group-hover:-translate-y-2 transition-transform duration-300 relative border border-[#D4AF37]/30">
                <img src="/images/gallery/gold_bracelet_hand.png" alt="Bracelet" className="w-full h-full object-cover rounded-[2.5rem]" />
              </div>
              <span className="font-serif text-[18px] md:text-[20px] text-[#D4AF37] mt-5 mb-3 tracking-wide">Bracelet</span>
              <div className="bg-[#D4AF37] text-[#110A08] w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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
