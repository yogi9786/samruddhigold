import React, { useState } from 'react';

import catBangles from '../assets/gen/cat_bangles_1782214893370.png';
import catEarrings from '../assets/gen/cat_earrings_1782214875918.png';
import catJewellerySets from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import catMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';
import catPendants from '../assets/gen/cat_pendants_1782214847919.png';

const categoriesData = [
  // --- Earrings ---
  { id: 1, tab: "Earrings", name: "Everyday Earrings", image: catEarrings },
  { id: 2, tab: "Earrings", name: "Statement Pieces", image: catPendants },
  { id: 3, tab: "Earrings", name: "Shine On Studs", image: catJewellerySets },
  { id: 4, tab: "Earrings", name: "Best Sellers", image: catBangles },
  { id: 5, tab: "Earrings", name: "What's New", image: catMangalsutra },

  // --- Bangles ---
  { id: 6, tab: "Bangles", name: "Daily Wear Bangles", image: catBangles },
  { id: 7, tab: "Bangles", name: "Bridal Bangles", image: catMangalsutra },
  { id: 8, tab: "Bangles", name: "Kadas", image: catJewellerySets },
  { id: 9, tab: "Bangles", name: "Best Sellers", image: catPendants },
  { id: 10, tab: "Bangles", name: "What's New", image: catEarrings },

  // --- Casual wear ---
  { id: 11, tab: "Casual wear", name: "Light Pendants", image: catPendants },
  { id: 12, tab: "Casual wear", name: "Chain Bracelets", image: catEarrings },
  { id: 13, tab: "Casual wear", name: "Simple Rings", image: catBangles },
  { id: 14, tab: "Casual wear", name: "Best Sellers", image: catJewellerySets },
  { id: 15, tab: "Casual wear", name: "What's New", image: catMangalsutra },

  // --- Diamond ---
  { id: 16, tab: "Diamond", name: "Diamond Rings", image: catEarrings },
  { id: 17, tab: "Diamond", name: "Diamond Necklaces", image: catJewellerySets },
  { id: 18, tab: "Diamond", name: "Diamond Studs", image: catPendants },
  { id: 19, tab: "Diamond", name: "Best Sellers", image: catBangles },
  { id: 20, tab: "Diamond", name: "What's New", image: catMangalsutra },
];

const tabs = ["Earrings", "Bangles", "Casual wear", "Diamond"];

const CategoryGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Earrings");
  const [animating, setAnimating] = useState(false);

  const switchTab = (tab: string) => {
    if (tab === activeTab) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setAnimating(false);
    }, 200);
  };

  const filteredCategories = categoriesData.filter(cat => cat.tab === activeTab);

  return (
    <div id="categories-section" className="w-full px-4 mb-20 max-w-[1200px] mx-auto scroll-mt-24">
      {/* — Tab Bar — */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`
              px-4 md:px-8 py-1.5 md:py-2 font-sans text-[13px] md:text-[14px]
              font-medium transition-all duration-300 cursor-pointer rounded-sm
              border
              ${activeTab === tab
                ? 'text-white bg-[#5F1517] border-[#5F1517]'
                : 'text-[#5F1517] bg-transparent border-[#5F1517] hover:bg-[#5F1517]/5'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* — Category Grid (5 columns) — */}
      <div
        className={`grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 transition-opacity duration-200 ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {filteredCategories.map((cat, i) => (
          <a
            key={cat.id}
            href={`#explore-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
            className="group flex flex-col cursor-pointer no-underline"
            style={{ animationDelay: `${i * 50}ms`, animation: 'catFadeIn 0.3s ease-out forwards', opacity: 0 }}
          >
            {/* Image Frame - Perfectly Square */}
            <div className="w-full aspect-square overflow-hidden rounded-md border border-[#5F1517]/10 mb-3 shadow-sm">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            {/* Label */}
            <div className="text-center w-full">
              <h3 className="text-[#5F1517] font-sans font-medium text-[13px] md:text-[14px] group-hover:text-[#801416] transition-colors">
                {cat.name}
              </h3>
            </div>
          </a>
        ))}
      </div>

      <style>{`
        @keyframes catFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CategoryGrid;
