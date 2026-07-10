import React from 'react';
import { FaInstagram } from 'react-icons/fa';

import instareel1 from '../assets/instareel1.png';
import instareel2 from '../assets/instareel2.png';
import instareel3 from '../assets/instareel3.png';
import instareel4 from '../assets/instareel4.png';

const InstagramFeed: React.FC = () => {
  const reels = [
    {
      image: instareel1,
      link: "https://www.instagram.com/sirisamruddhigoldpalace/reel/DaiBsbgkfHI/",
    },
    {
      image: instareel2,
      link: "https://www.instagram.com/sirisamruddhigoldpalace/reel/DaP4DkglNw-/",
    },
    {
      image: instareel3,
      link: "https://www.instagram.com/sirisamruddhigoldpalace/reel/DaXvzECkbKH/",
    },
    {
      image: instareel4,
      link: "https://www.instagram.com/sirisamruddhigoldpalace/reel/DaSmMcpiIPx/",
    },
  ];

  return (
    <div className="w-full bg-[#FFF7F2] pt-12 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            <FaInstagram size={18} className="text-[#801416]" />
            <span className="font-sans text-[10px] text-[#801416] tracking-[4px] uppercase font-semibold">Social</span>
          </div>
          <h2 className="font-serif text-[28px] md:text-[38px] text-[#5F1517] leading-tight mb-2">
            Follow us on <span className="italic text-[#801416]">Instagram</span>
          </h2>
          <p className="text-gray-500 text-xs md:text-sm font-sans max-w-md mt-1">
            Stay updated with our latest designs, custom creations, and behind-the-scenes moments.
          </p>
        </div>

        {/* Reels Image Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {reels.map((reel, index) => (
            <a
              key={index}
              href={reel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block w-full rounded-xl overflow-hidden shadow-lg border border-[#5F1517]/10 bg-transparent transition-transform duration-300 hover:-translate-y-1 py-4 px-3"
              style={{ aspectRatio: '9/16' }}
            >
              {/* Image */}
              <img 
                src={reel.image} 
                alt={`Instagram Reel ${index + 1}`} 
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </a>
          ))}
        </div>

        {/* Follow Button Below */}
        <div className="text-center mt-12">
          <a
            href="https://www.instagram.com/sirisamruddhigoldpalace/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-[#5F1517] text-[#FFF7F2] border border-[#D4AF37]/50 hover:bg-[#801416] transition-all duration-300 font-bold uppercase tracking-[2px] text-xs px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 no-underline"
          >
            <FaInstagram size={16} />
            Follow us @sirisamruddhigoldpalace
          </a>
        </div>

      </div>
    </div>
  );
};

export default InstagramFeed;
