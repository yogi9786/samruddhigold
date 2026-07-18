import React from 'react';
import type { Section, Category } from '../types';
import { getImageUrl } from '../../../api';



interface CategoryListProps {
  categories: Category[];
  cSearch: string;
  setCSearch: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchCategories: () => void;
  emptyCat: any;
  setCForm: (c: any) => void;
  setEditCId: (id: string | null) => void;
  setCMsg: (msg: any) => void;
  setSection: (s: Section) => void;
  startEditCat: (c: Category) => void;
  deleteCat: (id: string) => void;
  products: any[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, cSearch, setCSearch, exportToCSV, fetchCategories, emptyCat, setCForm, setEditCId, setCMsg, setSection, startEditCat, deleteCat, products }) => {
  return (
<div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Categories</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{categories.length} active categories</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={cSearch} onChange={e => setCSearch(e.target.value)} placeholder="Search categories…"
            className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-56" style={{ fontFamily: 'Montserrat, sans-serif' }} />
          <button onClick={() => exportToCSV(categories, 'categories.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button onClick={fetchCategories} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺</button>
          <button onClick={() => { setCForm({ ...emptyCat }); setEditCId(null); setCMsg({ text: '', type: '' }); setSection('add-category'); }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] text-xs font-bold rounded-xl hover:shadow-lg transition uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>+ Add</button>
        </div>
      </div>
      
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                {['Thumbnail', 'Category Details', 'Products', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {categories.filter(c => !cSearch || c.name.toLowerCase().includes(cSearch.toLowerCase())).map(c => (
                <tr key={c.id} className="hover:bg-[#FFF7F2]/60 transition-colors">
                  <td className="px-5 py-4 w-24">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#FFF7F2] shadow-sm">
                      {c.image_url
                        ? <img src={getImageUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">📂</div>
                      }
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#5F1517] text-base flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {c.name}
                      {c.parent_id && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#5F1517]/70 border border-[#D4AF37]/20 uppercase tracking-widest whitespace-nowrap">
                          Child of: {categories.find(parent => parent.id === c.parent_id)?.name || 'Unknown'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#5F1517]/50 max-w-[300px] truncate mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{c.description || 'No description provided'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{products.filter(p => p.category_id === c.id).length} items</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEditCat(c)} className="px-4 py-2 text-[10px] font-bold text-[#5F1517] bg-white border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-xl transition uppercase tracking-widest shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Edit</button>
                      <button onClick={() => deleteCat(c.id)} className="px-4 py-2 text-[10px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition uppercase tracking-widest shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={4} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No categories found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
);
};

export default CategoryList;
