import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown, MapPin, Heart, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/products/${id}`);
        setProduct(response.data);
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image */}
          <div className="bg-[#f8f8f8] rounded-xl p-8 relative flex items-center justify-center aspect-square md:aspect-auto md:h-[600px]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-400">No Image Available</div>
            )}
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#d1e8ff] text-[#004085] px-3 py-1.5 rounded text-sm font-medium">
              <Truck size={16} /> Express Delivery
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="bg-gray-200 p-2 rounded-full text-gray-500 hover:text-[#5F1517] transition-colors"><Heart size={20} /></button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-serif text-[#111] mb-2">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-4">{product.sku}</p>
            <a href="#details" className="text-[#801416] text-sm hover:underline mb-6 inline-flex items-center">
              See Product Details <ChevronDown size={14} className="ml-1" />
            </a>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-2xl font-bold text-[#111]">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.original_price && (
                <span className="text-gray-400 line-through text-lg">₹{product.original_price.toLocaleString('en-IN')}</span>
              )}
            </div>
            {product.discount_text && (
              <div className="text-green-600 font-bold text-sm mb-6">
                {product.discount_text}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-8">
              {product.ready_to_dispatch && (
                <div className="flex items-center gap-2 bg-[#fbe7e9] text-[#118eb3] px-3 py-2 rounded-md font-medium text-sm">
                   <Truck size={18} className="text-[#c1666b]" /> Ready to dispatch
                </div>
              )}
              {product.transit_insurance && (
                <div className="flex items-center gap-2 bg-[#fbe7e9] text-[#111] px-3 py-2 rounded-md font-medium text-sm">
                   <ShieldCheck size={18} className="text-[#c1666b]" /> Transit Insurance
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[#5F1517] font-medium mb-8">
              <div className="bg-[#fbe7e9] p-1.5 rounded-full"><span className="text-[#c1666b] font-bold px-1">₹</span></div>
              Price Break Up
            </div>

            <div className="border border-[#e5d3b3] rounded-lg p-4 mb-8 relative">
              <div className="absolute -top-3 left-4 bg-white px-2 text-[#5F1517] text-sm">Check Delivery Date</div>
              <div className="flex items-center justify-between">
                <input type="text" placeholder="PinCode" className="w-full outline-none text-gray-700 bg-transparent" />
                <MapPin className="text-[#801416]" size={20} />
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-[#c13041] hover:bg-[#a12331] text-white font-bold py-3.5 rounded flex items-center justify-center gap-2 transition-colors">
                <ShoppingBag size={20} /> Add to Cart
              </button>
              <button className="px-5 border border-[#e5d3b3] rounded text-gray-500 hover:text-[#5F1517] hover:border-[#5F1517] transition-colors">
                <Heart size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Price Breakup Table */}
        {product.price_breakup && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif text-[#111] mb-6 flex items-center gap-2 border-b pb-4">Price Breakup <ChevronDown size={20} /></h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFF7F2] text-[#111]">
                  <tr>
                    <th className="p-4 font-semibold">Component</th>
                    <th className="p-4 font-semibold">Rate</th>
                    <th className="p-4 font-semibold">Weight</th>
                    <th className="p-4 font-semibold">Value</th>
                    <th className="p-4 font-semibold">Discount</th>
                    <th className="p-4 font-semibold">Final Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 text-[#c13041] font-medium">Metal</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.metal_value?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b bg-gray-50/50">
                    <td className="p-4">Gold</td>
                    <td className="p-4">{product.price_breakup.gold_rate}</td>
                    <td className="p-4">{product.price_breakup.gold_weight}</td>
                    <td className="p-4">₹{product.price_breakup.metal_value?.toLocaleString('en-IN')}</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-[#c13041] font-medium">Stone</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.stone_value?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b bg-gray-50/50">
                    <td className="p-4">Colour Stone</td>
                    <td className="p-4">-</td>
                    <td className="p-4">{product.price_breakup.stone_weight}</td>
                    <td className="p-4">₹{product.price_breakup.stone_value?.toLocaleString('en-IN')}</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-[#c13041] font-medium">Making Charges</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.making_charges_value?.toLocaleString('en-IN')}</td>
                    <td className="p-4">₹{product.price_breakup.making_charges_discount?.toLocaleString('en-IN')}</td>
                    <td className="p-4">₹{product.price_breakup.making_charges_final?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b bg-gray-50/50">
                    <td className="p-4 text-[#c13041] font-medium">Sub Total</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.sub_total_value?.toLocaleString('en-IN')}</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.sub_total_final?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-[#c13041] font-medium">Tax (Gst)</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.tax_value?.toLocaleString('en-IN')}</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.tax_final?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-[#FFF7F2] font-semibold text-[#c13041]">
                    <td className="p-4">Grand Total</td>
                    <td className="p-4">-</td>
                    <td className="p-4">-</td>
                    <td className="p-4">₹{product.price_breakup.grand_total_value?.toLocaleString('en-IN')}</td>
                    <td className="p-4">₹{product.price_breakup.making_charges_discount?.toLocaleString('en-IN')}</td>
                    <td className="p-4">₹{product.price_breakup.grand_total_final?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Details Specs */}
        <div id="details" className="mt-16">
          <h2 className="text-2xl font-serif text-[#111] mb-6 flex items-center gap-2 border-b pb-4">Product Details <ChevronDown size={20} /></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Basic Info */}
            <div className="bg-[#FFF7F2] p-6 rounded">
              <h3 className="font-semibold text-[#111] border-b border-[#e5d3b3] pb-3 mb-4">Basic Information</h3>
              <div className="space-y-3 text-sm">
                {product.basic_info?.height && <div className="flex justify-between"><span className="text-gray-600">Height</span><span className="font-medium text-[#111]">{product.basic_info.height}</span></div>}
                {product.basic_info?.material && <div className="flex justify-between"><span className="text-gray-600">Material</span><span className="font-medium text-[#111]">{product.basic_info.material}</span></div>}
                {product.basic_info?.metal && <div className="flex justify-between"><span className="text-gray-600">Metal</span><span className="font-medium text-[#111]">{product.basic_info.metal}</span></div>}
                {product.basic_info?.metal_purity && <div className="flex justify-between"><span className="text-gray-600">Metal Purity</span><span className="font-medium text-[#111]">{product.basic_info.metal_purity}</span></div>}
                {product.basic_info?.width && <div className="flex justify-between"><span className="text-gray-600">Width</span><span className="font-medium text-[#111]">{product.basic_info.width}</span></div>}
                {product.basic_info?.approx_gross_weight && <div className="flex justify-between"><span className="text-gray-600">Approx Gross Weight(In g)</span><span className="font-medium text-[#111]">{product.basic_info.approx_gross_weight}</span></div>}
              </div>
            </div>

            {/* Stone Info */}
            <div className="bg-[#FFF7F2] p-6 rounded">
              <h3 className="font-semibold text-[#111] border-b border-[#e5d3b3] pb-3 mb-4">Stone Information</h3>
              <div className="space-y-3 text-sm">
                {product.stone_info?.stone_1_name && <div className="flex justify-between"><span className="text-gray-600">Stone 1 Name</span><span className="font-medium text-[#111]">{product.stone_info.stone_1_name}</span></div>}
                {product.stone_info?.stone_1_weight && <div className="flex justify-between"><span className="text-gray-600">Stone 1 Weight</span><span className="font-medium text-[#111]">{product.stone_info.stone_1_weight}</span></div>}
              </div>
            </div>

            {/* Other Info */}
            <div className="bg-[#FFF7F2] p-6 rounded">
              <h3 className="font-semibold text-[#111] border-b border-[#e5d3b3] pb-3 mb-4">Other Information</h3>
              <div className="space-y-3 text-sm">
                {product.other_info?.chain_included && <div className="flex justify-between"><span className="text-gray-600">Chain Included</span><span className="font-medium text-[#111]">{product.other_info.chain_included}</span></div>}
                {product.other_info?.earring_type && <div className="flex justify-between"><span className="text-gray-600">Earring Type</span><span className="font-medium text-[#111]">{product.other_info.earring_type}</span></div>}
                {product.other_info?.gold_certification && <div className="flex justify-between"><span className="text-gray-600">Gold Certification</span><span className="font-medium text-[#111]">{product.other_info.gold_certification}</span></div>}
                {product.other_info?.metal_finish && <div className="flex justify-between"><span className="text-gray-600">Metal Finish</span><span className="font-medium text-[#111]">{product.other_info.metal_finish}</span></div>}
                {product.other_info?.occasion && <div className="flex justify-between"><span className="text-gray-600">Occasion</span><span className="font-medium text-[#111]">{product.other_info.occasion}</span></div>}
              </div>
            </div>

            {/* Return Policy */}
            <div className="bg-[#FFF7F2] p-6 rounded">
              <h3 className="font-semibold text-[#c13041] border-b border-[#e5d3b3] pb-3 mb-4">Return Policy</h3>
              <div className="space-y-3 text-sm">
                {product.return_policy?.return_days && <div className="flex justify-between"><span className="text-gray-600">Return</span><span className="font-medium text-[#111]">{product.return_policy.return_days}</span></div>}
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
