import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Truck, RefreshCw, ShieldCheck, Clock } from 'lucide-react';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col font-outfit text-gray-800">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#5F1517] text-[#FFF7F2] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">Shipping & Returns</h1>
        <p className="text-lg md:text-xl font-light opacity-90 max-w-2xl mx-auto">
          We ensure that every precious piece you order reaches you safely, securely, and swiftly.
        </p>
      </div>

      <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl space-y-20">
        
        {/* Quick Delivery Section */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFF7F2] text-[#801416] px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase">
                <Truck size={18} className="text-[#A56B25]" /> Quick Delivery
              </div>
              <h2 className="text-3xl font-serif text-[#5F1517]">Express Shipping for Selected PIN Codes</h2>
              <p className="text-gray-600 leading-relaxed">
                Need your jewellery sooner for a special occasion? We offer <strong>Quick Delivery</strong> on selected ready-to-dispatch items. Orders placed before 2:00 PM are processed the same day and delivered within 24-48 hours in eligible cities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#FFF7F2] text-[#A56B25] flex items-center justify-center shrink-0">✓</div>
                  <span>Available in Bengaluru, Kolar, and Udupi</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#FFF7F2] text-[#A56B25] flex items-center justify-center shrink-0">✓</div>
                  <span>Fully insured transit</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#FFF7F2] text-[#A56B25] flex items-center justify-center shrink-0">✓</div>
                  <span>Real-time tracking available</span>
                </li>
              </ul>
            </div>
            
            <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
               <div className="bg-[#FFF7F2] p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                  <Clock size={32} className="text-[#A56B25]" />
                  <span className="font-semibold text-[#5F1517]">24-48 Hrs<br/><span className="text-sm font-normal opacity-80">Delivery</span></span>
               </div>
               <div className="bg-[#FFF7F2] p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                  <ShieldCheck size={32} className="text-[#A56B25]" />
                  <span className="font-semibold text-[#5F1517]">100%<br/><span className="text-sm font-normal opacity-80">Insured</span></span>
               </div>
            </div>
          </div>
        </section>

        {/* General Shipping Info */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-[#5F1517] mb-4">General Shipping Information</h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFF7F2] rounded-full flex items-center justify-center mb-6">
                <Truck size={28} className="text-[#A56B25]" />
              </div>
              <h3 className="text-lg font-bold text-[#5F1517] mb-3">Free Shipping</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We offer free shipping on all orders across India. No hidden charges. What you see is what you pay.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFF7F2] rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={28} className="text-[#A56B25]" />
              </div>
              <h3 className="text-lg font-bold text-[#5F1517] mb-3">100% Insured</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your purchase is fully insured during transit. We take full responsibility until the package is safely handed over to you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFF7F2] rounded-full flex items-center justify-center mb-6">
                <Clock size={28} className="text-[#A56B25]" />
              </div>
              <h3 className="text-lg font-bold text-[#5F1517] mb-3">Delivery Time</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Standard delivery takes 5-7 business days for ready-to-ship items. Custom orders may take 15-20 days depending on the design.
              </p>
            </div>
          </div>
        </section>

        {/* Returns Policy */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-shrink-0">
               <div className="w-20 h-20 bg-[#FFF7F2] rounded-2xl flex items-center justify-center">
                 <RefreshCw size={40} className="text-[#A56B25]" />
               </div>
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-serif text-[#5F1517]">15-Day Return & Exchange Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We want you to love your jewellery. If for any reason you are not completely satisfied, we offer a hassle-free 15-day return and exchange policy from the date of delivery.
              </p>
              
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-[#5F1517]">Conditions for Return:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                  <li>The item must be unused and in its original condition.</li>
                  <li>All tags, certificates, and packaging must be intact and returned.</li>
                  <li>Customized or engraved items are not eligible for return.</li>
                  <li>Gold coins and silver articles are exchangeable but not refundable.</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-500 italic">
                * Please note that return shipping charges will be borne by the customer unless the product received was defective or incorrect.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
