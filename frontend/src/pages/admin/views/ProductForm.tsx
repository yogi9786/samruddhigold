import React from 'react';
import type { Section, Category } from '../types';
import { Alert, SCard, Field, ImgUpload } from '../components/UIComponents';
import { Link as LinkIcon, Image as ImageIcon, Ruler, Gem, Calculator, DollarSign, Package, FileText } from 'lucide-react';
import { getImageUrl } from '../../../api';

interface ProductFormProps {
  editPId: string | null;
  setSection: (s: Section) => void;
  setEditPId: (id: string | null) => void;
  setPForm: React.Dispatch<React.SetStateAction<any>>;
  emptyProduct: any;
  setPMsg: (msg: any) => void;
  hasSnapshot: boolean;
  handleRollbackProduct: () => void;
  pMsg: {text: string, type: string};
  handlePSubmit: (e: React.FormEvent) => void;
  pForm: any;
  handlePInput: (e: React.ChangeEvent<any>) => void;
  categories: Category[];
  uploadMain: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingMain: boolean;
  uploadGallery: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingGallery: boolean;
  fetchProducts: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  editPId, setSection, setEditPId, setPForm, emptyProduct, setPMsg, hasSnapshot,
  handleRollbackProduct, pMsg, handlePSubmit, pForm, handlePInput, categories,
  uploadMain, uploadingMain, uploadGallery, uploadingGallery, fetchProducts
}) => {
// ─── ADD / EDIT PRODUCT ───────────────────────────────────────────────────────
  
    const selectedCat = categories.find(c => c.id === pForm.category_id);
    const catNameLower = selectedCat ? selectedCat.name.toLowerCase() : '';
    const isRing = catNameLower.includes('ring');
    const isBangle = catNameLower.includes('bangle') || catNameLower.includes('kangan') || catNameLower.includes('kada');
    const isChain = catNameLower.includes('chain') || catNameLower.includes('necklace') || catNameLower.includes('mangalsutra');

      return (
      <div className="animate-fade-in pb-10">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <button onClick={() => { setSection('all-products'); setEditPId(null); setPForm({ ...emptyProduct }); }}
            className="p-2 text-[#5F1517]/50 hover:text-[#5F1517] bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] shadow-sm rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{editPId ? 'Edit Product' : 'Add New Product'}</h2>
            {editPId && <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F1517]/40 mt-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>ID: {editPId}</span>}
          </div>
          <div className="ml-auto flex gap-3">
            {editPId && hasSnapshot && (
              <button type="button" onClick={handleRollbackProduct}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[#D4AF37] hover:text-[#5F1517] transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                ↩ Revert
              </button>
            )}
            <button onClick={fetchProducts} className="px-3 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 rounded-xl hover:border-[#D4AF37] hover:text-[#5F1517] transition" title="Refresh Data">↺</button>
          </div>
        </div>
        
        <Alert msg={pMsg} />
        
        <form onSubmit={handlePSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* General Info */}
              <SCard icon={<FileText />} title="General Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Product Title" name="name" value={pForm.name} onChange={handlePInput} required placeholder="e.g. 22K Gold Antique Choker" />
                    <Field label="Slug (URL-friendly)" name="slug" value={pForm.slug} onChange={handlePInput} placeholder="e.g. gold-antique-choker" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="SKU (Stock Keeping Unit)" name="sku" value={pForm.sku} onChange={handlePInput} required hint="Unique product code" />
                    <div>
                      <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Product Type</label>
                      <select name="product_type" value={pForm.product_type} onChange={handlePInput}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="simple">Simple Product</option>
                        <option value="variable">Variable Product</option>
                        <option value="grouped">Grouped Product</option>
                        <option value="external">External/Affiliate Product</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Category</label>
                      <select name="category_id" value={pForm.category_id} onChange={handlePInput}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="">— Select Category —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Quantity / Inventory" name="quantity" type="number" value={pForm.quantity} onChange={handlePInput} required placeholder="e.g. 5" />
                    <Field label="Vendor / Brand" name="vendor" value={pForm.vendor} onChange={handlePInput} placeholder="Siri Samruddhi Gold" />
                  </div>
                  <Field label="Product Short Description" name="short_description" value={pForm.short_description} onChange={handlePInput} rows={2} placeholder="Brief summary of the product (shows near price)..." />
                  <Field label="Product Full Description" name="description" value={pForm.description} onChange={handlePInput} rows={4} placeholder="Enter a premium detailed description of this item..." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Tags" name="tags" value={pForm.tags} onChange={handlePInput} placeholder="wedding, necklace, bridal" hint="Comma separated" />
                    <Field label="SEO Title" name="seo_title" value={pForm.seo_title} onChange={handlePInput} placeholder="Meta title for Google" />
                  </div>
                  <Field label="SEO Description" name="seo_description" value={pForm.seo_description} onChange={handlePInput} rows={2} hint="Meta description for search engines (150-160 chars)" />
                </div>
              </SCard>

              {/* WooCommerce: Inventory & Shipping */}
              <SCard icon={<Package />} title="Inventory & Shipping">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Manage Stock?</label>
                      <select name="manage_stock" value={pForm.manage_stock ? 'true' : 'false'} onChange={(e) => setPForm((p: any) => ({ ...p, manage_stock: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    {pForm.manage_stock && (
                      <Field label="Stock Quantity" name="stock" type="number" value={pForm.stock} onChange={handlePInput} />
                    )}
                    <Field label="Low Stock Threshold" name="low_stock_threshold" type="number" value={pForm.low_stock_threshold} onChange={handlePInput} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Allow Backorders?</label>
                      <select name="allow_backorders" value={pForm.allow_backorders} onChange={handlePInput}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="no">Do not allow</option>
                        <option value="notify">Allow, but notify customer</option>
                        <option value="yes">Allow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Sold Individually?</label>
                      <select name="sold_individually" value={pForm.sold_individually ? 'true' : 'false'} onChange={(e) => setPForm((p: any) => ({ ...p, sold_individually: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="false">No</option>
                        <option value="true">Yes (Max 1 per order)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#D4AF37]/20 pt-4 mt-4">
                    <h4 className="text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Shipping Dimensions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <Field label="Length" name="length" value={pForm.dimensions?.length || ''} onChange={(e: any) => setPForm((p: any) => ({ ...p, dimensions: { ...p.dimensions, length: e.target.value } }))} placeholder="cm" />
                      <Field label="Width" name="width" value={pForm.dimensions?.width || ''} onChange={(e: any) => setPForm((p: any) => ({ ...p, dimensions: { ...p.dimensions, width: e.target.value } }))} placeholder="cm" />
                      <Field label="Height" name="height" value={pForm.dimensions?.height || ''} onChange={(e: any) => setPForm((p: any) => ({ ...p, dimensions: { ...p.dimensions, height: e.target.value } }))} placeholder="cm" />
                      <Field label="Shipping Class" name="shipping_class" value={pForm.shipping_class} onChange={handlePInput} placeholder="e.g. heavy" />
                    </div>
                  </div>
                </div>
              </SCard>

              {/* WooCommerce: Advanced / Linked Products */}
              <SCard icon={<LinkIcon />} title="Advanced & Linked Products">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Purchase Note" name="purchase_note" value={pForm.purchase_note} onChange={handlePInput} hint="Sent to customer after purchase" />
                    <Field label="Menu Order" name="menu_order" type="number" value={pForm.menu_order} onChange={handlePInput} hint="Custom sorting order" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Enable Reviews?</label>
                      <select name="enable_reviews" value={pForm.enable_reviews ? 'true' : 'false'} onChange={(e) => setPForm((p: any) => ({ ...p, enable_reviews: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    {/* Upsells and Cross-sells would typically have a multi-select component, but we will leave them empty string/comma separated for now for simplicity, or omit the complex UI if not needed immediately. We'll add text fields for comma separated IDs for now. */}
                  </div>
                </div>
              </SCard>

              {/* Images */}
              <SCard icon={<ImageIcon />} title="Media & Gallery">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ImgUpload label="Primary Thumbnail" url={pForm.image_url} onUpload={uploadMain}
                    onClear={() => setPForm((p: any) => ({ ...p, image_url: '' }))}
                    onChange={e => setPForm((p: any) => ({ ...p, image_url: e.target.value }))}
                    loading={uploadingMain} name="image_url" />
                  
                  <div>
                    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Product Gallery</label>
                    <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed ${uploadingGallery ? 'border-[#D4AF37] bg-[#FFF7F2]' : 'border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FFF7F2]/50'} rounded-2xl p-6 cursor-pointer transition-all h-36`}>
                      <input type="file" accept="image/*" multiple onChange={uploadGallery} disabled={uploadingGallery} className="hidden" />
                      {uploadingGallery
                        ? <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /><span className="text-xs text-[#D4AF37] font-medium tracking-wide uppercase">Uploading…</span></div>
                        : <div className="flex flex-col items-center gap-2 text-[#5F1517]/40"><span className="text-3xl">🖼️</span><span className="text-xs font-medium uppercase tracking-widest text-center">Add Gallery Images</span></div>
                      }
                    </label>
                  </div>
                </div>
                
                {(pForm.gallery_urls || []).length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#D4AF37]/20">
                    <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-widest mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Gallery Preview ({pForm.gallery_urls.length})</label>
                    <div className="flex flex-wrap gap-3">
                      {(pForm.gallery_urls || []).map((url: string, idx: number) => (
                        <div key={idx} className="relative group">
                          <img src={getImageUrl(url)} alt={`g${idx}`} className="w-20 h-20 object-cover rounded-xl border border-[#D4AF37]/30 shadow-sm" />
                          <button type="button" onClick={() => setPForm((p: any) => ({ ...p, gallery_urls: p.gallery_urls.filter((_: any, i: number) => i !== idx) }))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110 border border-white">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SCard>

              {/* Physical Properties */}
              <SCard icon={<Ruler />} title="Jewelry Specifications">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <Field label="Gross Weight" name="approx_gross_weight" value={pForm.approx_gross_weight} onChange={handlePInput} placeholder="e.g. 15.5g" />
                  <Field label="Metal" name="metal" value={pForm.metal} onChange={handlePInput} placeholder="e.g. Yellow Gold" />
                  <Field label="Purity" name="metal_purity" value={pForm.metal_purity} onChange={handlePInput} placeholder="e.g. 22K (916)" />
                  <Field label="Gender" name="gender" value={pForm.gender} onChange={handlePInput} placeholder="Women / Men / Unisex" />
                  <Field label="Hallmark" name="hallmark" value={pForm.hallmark} onChange={handlePInput} placeholder="e.g. BIS Hallmarked" />
                  <Field label="Finish" name="metal_finish" value={pForm.metal_finish} onChange={handlePInput} placeholder="e.g. Matte / Antique" />
                  <Field label="Certification" name="gold_certification" value={pForm.gold_certification} onChange={handlePInput} placeholder="e.g. GIA Certified" />
                  
                  {/* Dynamic fields based on category */}
                  {isRing && <Field label="Ring Size" name="ring_size" value={pForm.ring_size} onChange={handlePInput} placeholder="e.g. 12 (Indian)" />}
                  {isBangle && <Field label="Bangle Size" name="bangle_size" value={pForm.bangle_size} onChange={handlePInput} placeholder="e.g. 2.4" />}
                  {isChain && <Field label="Chain Length" name="chain_included" value={pForm.chain_included} onChange={handlePInput} placeholder="e.g. 18 inches" />}
                </div>
              </SCard>

              {/* Stones / Diamonds */}
              <SCard icon={<Gem />} title="Diamond & Stone Details">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <Field label="Gemstone Name" name="stone_1_name" value={pForm.stone_1_name} onChange={handlePInput} placeholder="e.g. Ruby" />
                  <Field label="Gemstone Wt" name="stone_1_weight" value={pForm.stone_1_weight} onChange={handlePInput} placeholder="e.g. 0.5 ct" />
                  <div className="col-span-2 sm:col-span-1 hidden sm:block"></div>
                  <Field label="Diamond Type" name="diamond_type" value={pForm.diamond_type} onChange={handlePInput} placeholder="e.g. Natural / Lab" />
                  <Field label="Diamond Color" name="diamond_color" value={pForm.diamond_color} onChange={handlePInput} placeholder="e.g. E-F" />
                  <Field label="Diamond Clarity" name="diamond_clarity" value={pForm.diamond_clarity} onChange={handlePInput} placeholder="e.g. VVS-VS" />
                  <Field label="Total Diamond Wt" name="total_diamond_weight" value={pForm.total_diamond_weight} onChange={handlePInput} placeholder="e.g. 1.2 ct" />
                  <Field label="No. of Diamonds" name="no_of_diamonds" value={pForm.no_of_diamonds} onChange={handlePInput} placeholder="e.g. 24" />
                  <Field label="Diamond Shape" name="stone_shape" value={pForm.stone_shape} onChange={handlePInput} placeholder="e.g. Round Brilliant" />
                </div>
              </SCard>

              {/* Detailed Price Breakup */}
              <SCard icon={<Calculator />} title="Price Breakup & Dynamic Calculator">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-[#FFF7F2] p-4 rounded-xl border border-[#D4AF37]/30">
                      <span className="text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-widest block mb-1">Purity-Based Live Rate</span>
                      <span className="text-sm font-bold text-[#5F1517]">
                        {pForm.metal_purity || 'Gold 22K'}: ₹{Number(pForm.gold_rate).toLocaleString('en-IN') || '13,275'} / gram
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Gold Weight (g)" name="gold_weight" type="number" value={pForm.gold_weight} onChange={handlePInput} placeholder="e.g. 6.058" />
                      <Field label="Metal Value (₹)" name="metal_value" type="number" value={pForm.metal_value} onChange={handlePInput} readOnly hint="Weight x Live Rate" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Stone Weight (ct)" name="stone_weight" value={pForm.stone_weight} onChange={handlePInput} placeholder="e.g. 1.08" />
                      <Field label="Stone Value (₹)" name="stone_value" type="number" value={pForm.stone_value} onChange={handlePInput} placeholder="e.g. 594" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Making Charges (₹)" name="making_charges_value" type="number" value={pForm.making_charges_value} onChange={handlePInput} placeholder="e.g. 19222" />
                      <Field label="Making Discount (₹)" name="making_charges_discount" type="number" value={pForm.making_charges_discount} onChange={handlePInput} placeholder="e.g. 3844" />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#5F1517] uppercase tracking-[0.2em] mb-4">Breakup Preview</h4>
                      <div className="space-y-2 text-xs font-semibold text-gray-600">
                        <div className="flex justify-between">
                          <span>Gold ({pForm.gold_weight || '0'}g @ ₹{Number(pForm.gold_rate).toLocaleString('en-IN')})</span>
                          <span>₹{pForm.metal_value?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stone Value ({pForm.stone_weight || '0'} ct)</span>
                          <span>₹{pForm.stone_value?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Making Charges (Final)</span>
                          <span>₹{pForm.making_charges_final?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between font-bold text-[var(--color-royal)]">
                          <span>Subtotal</span>
                          <span>₹{pForm.sub_total_final?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>GST (3%)</span>
                          <span>₹{pForm.tax_final?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-sm text-[var(--color-royal)]">
                          <span>Grand Total (Final Selling Price)</span>
                          <span>₹{pForm.grand_total_final?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-4 leading-normal">
                      The selling price and original MRP prices will be automatically populated from this live calculation.
                    </div>
                  </div>
                </div>
              </SCard>
            </div>

            <div className="space-y-6">
              {/* Pricing Status (Sidebar) */}
              <SCard icon={<DollarSign />} title="Pricing & Status">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Product Status</label>
                    <select name="status" value={pForm.status} onChange={handlePInput}
                      className="w-full px-4 py-3 border border-[#D4AF37]/30 shadow-sm rounded-xl text-sm font-bold text-[#5F1517] focus:outline-none focus:border-[#D4AF37] bg-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <option value="active">🟢 Active (Visible)</option>
                      <option value="draft">🟡 Draft (Hidden)</option>
                      <option value="archived">🔴 Archived</option>
                    </select>
                  </div>
                  <Field label="Selling Price (₹)" name="price" type="number" value={pForm.price} onChange={handlePInput} required hint="Auto calculated or override manually" />
                  <Field label="MRP / Original (₹)" name="original_price" type="number" value={pForm.original_price} onChange={handlePInput} hint="Strikethrough base MRP" />
                  <div className="pt-3 border-t border-[#D4AF37]/20">
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-3 p-3 bg-[#FFF7F2] rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition">
                      <input type="checkbox" name="is_on_sale" checked={pForm.is_on_sale} onChange={handlePInput} className="w-5 h-5 accent-[#5F1517]" />
                      <span className="text-sm font-bold uppercase tracking-widest text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Mark On Sale</span>
                    </label>
                    {pForm.is_on_sale && (
                      <div className="space-y-4 mt-4 animate-fade-in">
                        <Field label="Sale Price (₹)" name="sale_price" type="number" value={pForm.sale_price} onChange={handlePInput} />
                        <Field label="Sale Badge Text" name="sale_label" value={pForm.sale_label} onChange={handlePInput} placeholder="e.g. 20% OFF" />
                      </div>
                    )}
                  </div>
                </div>
              </SCard>

              {/* Inventory (Sidebar) */}
              <SCard icon={<Package />} title="Inventory & Shipping">
                <div className="space-y-4">
                  <Field label="Stock Quantity" name="stock" type="number" value={pForm.stock} onChange={handlePInput} />
                  <Field label="Weight for Shipping" name="weight" value={pForm.weight} onChange={handlePInput} placeholder="e.g. 0.5 kg" />
                  <div className="pt-3 border-t border-[#D4AF37]/20 space-y-3">
                    {[{ n: 'ready_to_dispatch', l: 'Ready to Dispatch' }, { n: 'transit_insurance', l: 'Transit Insurance' }].map(cb => (
                      <label key={cb.n} className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" name={cb.n} checked={(pForm as any)[cb.n]} onChange={handlePInput} className="w-4 h-4 accent-[#5F1517]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#5F1517]/70" style={{ fontFamily: 'Montserrat, sans-serif' }}>{cb.l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </SCard>

              {/* Action Buttons */}
              <div className="sticky top-24 pt-4">
                <button type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-2xl uppercase tracking-[0.2em] text-sm hover:from-[#801416] hover:to-[#a01a1c] transition-all shadow-[0_4px_15px_rgba(95,21,23,0.3)] hover:shadow-[0_6px_20px_rgba(95,21,23,0.4)] mb-3"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {editPId ? '💾 Save Product' : '+ Publish Product'}
                </button>
                {editPId && (
                  <button type="button" onClick={() => { setPForm({ ...emptyProduct }); setEditPId(null); setPMsg({ text: '', type: '' }); setSection('all-products'); }}
                    className="w-full py-4 bg-white border border-[#D4AF37]/40 text-[#5F1517]/70 font-bold rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-[#FFF7F2] hover:text-[#5F1517] transition-all" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  
};
export default ProductForm;
