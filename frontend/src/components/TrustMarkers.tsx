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
    <div className="relative z-30 w-full bg-[#FFF7F2] py-12 md:py-16 border-t border-b border-[#5F1517]/10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 xl:px-14">
        {/* Scrollable container on mobile, flex grid on desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 md:pb-0 justify-start md:justify-between gap-6 md:gap-4">
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
      </div>
    </div>
  );
};

export default TrustMarkers;
