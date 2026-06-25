import React from 'react';

const offers = [
  "🎉 Up to 100% Free Making Charges*",
  "🎉 Free Gold Coin on Purchase of Every ₹2.5 Lakh",
  "🎉 Samruddhi Golden Flexi Offer – Rate Protection for 90 Days"
];

const TopBanner: React.FC = () => {
  return (
    <div className="w-full bg-[#5F1517] text-white text-[12px] md:text-[13px] py-2 overflow-hidden font-medium font-sans relative flex items-center">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: flex;
          width: max-content;
          white-space: nowrap;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="animate-marquee cursor-default">
        {/* Render offers twice for a seamless infinite loop */}
        {[...offers, ...offers].map((offer, index) => (
          <span key={index} className="px-8 tracking-wide">
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopBanner;
