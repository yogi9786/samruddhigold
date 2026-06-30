import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown, MapPin, Heart, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        if (response.data.image_url) {
          setSelectedImage(response.data.image_url);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7F2]">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F1517]"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7F2]">
        <Header />
        <div className="flex-grow flex justify-center items-center text-xl text-[#5F1517]">
          Product not found
        </div>
      </div>
    );
  }

  const galleryImages = product.gallery_urls || (product.image_url ? [product.image_url] : []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-16 pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-none shadow-xl border border-[var(--color-soft-gold)]/20 p-8 relative flex items-center justify-center aspect-square md:h-[700px] overflow-hidden group">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              ) : (
                <div className="text-gray-400 font-serif">No Image Available</div>
              )}
              
              {/* Top badges */}
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-[var(--color-royal)] text-white px-4 py-2 text-xs font-semibold tracking-wider uppercase shadow-md">
                <Truck size={16} /> Express Delivery
              </div>
              
              <div className="absolute top-6 right-6 flex gap-2">
                <button className="bg-white/80 backdrop-blur p-3 rounded-full text-gray-500 hover:text-[var(--color-royal)] hover:shadow-lg transition-all duration-300">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {galleryImages.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-24 h-24 flex-shrink-0 bg-white border-2 overflow-hidden transition-all duration-300 ${
                      selectedImage === img ? 'border-[var(--color-royal)] opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} - view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col pt-4">
            <p className="text-[var(--color-text-dark)]/50 tracking-widest text-sm uppercase mb-3">{product.sku}</p>
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-luxury)] mb-6 leading-tight">{product.name}</h1>
            
            <a href="#details" className="text-[var(--color-royal)] text-sm font-semibold tracking-wide hover:underline mb-8 inline-flex items-center uppercase">
              View Specifications <ChevronDown size={14} className="ml-1" />
            </a>

            <div className="flex flex-col gap-2 mb-8 bg-white p-6 border border-[var(--color-soft-gold)]/30 shadow-sm">
              <div className="flex items-end gap-4">
                <span className="text-3xl font-bold text-[var(--color-luxury)]">₹{product.price?.toLocaleString('en-IN')}</span>
                {product.original_price && (
                  <span className="text-gray-400 line-through text-lg mb-1">₹{product.original_price.toLocaleString('en-IN')}</span>
                )}
              </div>
              {product.discount_text && (
                <div className="text-[var(--color-royal)] font-bold text-sm tracking-wider uppercase">
                  {product.discount_text}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Prices are inclusive of all taxes.</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
              {product.ready_to_dispatch && (
                <div className="flex items-center gap-2 border border-[var(--color-primary)] text-[var(--color-luxury)] px-4 py-2.5 bg-white text-sm tracking-wide uppercase font-medium shadow-sm">
                   <Truck size={18} className="text-[var(--color-primary)]" /> Ready to dispatch
                </div>
              )}
              {product.transit_insurance && (
                <div className="flex items-center gap-2 border border-[var(--color-primary)] text-[var(--color-luxury)] px-4 py-2.5 bg-white text-sm tracking-wide uppercase font-medium shadow-sm">
                   <ShieldCheck size={18} className="text-[var(--color-primary)]" /> Transit Insurance
                </div>
              )}
            </div>

            <div className="border border-[var(--color-soft-gold)]/50 rounded-none p-6 mb-10 relative bg-white shadow-sm">
              <div className="absolute -top-3 left-6 bg-white px-3 text-[var(--color-royal)] text-xs font-bold uppercase tracking-wider">Check Delivery Date</div>
              <div className="flex items-center justify-between">
                <input type="text" placeholder="Enter PIN Code" className="w-full outline-none text-gray-700 bg-transparent placeholder-gray-400" />
                <MapPin className="text-[var(--color-royal)]" size={20} />
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-[var(--color-luxury)] hover:bg-black text-white font-semibold py-4 uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors shadow-lg">
                <ShoppingBag size={18} /> Add to Bag
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
               <p className="text-sm text-gray-500 leading-relaxed font-light">
                 Need assistance? Contact our jewelry experts at <span className="text-[var(--color-luxury)] font-medium">1-800-GOLD-PALACE</span>.
               </p>
            </div>
          </div>
        </div>

        {/* Price Breakup Table */}
        {product.price_breakup && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-[var(--color-luxury)] mb-4 tracking-wide">Transparent Pricing</h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto"></div>
            </div>
            <div className="overflow-x-auto bg-white shadow-xl border border-[var(--color-soft-gold)]/30">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--color-luxury)] text-white uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-5 font-semibold">Component</th>
                    <th className="p-5 font-semibold">Rate</th>
                    <th className="p-5 font-semibold">Weight</th>
                    <th className="p-5 font-semibold text-right">Value</th>
                    <th className="p-5 font-semibold text-right">Discount</th>
                    <th className="p-5 font-semibold text-right">Final Value</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-[var(--color-royal)] font-semibold tracking-wide">Gold</td>
                    <td className="p-5">{product.price_breakup.gold_rate}</td>
                    <td className="p-5">{product.price_breakup.gold_weight}</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.metal_value?.toLocaleString('en-IN')}</td>
                    <td className="p-5 text-right">-</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.metal_value?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-[var(--color-royal)] font-semibold tracking-wide">Colour Stone</td>
                    <td className="p-5">-</td>
                    <td className="p-5">{product.price_breakup.stone_weight}</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.stone_value?.toLocaleString('en-IN')}</td>
                    <td className="p-5 text-right">-</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.stone_value?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-[var(--color-royal)] font-semibold tracking-wide">Making Charges</td>
                    <td className="p-5">-</td>
                    <td className="p-5">-</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.making_charges_value?.toLocaleString('en-IN')}</td>
                    <td className="p-5 text-right text-green-600">₹{product.price_breakup.making_charges_discount?.toLocaleString('en-IN')}</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.making_charges_final?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-[var(--color-luxury)] font-bold tracking-wide">Sub Total</td>
                    <td className="p-5">-</td>
                    <td className="p-5">-</td>
                    <td className="p-5 text-right font-bold text-[var(--color-luxury)]">₹{product.price_breakup.sub_total_value?.toLocaleString('en-IN')}</td>
                    <td className="p-5 text-right">-</td>
                    <td className="p-5 text-right font-bold text-[var(--color-luxury)]">₹{product.price_breakup.sub_total_final?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-[var(--color-royal)] font-semibold tracking-wide">GST (Tax)</td>
                    <td className="p-5">-</td>
                    <td className="p-5">-</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.tax_value?.toLocaleString('en-IN')}</td>
                    <td className="p-5 text-right">-</td>
                    <td className="p-5 text-right font-medium">₹{product.price_breakup.tax_final?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-[#fcf8f2] text-[var(--color-royal)] font-bold text-base border-t-2 border-[var(--color-soft-gold)]">
                    <td className="p-6">GRAND TOTAL</td>
                    <td className="p-6">-</td>
                    <td className="p-6">-</td>
                    <td className="p-6 text-right">₹{product.price_breakup.grand_total_value?.toLocaleString('en-IN')}</td>
                    <td className="p-6 text-right text-green-600">₹{product.price_breakup.making_charges_discount?.toLocaleString('en-IN')}</td>
                    <td className="p-6 text-right text-xl">₹{product.price_breakup.grand_total_final?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Details Specs */}
        <div id="details" className="mt-24 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-[var(--color-luxury)] mb-4 tracking-wide">Jewelry Specifications</h2>
            <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            
            {/* Basic Info */}
            <div className="bg-white p-8 shadow-md border-t-4 border-[var(--color-soft-gold)] hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-semibold text-[var(--color-royal)] text-sm tracking-widest uppercase mb-6">Basic Information</h3>
              <div className="space-y-4 text-sm font-light">
                {product.basic_info?.height && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Height</span><span className="font-medium text-[var(--color-luxury)]">{product.basic_info.height}</span></div>}
                {product.basic_info?.material && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Material</span><span className="font-medium text-[var(--color-luxury)]">{product.basic_info.material}</span></div>}
                {product.basic_info?.metal && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Metal</span><span className="font-medium text-[var(--color-luxury)]">{product.basic_info.metal}</span></div>}
                {product.basic_info?.metal_purity && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Metal Purity</span><span className="font-medium text-[var(--color-luxury)]">{product.basic_info.metal_purity}</span></div>}
                {product.basic_info?.width && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Width</span><span className="font-medium text-[var(--color-luxury)]">{product.basic_info.width}</span></div>}
                {product.basic_info?.approx_gross_weight && <div className="flex justify-between pb-2"><span className="text-gray-500">Gross Wt. (g)</span><span className="font-medium text-[var(--color-luxury)]">{product.basic_info.approx_gross_weight}</span></div>}
              </div>
            </div>

            {/* Stone Info */}
            <div className="bg-white p-8 shadow-md border-t-4 border-[var(--color-soft-gold)] hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-semibold text-[var(--color-royal)] text-sm tracking-widest uppercase mb-6">Stone Details</h3>
              <div className="space-y-4 text-sm font-light">
                {product.stone_info?.stone_1_name && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Stone 1</span><span className="font-medium text-[var(--color-luxury)]">{product.stone_info.stone_1_name}</span></div>}
                {product.stone_info?.stone_1_weight && <div className="flex justify-between pb-2"><span className="text-gray-500">Stone 1 Wt.</span><span className="font-medium text-[var(--color-luxury)]">{product.stone_info.stone_1_weight}</span></div>}
              </div>
            </div>

            {/* Other Info */}
            <div className="bg-white p-8 shadow-md border-t-4 border-[var(--color-soft-gold)] hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-semibold text-[var(--color-royal)] text-sm tracking-widest uppercase mb-6">Other Information</h3>
              <div className="space-y-4 text-sm font-light">
                {product.other_info?.chain_included && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Chain Included</span><span className="font-medium text-[var(--color-luxury)]">{product.other_info.chain_included}</span></div>}
                {product.other_info?.earring_type && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Earring Type</span><span className="font-medium text-[var(--color-luxury)]">{product.other_info.earring_type}</span></div>}
                {product.other_info?.gold_certification && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Certification</span><span className="font-medium text-[var(--color-luxury)]">{product.other_info.gold_certification}</span></div>}
                {product.other_info?.metal_finish && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Metal Finish</span><span className="font-medium text-[var(--color-luxury)]">{product.other_info.metal_finish}</span></div>}
                {product.other_info?.occasion && <div className="flex justify-between pb-2"><span className="text-gray-500">Occasion</span><span className="font-medium text-[var(--color-luxury)]">{product.other_info.occasion}</span></div>}
              </div>
            </div>

            {/* Return Policy */}
            <div className="bg-[#111] p-8 shadow-md hover:-translate-y-1 transition-transform duration-300 text-white">
              <h3 className="font-semibold text-[var(--color-primary)] text-sm tracking-widest uppercase mb-6">Return Policy</h3>
              <div className="space-y-4 text-sm font-light">
                {product.return_policy?.return_days && (
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400">Standard Returns</span>
                    <span className="font-medium text-white text-lg">{product.return_policy.return_days}</span>
                  </div>
                )}
                <p className="text-gray-400 mt-4 text-xs leading-relaxed">
                  All our pieces are crafted with extreme care. Please retain the original packaging and certification for returns.
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
