import React from 'react';
import { Truck, RefreshCcw, Award, ShieldCheck, RotateCcw } from 'lucide-react';

const TrustMarkers: React.FC = () => {
  const features = [
    {
      icon: <Truck size={32} strokeWidth={1.5} />,
      title: 'Free Shipping',
      description: 'Get 100% Free Shipping'
    },
    {
      icon: <RefreshCcw size={32} strokeWidth={1.5} />,
      title: 'Easy Exchange',
      description: 'Exchange your old designs anytime'
    },
    {
      icon: <Award size={32} strokeWidth={1.5} />,
      title: 'Certified Jewellery',
      description: '100% Certified Jewellery'
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1.5} />,
      title: 'Lifetime Product Service',
      description: 'Keep your jewellery in its best shape'
    },
    {
      icon: <RotateCcw size={32} strokeWidth={1.5} />,
      title: '14 Days Return',
      description: '14 Days Hassle-Free Returns'
    }
  ];

  return (
    <div className="relative z-30 w-full bg-transparent py-12 md:py-16 border-t border-b border-[#5F1517]/10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">
        {/* Scrollable container on mobile, flex grid on desktop */}
        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={(e) => {
              const container = e.currentTarget.parentElement?.querySelector('.scroll-container');
              if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
            }}
            className="md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-[#fff]/90 text-[#801416] w-8 h-8 rounded-full flex items-center justify-center border border-[#801416]/20 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div className="scroll-container flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-4 md:pb-0 justify-start md:justify-between gap-6 md:gap-4 px-2">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center min-w-[200px] snap-center shrink-0 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#5F1517]/5 flex items-center justify-center text-[#801416] mb-4 group-hover:scale-110 group-hover:bg-[#801416] group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-[#5F1517] text-lg font-medium mb-1">{feature.title}</h3>
                <p className="font-sans text-gray-600 text-sm max-w-[180px]">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={(e) => {
              const container = e.currentTarget.parentElement?.querySelector('.scroll-container');
              if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
            }}
            className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-[#fff]/90 text-[#801416] w-8 h-8 rounded-full flex items-center justify-center border border-[#801416]/20 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustMarkers;
