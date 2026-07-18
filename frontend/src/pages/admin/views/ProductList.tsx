import React from 'react';
import type { Section, Product, Category } from '../types';
import { getImageUrl } from '../../../api';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  pSearch: string;
  setPSearch: (s: string) => void;
  pCatFilter: string;
  setPCatFilter: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchProducts: () => void;
  emptyProduct: any;
  setPForm: (p: any) => void;
  setEditPId: (id: string | null) => void;
  setPMsg: (msg: {text: string, type: string}) => void;
  setSection: (s: Section) => void;
  startEditProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products, categories, pSearch, setPSearch, pCatFilter, setPCatFilter,
  exportToCSV, fetchProducts, emptyProduct, setPForm, setEditPId, setPMsg,
  setSection, startEditProduct, deleteProduct
}) => {
  const filteredProducts = products.filter(p => {
    const matchS = p.name.toLowerCase().includes(pSearch.toLowerCase()) || 
                   (p.id && p.id.toLowerCase().includes(pSearch.toLowerCase())) ||
                   (p.sku && p.sku.toLowerCase().includes(pSearch.toLowerCase()));
    const matchC = !pCatFilter || p.category_id === pCatFilter;
    return matchS && matchC;
  });

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>All Products</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{filteredProducts.length} items found</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={pSearch} onChange={e => setPSearch(e.target.value)} placeholder="Search Name, ID, SKU…" 
            className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-56" style={{ fontFamily: 'Montserrat, sans-serif' }} />
          <select value={pCatFilter} onChange={e => setPCatFilter(e.target.value)} 
            className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white font-semibold text-[#5F1517] focus:outline-none focus:border-[#D4AF37] w-full sm:w-48" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => exportToCSV(filteredProducts, 'products.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button onClick={fetchProducts} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺</button>
          <button onClick={() => { setPForm({ ...emptyProduct }); setEditPId(null); setPMsg({ text: '', type: '' }); setSection('add-product'); }} 
            className="px-5 py-2.5 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] text-xs font-bold rounded-xl hover:shadow-lg transition uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>+ Add</button>
        </div>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                {['Product', 'Category', 'Price / Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#FFF7F2]/60 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#FFF7F2] shadow-sm flex-shrink-0">
                        {p.image_url 
                          ? <img src={getImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl opacity-40">💍</div>
                        }
                      </div>
                      <div>
                        <div className="font-bold text-[#5F1517] text-sm leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.name}</div>
                        <div className="text-[10px] text-[#5F1517]/50 font-mono mt-1 tracking-wider uppercase">{p.id.slice(0, 8)} • SKU: {p.sku || 'N/A'}</div>
                        {p.basic_info?.metal_purity && <div className="text-[9px] mt-0.5 text-[#D4AF37] font-bold uppercase tracking-widest">{p.basic_info.metal_purity} • {p.basic_info.approx_gross_weight || '0'}g</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-[#5F1517]/80 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {categories.find(c => c.id === p.category_id)?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{p.price?.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${(p.stock || 0) > 10 ? 'text-green-600' : (p.stock || 0) > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                      {p.stock} in stock
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border ${
                      p.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                      p.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditProduct(p)} className="px-3 py-1.5 text-[10px] font-bold text-[#5F1517] bg-white border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-lg transition uppercase tracking-widest shadow-sm">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition uppercase tracking-widest shadow-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && <tr><td colSpan={5} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
