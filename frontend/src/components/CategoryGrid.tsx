import React, { useState, useEffect } from 'react';

// Import local generated category images
import catBangles from '../assets/gen/cat_bangles_1782214893370.png';
import catEarrings from '../assets/gen/cat_earrings_1782214875918.png';
import catJewellerySets from '../assets/gen/cat_jewellery_sets_1782214836263.png';
import catMangalsutra from '../assets/gen/cat_mangalsutra_1782214906170.png';
import catPendants from '../assets/gen/cat_pendants_1782214847919.png';
import catRings from '../assets/gen/cat_rings_1782214860176.png';

const categoriesData = [
  // --- GOLD ---
  { id: 1, tab: "Gold", name: "Gold Necklaces", image: "/images/gallery/gold_necklace_close.png" },
  { id: 2, tab: "Gold", name: "Gold Rings", image: catRings },
  { id: 3, tab: "Gold", name: "Gold Earrings", image: "/images/gallery/gold_earring_close.png" },
  { id: 4, tab: "Gold", name: "Gold Bangles", image: "/images/gallery/indian_gold_bangle.png" },
  { id: 5, tab: "Gold", name: "Gold Chains", image: "/images/gallery/chunky_gold_chain.png" },
  { id: 6, tab: "Gold", name: "Gold Pendants", image: catPendants },

  // --- SILVER ---
  { id: 7, tab: "Silver", name: "Silver Anklets", image: "/images/gallery/gold_bracelet_hand.png" },
  { id: 8, tab: "Silver", name: "Silver Rings", image: catRings },
  { id: 9, tab: "Silver", name: "Silver Bracelets", image: catBangles },
  { id: 10, tab: "Silver", name: "Silver Chains", image: "/images/gallery/chunky_gold_chain.png" },
  { id: 11, tab: "Silver", name: "Silver Earrings", image: catEarrings },
  { id: 12, tab: "Silver", name: "Pooja Articles", image: "/images/gallery/indian_polki_necklace.png" },

  // --- DIAMOND ---
  { id: 13, tab: "Diamond", name: "Diamond Rings", image: "/images/gallery/diamond_ring_close.png" },
  { id: 14, tab: "Diamond", name: "Diamond Necklaces", image: catJewellerySets },
  { id: 15, tab: "Diamond", name: "Diamond Earrings", image: catEarrings },
  { id: 16, tab: "Diamond", name: "Diamond Bracelets", image: catBangles },
  { id: 17, tab: "Diamond", name: "Diamond Pendants", image: catPendants },
  { id: 18, tab: "Diamond", name: "Mangalsutra", image: catMangalsutra },

  // --- WEDDING SET ---
  { id: 19, tab: "Wedding Set", name: "Bridal Haar", image: "/images/gallery/south_indian_lakshmi_haar.png" },
  { id: 20, tab: "Wedding Set", name: "Kundan Vanki", image: "/images/gallery/south_indian_kundan_vanki.png" },
  { id: 21, tab: "Wedding Set", name: "Maang Tikka", image: "/images/gallery/traditional_jhumka.png" },
  { id: 22, tab: "Wedding Set", name: "Heavy Jhumkas", image: "/images/gallery/traditional_jhumka.png" },
  { id: 23, tab: "Wedding Set", name: "Mango Mala", image: "/images/gallery/south_indian_mango_mala.png" },
  { id: 24, tab: "Wedding Set", name: "Waist Belt", image: "/images/gallery/indian_gold_bangle.png" },
];

const WHATSAPP_NUMBER = "919900000000"; // General business whatsapp number placeholder

const CategoryGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Gold");
  
  const tabs = ["Gold", "Silver", "Diamond", "Wedding Set"];

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#gold') {
        setActiveTab('Gold');
        document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#silver') {
        setActiveTab('Silver');
        document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#diamond') {
        setActiveTab('Diamond');
        document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#wedding-set') {
        setActiveTab('Wedding Set');
        document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check in case page loaded with a hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Filter the items based on the selected tab
  const filteredCategories = categoriesData.filter(cat => cat.tab === activeTab);

  return (
    <div id="categories-section" className="w-full px-4 mb-16 max-w-[1400px] mx-auto scroll-mt-24">
      
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-5 mb-10 md:mb-14">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-full font-sans text-[14px] md:text-[15px] font-semibold border-2 transition-all duration-300 shadow-sm cursor-pointer ${
              activeTab === tab 
                ? 'bg-[#5F1517] text-white border-[#5F1517]' 
                : 'bg-transparent text-[#5F1517] border-[#5F1517] hover:bg-[#5F1517] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid displaying 6 items for the active tab */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 min-h-[500px]">
        {filteredCategories.map((cat) => (
          <a 
            key={cat.id} 
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20am%20interested%20in%20viewing%20or%20purchasing%20designs%20from%20the%20${encodeURIComponent(cat.name)}%20collection.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group cursor-pointer animate-fade-in no-underline"
          >
            <div className="w-full aspect-[16/10] sm:aspect-[3/2] overflow-hidden rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#5F1517]/10 relative">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110A08]/60 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h3 className="mt-5 text-[#5F1517] font-serif font-bold text-[18px] md:text-[22px] transition-colors text-center group-hover:text-[#801416]">
              {cat.name}
            </h3>
            <div className="w-0 h-[2px] bg-[#D4AF37] mt-2 transition-all duration-500 ease-out group-hover:w-12 shadow-sm" />
          </a>
        ))}
      </div>
      
      <div className="flex justify-center mt-12 md:mt-16">
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20would%20like%20to%20explore%20your%20entire%20${encodeURIComponent(activeTab)}%20Collection.`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-[#5F1517] text-[#5F1517] hover:bg-[#5F1517] hover:text-white transition-colors duration-300 px-10 py-3.5 rounded-full font-sans font-bold text-[13px] tracking-[1.5px] uppercase bg-transparent hover:shadow-md no-underline flex items-center justify-center"
        >
          Explore {activeTab} Collection
        </a>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CategoryGrid;
