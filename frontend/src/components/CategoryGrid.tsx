import React, { useState } from 'react';

import catBangles from '../assets/gen/cat_bangles_1782214893370.png';
import catEarrings from '../assets/gen/cat_earrings_1782214875918.png';
import catJewellerySets from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import catMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';
import catPendants from '../assets/gen/cat_pendants_1782214847919.png';
import catRings from '../assets/gen/cat_rings_1782214860176.png';

const WHATSAPP = "919035085397";

const categoriesData = [
  // --- Necklaces ---
  { id: 1,  tab: "Necklaces",   name: "Temple Necklace",     image: catJewellerySets, wa: "Temple Necklace" },
  { id: 2,  tab: "Necklaces",   name: "Choker Set",           image: catMangalsutra,   wa: "Choker Set" },
  { id: 3,  tab: "Necklaces",   name: "Long Haaram",          image: catPendants,      wa: "Long Haaram" },
  { id: 4,  tab: "Necklaces",   name: "Layered Necklace",     image: catBangles,       wa: "Layered Necklace" },
  { id: 5,  tab: "Necklaces",   name: "Bridal Necklace",      image: catRings,         wa: "Bridal Necklace" },
  { id: 6,  tab: "Necklaces",   name: "Polki Necklace",       image: catEarrings,      wa: "Polki Necklace" },

  // --- Earrings ---
  { id: 7,  tab: "Earrings",    name: "Everyday Earrings",    image: catEarrings,      wa: "Everyday Earrings" },
  { id: 8,  tab: "Earrings",    name: "Jhumka Earrings",      image: catPendants,      wa: "Jhumka Earrings" },
  { id: 9,  tab: "Earrings",    name: "Stud Earrings",        image: catJewellerySets, wa: "Stud Earrings" },
  { id: 10, tab: "Earrings",    name: "Chandbali",            image: catBangles,       wa: "Chandbali Earrings" },
  { id: 11, tab: "Earrings",    name: "Hoop Earrings",        image: catMangalsutra,   wa: "Hoop Earrings" },
  { id: 12, tab: "Earrings",    name: "Statement Earrings",   image: catRings,         wa: "Statement Earrings" },

  // --- Bangles ---
  { id: 13, tab: "Bangles",     name: "Daily Wear Bangles",   image: catBangles,       wa: "Daily Wear Bangles" },
  { id: 14, tab: "Bangles",     name: "Bridal Bangles",       image: catMangalsutra,   wa: "Bridal Bangles" },
  { id: 15, tab: "Bangles",     name: "Kadas",                image: catJewellerySets, wa: "Kadas" },
  { id: 16, tab: "Bangles",     name: "Antique Bangles",      image: catPendants,      wa: "Antique Bangles" },
  { id: 17, tab: "Bangles",     name: "CZ Bangles",           image: catEarrings,      wa: "CZ Bangles" },
  { id: 18, tab: "Bangles",     name: "Diamond Bangles",      image: catRings,         wa: "Diamond Bangles" },

  // --- Rings ---
  { id: 19, tab: "Rings",       name: "Engagement Rings",     image: catRings,         wa: "Engagement Rings" },
  { id: 20, tab: "Rings",       name: "Diamond Rings",        image: catEarrings,      wa: "Diamond Rings" },
  { id: 21, tab: "Rings",       name: "Gold Bands",           image: catBangles,       wa: "Gold Bands" },
  { id: 22, tab: "Rings",       name: "Cocktail Rings",       image: catJewellerySets, wa: "Cocktail Rings" },
  { id: 23, tab: "Rings",       name: "Couple Rings",         image: catPendants,      wa: "Couple Rings" },
  { id: 24, tab: "Rings",       name: "Antique Rings",        image: catMangalsutra,   wa: "Antique Rings" },

  // --- Pendants ---
  { id: 25, tab: "Pendants",    name: "Gold Pendants",        image: catPendants,      wa: "Gold Pendants" },
  { id: 26, tab: "Pendants",    name: "Diamond Pendants",     image: catRings,         wa: "Diamond Pendants" },
  { id: 27, tab: "Pendants",    name: "God Pendants",         image: catEarrings,      wa: "God Pendants" },
  { id: 28, tab: "Pendants",    name: "Initial Pendants",     image: catJewellerySets, wa: "Initial Pendants" },
  { id: 29, tab: "Pendants",    name: "Locket Sets",          image: catBangles,       wa: "Locket Sets" },
  { id: 30, tab: "Pendants",    name: "Kundan Pendants",      image: catMangalsutra,   wa: "Kundan Pendants" },
];

const tabs = ["Necklaces", "Earrings", "Bangles", "Rings", "Pendants"];

const CategoryGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Necklaces");
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
    <div id="categories-section" className="w-full px-4 mb-16 max-w-[1200px] mx-auto scroll-mt-24">
      {/* — Tab Bar — */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`
              px-3 md:px-6 py-1.5 md:py-2 font-sans text-[12px] md:text-[13px]
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

      {/* — Category Grid — 3 cols mobile, 6 cols desktop — */}
      <div
        className={`grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 transition-opacity duration-200 ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {filteredCategories.map((cat, i) => (
          <a
            key={cat.id}
            href={`https://wa.me/${WHATSAPP}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20${encodeURIComponent(cat.wa)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col cursor-pointer no-underline"
            style={{ animationDelay: `${i * 50}ms`, animation: 'catFadeIn 0.3s ease-out forwards', opacity: 0 }}
          >
            {/* Image Frame */}
            <div className="w-full aspect-square overflow-hidden rounded-xl border border-[#5F1517]/10 mb-2 md:mb-3 shadow-sm bg-[#FFF9F2]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            {/* Label */}
            <div className="text-center w-full">
              <h3 className="text-[#5F1517] font-sans font-medium text-[11px] md:text-[13px] leading-tight group-hover:text-[#801416] transition-colors">
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
