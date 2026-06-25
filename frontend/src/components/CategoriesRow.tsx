import React from 'react';
import { Truck, Gift, Gem, Circle } from 'lucide-react';

const categories = [
  { id: 1, name: 'Delivery', icon: <Truck size={28} className="text-[#C82A3A]" />, href: "https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20have%20an%20enquiry%20about%20Express%20Delivery%20options." },
  { id: 2, name: 'Gift Card', icon: <Gift size={28} className="text-[#C82A3A]" />, href: "https://wa.me/919900000000?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20have%20an%20enquiry%20about%20Gift%20Cards." },
  { id: 3, name: 'Pendants', icon: <Gem size={28} className="text-[#C82A3A]" />, href: "#gold" },
  { id: 4, name: 'Necklaces', icon: <Circle size={28} className="text-[#C82A3A]" />, href: "#gold" },
  { id: 5, name: 'Earrings', icon: <Gem size={28} className="text-[#C82A3A]" />, href: "#gold" },
];

const CategoriesRow: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-3 lg:hidden">
      <div className="flex gap-4 min-w-max px-1">
        {categories.map((cat) => (
          <a 
            key={cat.id} 
            href={cat.href}
            className="flex flex-col items-center gap-1.5 cursor-pointer group no-underline"
          >
            <div className="w-[80px] h-[80px] rounded-full border border-[#D5A967] p-1">
               <div className="w-full h-full rounded-full bg-orange-50/50 flex items-center justify-center group-hover:shadow-md transition bg-gradient-to-br from-white to-[#FDF6E3]">
                 {cat.icon}
               </div>
            </div>
            <span className="text-[12px] font-sans font-semibold text-[#801416] group-hover:text-[#5F1517] transition-colors">{cat.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoriesRow;
