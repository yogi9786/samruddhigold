import React from 'react';
import { User, LayoutGrid, Coins, HelpCircle } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#FFF7F2] border-t border-[#5F1517]/10 z-50 px-2 py-2.5 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      <button className="flex flex-col items-center gap-1 text-[#5F1517] bg-transparent border-0 cursor-pointer">
        <User size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Account</span>
      </button>
      <a href="#categories-section" className="flex flex-col items-center gap-1 text-[#801416] hover:text-[#5F1517] transition no-underline">
        <LayoutGrid size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Categories</span>
      </a>
      <a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20learning%20more%20about%20your%20Gold%2520Scheme." target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[#801416] hover:text-[#5F1517] transition no-underline">
        <Coins size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Gold Scheme</span>
      </a>
      <a href="https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20need%20some%20help%20and%20support." target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[#801416] hover:text-[#5F1517] transition no-underline">
        <HelpCircle size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Help</span>
      </a>
    </div>
  );
};

export default BottomNav;
