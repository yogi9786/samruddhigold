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
      <div className="w-full bg-[#5F1517] text-white py-16 md:py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">About Siri Samruddhi Gold Palace</h1>
        <p className="text-lg md:text-xl text-[#FFF7F2]/80 max-w-3xl mx-auto">
          Crafting memories and celebrating traditions with purity and perfection since our inception.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif text-[#5F1517] mb-6">Our Legacy</h2>
          <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto text-lg">
            Siri Samruddhi Gold Palace is a trusted destination for exquisite gold and diamond jewellery. 
            Our commitment to quality, purity, and craftsmanship has made us a preferred choice for generations. 
            We offer a wide range of beautifully designed ornaments that blend traditional artistry with modern elegance, 
            perfect for every occasion. Discover the true essence of purity and elegance at Siri Samruddhi Gold Palace.
          </p>
        </div>

        {/* Branches Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#5F1517] mb-4">Our Branches</h2>
            <div className="w-24 h-1 bg-[#A56B25] mx-auto mb-6"></div>
            <p className="text-gray-600">Visit us at any of our branches to experience our exquisite collection firsthand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Yelahanka Branch */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
              <div className="h-64 overflow-hidden">
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
              <div className="h-64 overflow-hidden">
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
              <div className="h-64 overflow-hidden">
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
      </div>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default AboutUs;
