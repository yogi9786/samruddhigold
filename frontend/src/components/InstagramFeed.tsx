import React from 'react';
import { FaInstagram, FaHeart, FaRegComment, FaRegPaperPlane } from 'react-icons/fa';
import logo from '../assets/samruddhi-logo.png';

const InstagramFeed: React.FC = () => {
  const reels = [
    "DZ96vsQAU9R",
    "DZ7bEgogdnY",
    "DZxTNs8SBQv",
    "DZ42Ol_jEo7"
  ];

  return (
    <div className="w-full bg-transparent py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">

        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <p className="font-sans text-[#801416] mb-3 uppercase tracking-[0.25em] text-[13px] font-semibold">
              Social
            </p>
            <h2 className="font-serif text-[36px] md:text-[46px] font-bold mb-5 text-[#5F1517] leading-tight flex items-center justify-center md:justify-start gap-3">
              <FaInstagram size={36} className="text-[#801416]" />
              Follow us on <span className="italic text-[#801416] font-light">Instagram</span>
            </h2>
            <div className="w-16 md:w-24 h-[1px] bg-[#801416]/40 mb-6" />
            <p className="font-sans text-[#5F1517]/70 max-w-full lg:max-w-2xl leading-relaxed font-medium text-[14px] md:text-[16px]">
              Get the latest updates, designs, and exclusive offers straight to your feed.
            </p>
          </div>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-4 md:pb-0">
          {reels.map((reelId, index) => (
            <div
              key={index}
              className="bg-black rounded-xl shadow-sm border border-[#5F1517]/10 overflow-hidden relative w-full aspect-[9/16]"
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

              {/* Custom Cream Top Overlay */}
              <div className="absolute top-0 left-0 w-full h-[50px] bg-ivory z-10 pointer-events-auto flex items-center justify-between px-3 border-b border-[#5F1517]/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white p-[1px] overflow-hidden border border-[#5F1517]/20 shadow-sm">
                    <img src={logo} alt="Samruddhi Gold" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <span className="text-[#5F1517] text-[10px] font-bold tracking-wide">samruddhi_gold</span>
                </div>
                <a 
                  href="https://www.instagram.com/samruddhigoldpalace/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#5F1517] text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full hover:bg-[#801416] transition-colors shadow-sm"
                >
                  View Profile
                </a>
              </div>

              {/* Custom Cream Bottom Overlay */}
              <div className="absolute bottom-0 left-0 w-full h-[95px] bg-ivory z-10 pointer-events-auto flex flex-col justify-center px-4 border-t border-[#5F1517]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-[#5F1517]">
                    <FaHeart className="text-[#5F1517] hover:scale-110 transition-transform cursor-pointer" size={16} />
                    <FaRegComment className="text-[#5F1517] hover:scale-110 transition-transform cursor-pointer" size={16} />
                    <FaRegPaperPlane className="text-[#5F1517] hover:scale-110 transition-transform cursor-pointer" size={14} />
                  </div>
                  <FaInstagram className="text-[#5F1517]/80" size={16} />
                </div>
                <div className="text-[#5F1517] text-[10px] font-bold tracking-wide mb-2">
                  {["1,245", "3,892", "2,156", "4,501"][index]} likes
                </div>
                <a 
                  href={`https://www.instagram.com/p/${reelId}/`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#5F1517] text-white text-[9px] font-semibold uppercase tracking-widest py-1.5 rounded text-center hover:bg-[#801416] transition-colors shadow-sm"
                >
                  View more on Instagram
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default InstagramFeed;
