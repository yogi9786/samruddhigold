import React from 'react';
import { FaInstagram } from 'react-icons/fa';

const InstagramFeed: React.FC = () => {
  const reels = [
    "DZ96vsQAU9R",
    "DZ7bEgogdnY",
    "DZxTNs8SBQv",
    "DZ42Ol_jEo7"
  ];

  return (
    <div className="w-full bg-[#FFF7F2] py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-[32px] lg:text-[42px] font-serif text-[#5F1517] mb-2 flex items-center justify-center md:justify-start gap-3">
              <FaInstagram size={36} className="text-[#801416]" />
              Follow us on Instagram
            </h2>
            <p className="text-gray-600 font-sans text-sm lg:text-base">
              Get the latest updates, designs, and exclusive offers straight to your feed.
            </p>
          </div>
          
          <a 
            href="https://www.instagram.com/sirisamruddhigoldpalace/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-[#801416] text-white px-8 py-3 rounded-full font-medium hover:bg-[#5F1517] transition-all shadow-md hover:shadow-lg"
          >
            <FaInstagram size={18} />
            <span>@sirisamruddhigoldpalace</span>
          </a>
        </div>

        {/* Reels Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0">
          {reels.map((reelId, index) => (
            <div 
              key={index} 
              className="bg-black rounded-xl shadow-sm border border-[#5F1517]/10 overflow-hidden relative shrink-0 snap-center w-[280px] sm:w-[320px] md:w-full aspect-[9/16]"
            >
              <iframe
                src={`https://www.instagram.com/p/${reelId}/embed/?hidecaption=true`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                allow="encrypted-media"
                title={`Instagram Reel ${index + 1}`}
              ></iframe>
              
              {/* Top Overlay to hide header */}
              <div className="absolute top-0 left-0 w-full h-[60px] bg-black z-10 pointer-events-auto"></div>
              
              {/* Bottom Overlay to hide footer/likes */}
              <div className="absolute bottom-0 left-0 w-full h-[60px] bg-black z-10 pointer-events-auto flex items-center justify-center border-t border-white/10">
                 <span className="text-white/60 text-xs font-medium tracking-wide">Watch Reel</span>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default InstagramFeed;
