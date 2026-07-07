import React from 'react';

const categories = [
  {
    id: 1,
    name: 'Necklaces',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path d="M8 10 Q20 24 32 10" stroke="#C82A3A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="26" r="4" stroke="#C82A3A" strokeWidth="2" fill="none" />
        <circle cx="8" cy="10" r="2" fill="#C82A3A" opacity="0.5" />
        <circle cx="32" cy="10" r="2" fill="#C82A3A" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 2,
    name: 'Rings',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <circle cx="20" cy="20" r="10" stroke="#C82A3A" strokeWidth="2.2" fill="none" />
        <circle cx="20" cy="20" r="5" stroke="#C82A3A" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="10" r="2.5" fill="#C82A3A" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 3,
    name: 'Bangles',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <ellipse cx="20" cy="20" rx="13" ry="10" stroke="#C82A3A" strokeWidth="2.2" fill="none" />
        <ellipse cx="20" cy="20" rx="8" ry="5" stroke="#C82A3A" strokeWidth="1.2" strokeDasharray="2 2" fill="none" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 4,
    name: 'Earrings',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path d="M15 8 L15 18 Q15 26 20 30 Q25 26 25 18 L25 8" stroke="#C82A3A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="15" cy="7" r="2.5" fill="#C82A3A" opacity="0.8" />
        <circle cx="25" cy="7" r="2.5" fill="#C82A3A" opacity="0.8" />
        <circle cx="20" cy="30" r="3" stroke="#C82A3A" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: 5,
    name: 'Bracelets',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path d="M6 20 C10 16, 30 16, 34 20" stroke="#C82A3A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="19" r="2" fill="#C82A3A" />
        <circle cx="20" cy="18" r="3" stroke="#C82A3A" strokeWidth="1.5" fill="none" />
        <circle cx="28" cy="19" r="2" fill="#C82A3A" />
      </svg>
    ),
  },
  {
    id: 6,
    name: 'Wedding Sets',
    href: '#wedding-set',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path d="M8 8 Q20 22 32 8" stroke="#C82A3A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M11 12 Q20 25 29 12" stroke="#C82A3A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M14 16 L20 28 L26 16 Z" fill="#C82A3A" opacity="0.2" />
        <path d="M14 16 L20 28 L26 16 Z" stroke="#C82A3A" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 7,
    name: 'Mangalsutra',
    href: '#diamond',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path d="M6 12 Q20 24 34 12" stroke="#C82A3A" strokeWidth="2.2" strokeDasharray="3 2" fill="none" />
        <rect x="17" y="19" width="6" height="6" rx="1" stroke="#C82A3A" strokeWidth="1.5" fill="none" />
        <circle cx="14" cy="17" r="1.5" fill="#C82A3A" />
        <circle cx="26" cy="17" r="1.5" fill="#C82A3A" />
      </svg>
    ),
  },
  {
    id: 8,
    name: 'Anklets',
    href: '#silver',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path d="M6 20 C10 24, 30 24, 34 20" stroke="#C82A3A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="22" r="1.5" fill="#C82A3A" />
        <circle cx="20" cy="23" r="1.5" fill="#C82A3A" />
        <circle cx="28" cy="22" r="1.5" fill="#C82A3A" />
      </svg>
    ),
  },
  {
    id: 9,
    name: 'Nose Pins',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <circle cx="20" cy="20" r="4" stroke="#C82A3A" strokeWidth="1.5" fill="none" />
        <path d="M20 12 L20 28 M12 20 L28 20" stroke="#C82A3A" strokeWidth="1.2" opacity="0.6" />
        <circle cx="20" cy="20" r="1" fill="#C82A3A" />
      </svg>
    ),
  },
  {
    id: 10,
    name: 'Gold Coins',
    href: '#gold',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <circle cx="20" cy="20" r="11" stroke="#C82A3A" strokeWidth="2.2" fill="none" />
        <circle cx="20" cy="20" r="8" stroke="#C82A3A" strokeWidth="1" strokeDasharray="2 1.5" fill="none" opacity="0.8" />
        <path d="M17 20 L20 17 L23 20 L20 23 Z" fill="#C82A3A" opacity="0.7" />
      </svg>
    ),
  },
];

const CategoriesRow: React.FC = () => {
  return (
    <div className="w-full bg-[#FFF7F2] py-3 px-2 md:px-4 border-b border-[#D4AF37]/15 mb-2">
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
        <div className="flex flex-row gap-3 md:gap-4 min-w-max lg:min-w-0 lg:flex-wrap lg:justify-center mx-auto px-1">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center gap-1.5 cursor-pointer group no-underline flex-shrink-0"
            >
              {/* Very small Circle icon */}
              <div className="w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full border border-[#D4AF37]/50 p-[2px] group-hover:border-[#C82A3A] transition-colors duration-300">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-[#FFF7EC] flex items-center justify-center group-hover:shadow-sm transition-shadow duration-300">
                  {cat.icon}
                </div>
              </div>
              {/* Small Label */}
              <span className="text-[9px] md:text-[10px] font-sans font-medium text-[#801416] group-hover:text-[#5F1517] transition-colors text-center leading-tight whitespace-nowrap">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesRow;
