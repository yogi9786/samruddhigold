import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import NewArrivalsHero from '../components/NewArrivalsHero';
import ScrollReveal from '../components/ScrollReveal';
import api, { getImageUrl } from '../api';
import { ShieldCheck, MessageSquare, ArrowRight, Award, Gem, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  discount_text?: string;
  image_url?: string;
  status?: string;
}

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const WHATSAPP_NUMBER = "919035085397";

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await api.get('/products');
        // Filter only active products
        const activeProds = response.data.filter((p: Product) => !p.status || p.status === 'active');
        // Reverse to show recent uploads first
        const sorted = [...activeProds].reverse();
        // Take top 8-12 for showcase
        setProducts(sorted.slice(0, 12));
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7F2] pb-16 lg:pb-0 overflow-x-hidden">
      <Header />

      {/* Hero Section with Scroll Zoom Animation */}
      <NewArrivalsHero products={products} />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* Recent Uploaded Products Section */}
        <section className="mb-20">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="block w-10 h-[1.5px] bg-[#D4AF37]" />
                <span className="font-sans text-[11px] text-[#D4AF37] tracking-[4px] uppercase font-semibold">
                  Curated Catalog
                </span>
                <span className="block w-10 h-[1.5px] bg-[#D4AF37]" />
              </div>
              <h2 className="font-serif text-3xl md:text-5xl text-[#5F1517] leading-tight mb-4">
                Recent Uploaded Products
              </h2>
              <p className="font-sans text-[13px] md:text-[15px] text-[#5F1517]/70 max-w-xl mx-auto leading-relaxed">
                Be the first to explore and possess our latest masterpieces, direct from our master craftsmen.
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1517]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white/40 border border-[#E5D3B3]/40 rounded-lg max-w-2xl mx-auto">
              <p className="font-serif text-xl text-[#5F1517]/70 mb-4">No recent arrivals available at this moment.</p>
              <Link to="/shop" className="text-[#D4AF37] underline hover:text-[#5F1517] font-medium transition-colors">
                Browse Shop All
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((product) => {
                const waMessage = `Hi Samruddhi Gold Palace, I am interested in your new arrival: ${product.name} (SKU: ${product.sku}). Please share more details.`;
                const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

                return (
                  <ScrollReveal key={product.id} delay={50}>
                    <div className="group flex flex-col bg-white rounded-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[#E5D3B3]/40 hover:border-[#5F1517] relative h-full">
                      
                      {/* Image Container */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={getImageUrl(product.image_url)} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-serif text-xs">
                            Awaiting Imagery
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span className="bg-[#5F1517] text-white text-[9px] font-semibold px-2.5 py-1 rounded-sm tracking-wider uppercase shadow-md">
                            New Arrival
                          </span>
                          {product.discount_text && (
                            <span className="bg-[#D4AF37] text-white text-[9px] font-semibold px-2.5 py-1 rounded-sm tracking-wider uppercase shadow-md">
                              {product.discount_text}
                            </span>
                          )}
                        </div>
                        
                        {/* Hover Overlay Button */}
                        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out hidden md:block">
                          <Link 
                            to={`/shop/${product.id}`}
                            className="block w-full bg-white/95 backdrop-blur text-[#5F1517] py-2.5 text-center text-[11px] font-bold uppercase tracking-widest hover:bg-[#5F1517] hover:text-white transition-colors duration-300 no-underline shadow-lg"
                          >
                            View Collection Details
                          </Link>
                        </div>
                      </div>
                      
                      {/* Content Container */}
                      <div className="p-3 md:p-5 flex flex-col flex-grow text-center relative z-10 bg-white">
                        <p className="text-gray-400 text-[9px] md:text-[10px] tracking-widest uppercase mb-1">{product.sku}</p>
                        
                        <h3 className="font-serif text-[#5F1517] text-xs md:text-base mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug font-medium">
                          <Link to={`/shop/${product.id}`} className="no-underline text-inherit">
                            {product.name}
                          </Link>
                        </h3>

                        <div className="mt-auto pt-2 flex flex-col gap-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[#5F1517] font-semibold text-sm md:text-lg">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.original_price && (
                              <span className="text-gray-400 line-through text-[11px] md:text-sm">
                                ₹{product.original_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          <a 
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2 px-3 hover:bg-[#20ba56] transition-colors text-xs font-bold uppercase tracking-wider no-underline shadow-sm hover:shadow-md"
                          >
                            <MessageSquare size={13} />
                            WhatsApp Inquiry
                          </a>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          <div className="mt-14 text-center">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-[#5F1517] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#4a1012] transition-colors duration-300 no-underline shadow-md hover:shadow-lg"
            >
              <span>Explore All Collections</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Unique Premium Showcase Section */}
        <section className="mb-14">
          <ScrollReveal>
            <div className="bg-[#5F1517] text-white border-2 border-[#D4AF37]/30 shadow-2xl overflow-hidden relative rounded-none p-6 md:p-12 lg:p-16">
              
              {/* Decorative background vectors/gradients */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-[#A56B25]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
                
                {/* Text and Features Column */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-[#D4AF37] w-5 h-5 animate-pulse" />
                    <span className="text-[#D4AF37] text-xs font-semibold tracking-[3px] uppercase font-sans">
                      SAMRUDDHI EXCLUSIVE
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl md:text-5xl text-[#FFF7F2] leading-[1.1] mb-6 font-normal">
                    Golden Flexi Scheme <br/>
                    <span className="text-[#D4AF37] font-serif italic">&amp; Bespoke Designs</span>
                  </h2>

                  <p className="font-sans text-[14px] md:text-[15px] text-[#FFF7F2]/80 mb-8 leading-relaxed max-w-xl">
                    Discover ultimate convenience and master craftsmanship tailored specifically for you. Secure your rate protection scheme or realize your custom design blueprints with our design team.
                  </p>

                  <div className="space-y-6">
                    {/* Feature 1 */}
                    <div className="flex gap-4 items-start">
                      <div className="bg-[#FFF7F2]/10 p-2.5 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                        <Award className="text-[#D4AF37] w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-[#FFF7F2] font-semibold mb-1">90-Day Gold Rate Protection</h4>
                        <p className="font-sans text-xs text-[#FFF7F2]/70 leading-relaxed">
                          Lock today's gold rate and safeguard your investment against market spikes. Pay in simple installments over 90 days.
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex gap-4 items-start">
                      <div className="bg-[#FFF7F2]/10 p-2.5 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                        <Gem className="text-[#D4AF37] w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-[#FFF7F2] font-semibold mb-1">Bespoke Royal Customizations</h4>
                        <p className="font-sans text-xs text-[#FFF7F2]/70 leading-relaxed">
                          Bring your own designs or brainstorm custom jewellery designs with our head designer to fabricate one-of-a-kind heirlooms.
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex gap-4 items-start">
                      <div className="bg-[#FFF7F2]/10 p-2.5 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="text-[#D4AF37] w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-[#FFF7F2] font-semibold mb-1">100% Certified Purity</h4>
                        <p className="font-sans text-xs text-[#FFF7F2]/70 leading-relaxed">
                          Every single item is BIS 916 Hallmarked and diamonds carry authoritative international lab certificates for complete peace of mind.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultation Card Column */}
                <div className="lg:col-span-5 w-full flex justify-center">
                  <div className="bg-[#FFF7F2] text-[#5F1517] p-8 border-t-4 border-[#D4AF37] shadow-xl w-full max-w-sm flex flex-col items-center text-center">
                    <span className="font-sans text-[10px] tracking-[4px] uppercase text-[#D4AF37] font-semibold mb-2 block">
                      Private Consult
                    </span>
                    <h3 className="font-serif text-2xl font-bold mb-4">Virtual Design Studio</h3>
                    <p className="font-sans text-xs text-[#5F1517]/80 leading-relaxed mb-6">
                      Schedule an exclusive digital tour or design walkthrough directly with our lead jewellery expert. Let's co-create your next treasure.
                    </p>

                    <div className="w-full flex flex-col gap-3">
                      <a 
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Samruddhi%20Gold%20Palace,%20I%20would%20like%20to%20book%20a%20Private%20Virtual%20Consultation%20with%20your%20jewellery%20designer.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#5F1517] text-white py-3 px-4 font-bold uppercase tracking-wider text-xs shadow-md hover:bg-[#4a1012] transition-colors duration-300 no-underline block w-full"
                      >
                        Book Designer Call
                      </a>
                      <a 
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Samruddhi%20Gold%20Palace,%20I'm%20interested%20in%20enrolling%20in%20your%20Rate%20Protection%20Gold%20Scheme.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent border border-[#5F1517] text-[#5F1517] py-3 px-4 font-bold uppercase tracking-wider text-xs hover:bg-[#5F1517]/5 transition-colors duration-300 no-underline block w-full"
                      >
                        Inquire Gold Scheme
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </section>

      </main>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default NewArrivals;
