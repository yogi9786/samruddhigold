import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

import yelahankaImg from '../assets/yelahanka-branch-siri-samruddhi-1024x1024.jpg.webp';
import kolarImg from '../assets/kolar-branch-siri-samruddhi.jpg.webp';
import udupiImg from '../assets/udupi-branch-siri-samruddhi.jpg.webp';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FFF7F2] pb-16 lg:pb-0 overflow-x-hidden font-sans">
      <Header />
      
      {/* Hero Section */}
      <div className="w-full bg-[#5F1517] text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A56B25_1px,transparent_1px)] [background-size:20px_20px]" />
        <h1 className="text-4xl md:text-5xl font-serif mb-4 relative z-10">About Siri Samruddhi Gold Palace</h1>
        <p className="text-lg md:text-xl text-[#FFF7F2]/80 max-w-3xl mx-auto relative z-10">
          Crafting memories, building legacy, and celebrating traditions with purity and perfection.
        </p>
      </div>

      {/* Founder Section ("The Man Behind the Success") */}
      <div className="w-full bg-white py-16 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Founder Image Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-[#A56B25] via-[#FFF7F2] to-[#5F1517] shadow-2xl max-w-sm w-full aspect-[3/4] flex flex-col justify-between overflow-hidden">
              {/* Decorative Corner Borders */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#A56B25]" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#A56B25]" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#A56B25]" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#A56B25]" />
              
              {/* Inner Frame */}
              <div className="flex-grow m-2 rounded-xl bg-[#5F1517] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                {/* Subtle gold grid overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A56B25_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Golden Silhouette / Monogram */}
                <div className="w-28 h-28 rounded-full border-4 border-[#A56B25] bg-gradient-to-b from-[#A56B25]/20 to-[#A56B25]/5 flex items-center justify-center mb-6 shadow-inner relative z-10">
                  <span className="text-4xl font-serif text-[#FFF7F2] font-semibold tracking-widest">SVM</span>
                </div>
                
                <h3 className="text-2xl font-serif text-white mb-1 relative z-10">Samruddhi V. Manjunath</h3>
                <p className="text-[#FFF7F2]/75 text-xs font-light tracking-widest uppercase relative z-10">Visionary Founder</p>
                <div className="w-12 h-[1px] bg-[#A56B25] my-4 relative z-10" />
                <p className="text-xs text-[#FFF7F2]/70 italic max-w-xs relative z-10 px-2 leading-relaxed">
                  "Gold is for everyone, and the world is ours to conquer."
                </p>
              </div>
            </div>
          </div>
          
          {/* Right: Founder Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-semibold tracking-widest text-[#A56B25] uppercase">The Visionary Mindset</span>
              <h2 className="text-3xl lg:text-4xl font-serif text-[#5F1517]">The Man Behind the Success</h2>
              <div className="w-20 h-1 bg-[#A56B25]" />
            </div>
            
            <p className="text-gray-700 leading-relaxed text-lg">
              From a middle-class family rose a man with an extraordinary dream. <strong>Samruddhi V. Manjunath</strong>, the visionary founder of Sirisamruddhi Gold Palace, proved that success is not reserved for the elite or family legacies.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Starting his journey in the banking sector, conquering the real estate industry, and finally stepping into the gold business, he showed the world that when passion meets perseverance, limits disappear.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              In just two years, he turned his dream into a golden reality—with successful showrooms in Bengaluru and Kolar, and now, the third grand milestone in the cultural city of Udupi, Karnataka. 
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              His vision remains simple yet powerful: quality gold should be accessible to everyone, and there are no boundaries to what determination can achieve.
            </p>
            
            <div className="p-6 bg-[#FFF7F2] border-l-4 border-[#A56B25] rounded-r-xl shadow-sm">
              <p className="text-[#5F1517] font-serif italic text-lg mb-2">
                "Udupi today… the world tomorrow. The future will shine in the name of Sirisamruddhi."
              </p>
              <span className="text-sm font-semibold text-gray-600">— Samruddhi V. Manjunath</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: The Beginning (Yelahanka) */}
      <div className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-semibold tracking-widest text-[#A56B25] uppercase">2020: The Spark</span>
              <h2 className="text-3xl lg:text-4xl font-serif text-[#5F1517]">Sirisamruddhi – The Beginning</h2>
              <div className="w-20 h-1 bg-[#A56B25]" />
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              In the year 2020, a vision was born in Yelahanka, Bengaluru—a vision of gold that was not bound only to dynasties, family names, or the privileged few. It was a vision carried by a dreamer, a believer, and a doer: Mr. Samruddhi V. Manjunath.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Coming from a lower-middle-class background, he knew what dreams truly meant. They weren’t just about wealth, but about creating value, trust, and dignity. With courage in his heart and a fire in his eyes, he stepped into the world of gold, determined to prove that this business is for anyone who dares to dream big.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-serif text-[#A56B25] font-semibold mb-1 text-sm">Versatile Designs</h4>
                <p className="text-xs text-gray-600">From low-weight antique jewelry to modern, fashion-forward masterpieces.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-serif text-[#A56B25] font-semibold mb-1 text-sm">Uncompromised Purity</h4>
                <p className="text-xs text-gray-600">Every single jewel carries the promise of purity and certified perfection.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-serif text-[#A56B25] font-semibold mb-1 text-sm">Heartfelt Service</h4>
                <p className="text-xs text-gray-600">We don’t just sell ornaments; we build lifelong relationships of trust.</p>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed pt-2">
              From brides seeking traditional grace to youth looking for trendy lightweight elegance, Sirisamruddhi became a destination for every heart. It stands as a living testimony that when passion meets persistence, greatness is not far behind.
            </p>
          </div>
          
          {/* Right: Yelahanka Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-md w-full">
              {/* Elegant Gold Border Frame behind image */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-[#A56B25] to-[#F3C68F] opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl aspect-square">
                <img 
                  src={yelahankaImg} 
                  alt="Yelahanka Showroom" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <p className="text-white font-serif text-xl">The First Milestone</p>
                    <p className="text-white/80 text-xs">Yelahanka, Bengaluru (Est. 2020)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: The Momentous Leap (Kolar & Udupi) */}
      <div className="w-full bg-white py-16 px-4 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Kolar & Udupi Images Overlapping/Grid */}
          <div className="lg:col-span-5 order-last lg:order-first flex justify-center">
            <div className="relative w-full max-w-md h-[340px] flex items-center justify-center">
              {/* Kolar Branch (Back/Left) */}
              <div className="absolute left-4 top-4 w-2/3 aspect-[4/3] rounded-xl overflow-hidden border-4 border-white shadow-lg z-10 transform -rotate-3 hover:rotate-0 hover:z-30 hover:scale-105 transition-all duration-300">
                <img 
                  src={kolarImg} 
                  alt="Kolar Showroom" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-3 text-center">
                  <span className="text-[10px] text-white font-serif uppercase tracking-widest">Kolar Mega Mall</span>
                </div>
              </div>
              
              {/* Udupi Branch (Front/Right) */}
              <div className="absolute right-4 bottom-4 w-2/3 aspect-[4/3] rounded-xl overflow-hidden border-4 border-white shadow-xl z-20 transform rotate-3 hover:rotate-0 hover:z-30 hover:scale-105 transition-all duration-300">
                <img 
                  src={udupiImg} 
                  alt="Udupi Showroom" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-3 text-center">
                  <span className="text-[10px] text-white font-serif uppercase tracking-widest">Udupi Showroom</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-semibold tracking-widest text-[#A56B25] uppercase">Expanding the Palace</span>
              <h2 className="text-3xl lg:text-4xl font-serif text-[#5F1517]">The Momentous Leap</h2>
              <div className="w-20 h-1 bg-[#A56B25]" />
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              Following the success of Yelahanka, customers from all walks of life validated our core values of trust, transparency, and tradition. Within just two years, Sirisamruddhi Gold Palace made a momentous leap to Kolar, unveiling one of the region's largest and most grand gold shopping destinations.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              This journey of trust has now crossed another milestone, spreading its wings to the cultural coastal city of Udupi, Karnataka, offering a premier destination for jewelry lovers.
            </p>

            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <span className="text-[#A56B25] text-lg font-bold">✓</span>
                <p className="text-gray-700 text-sm">
                  <strong>Multiple Gold Saving Plans:</strong> Helping families plan for their future by turning small savings into shining treasures.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#A56B25] text-lg font-bold">✓</span>
                <p className="text-gray-700 text-sm">
                  <strong>Trendsetting Collections:</strong> Ranging from classic heritage antique styles to modern everyday lightweight designs.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#A56B25] text-lg font-bold">✓</span>
                <p className="text-gray-700 text-sm">
                  <strong>Customer-Centric Royalty:</strong> Where every visitor is treated with transparency, warmth, and respect.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Branches Directory / Maps Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-serif text-[#5F1517] mb-4">Our Locations</h2>
          <div className="w-24 h-1 bg-[#A56B25] mx-auto mb-6"></div>
          <p className="text-gray-600">Find the nearest Sirisamruddhi Gold Palace branch and visit us today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          
          {/* Yelahanka Branch */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="h-56 overflow-hidden">
              <img src={yelahankaImg} alt="Yelahanka Branch" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-2xl font-serif text-[#5F1517] mb-2">Yelahanka Branch</h3>
              <p className="text-gray-600 text-sm mb-6 flex-grow">
                1271/A, Chikkabommasandra Circle, Yelahanka New Town Bus Stand Main Road, 16th B Main Road, Bengaluru, Karnataka – 560064
              </p>
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <iframe 
                  src="https://maps.google.com/maps?q=13.100477,77.574436&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Kolar Branch */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="h-56 overflow-hidden">
              <img src={kolarImg} alt="Kolar Branch" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-2xl font-serif text-[#5F1517] mb-2">Kolar Branch</h3>
              <p className="text-gray-600 text-sm mb-6 flex-grow">
                Visit our beautiful Kolar branch for the finest selection of traditional and contemporary jewellery.
              </p>
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <iframe 
                  src="https://maps.google.com/maps?q=Siri+Samruddhi+Gold+Palace+Kolar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Udupi Branch */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="h-56 overflow-hidden">
              <img src={udupiImg} alt="Udupi Branch" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-2xl font-serif text-[#5F1517] mb-2">Udupi Branch</h3>
              <p className="text-gray-600 text-sm mb-6 flex-grow">
                Sri Siri Samruddhi Gold Palace, Udupi Karkala Road, Bailoor, Udupi - 574102, near Bailoor Junction
              </p>
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <iframe 
                  src="https://maps.google.com/maps?q=13.216861,76.165533&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default AboutUs;
