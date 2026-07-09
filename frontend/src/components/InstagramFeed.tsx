import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import logo from '../assets/samruddhi-logo.png';

const InstagramFeed: React.FC = () => {
  const reels = [
    "DZ96vsQAU9R",
    "DZ7bEgogdnY",
    "DZxTNs8SBQv",
    "DZ42Ol_jEo7"
  ];

  return (
    <div className="w-full bg-[#FFF7F2] pt-10 pb-14">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">

        {/* Simple Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FaInstagram size={18} className="text-[#801416]" />
            <span className="font-sans text-[10px] text-[#801416] tracking-[4px] uppercase font-semibold">Social</span>
          </div>
          <h2 className="font-serif text-[26px] md:text-[36px] text-[#5F1517] leading-tight mb-2">
            Follow us on <span className="italic text-[#801416]">Instagram</span>
          </h2>
          <a
            href="https://www.instagram.com/samruddhigoldpalace/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 bg-[#5F1517] text-white text-[11px] font-semibold uppercase tracking-[2px] px-5 py-2 rounded-full hover:bg-[#801416] transition-colors no-underline"
          >
            <FaInstagram size={13} /> @samruddhigoldpalace
          </a>
        </div>

        {/* Reels Grid — iframes with custom top-only header bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {reels.map((reelId, index) => (
            <div
              key={index}
              className="relative w-full rounded-2xl overflow-hidden shadow-md border border-[#5F1517]/10 bg-black"
              style={{ aspectRatio: '9/16' }}
            >
              {/* Top brand bar — outside iframe scroll area */}
              <div className="absolute top-0 left-0 w-full h-[42px] bg-white z-20 flex items-center justify-between px-3 border-b border-gray-100 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[#5F1517]/20 flex-shrink-0">
                    <img src={logo} alt="Samruddhi Gold" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[#5F1517] text-[10px] font-bold">samruddhi_gold</span>
                </div>
                <FaInstagram className="text-[#801416]" size={13} />
              </div>

              {/* Instagram embed — positioned below top bar */}
              <div className="absolute inset-0 top-[42px]">
                <iframe
                  src={`https://www.instagram.com/p/${reelId}/embed/?hidecaption=true`}
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency={true}
                  allow="encrypted-media"
                  title={`Instagram Reel ${index + 1}`}
                ></iframe>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default InstagramFeed;
