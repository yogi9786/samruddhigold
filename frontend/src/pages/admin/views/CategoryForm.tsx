import React from 'react';
import type { Section, Category } from '../types';
import { Alert, SCard, Field, ImgUpload } from '../components/UIComponents';
import { Folder } from 'lucide-react';



interface CategoryFormProps {
  editCId: string | null;
  setSection: (s: Section) => void;
  setEditCId: (id: string | null) => void;
  setCForm: React.Dispatch<React.SetStateAction<any>>;
  emptyCat: any;
  cMsg: any;
  hasSnapshot: boolean;
  handleRollbackCat: () => void;
  handleCatSubmit: (e: React.FormEvent) => void;
  cForm: any;
  handleCInput: (e: React.ChangeEvent<any>) => void;
  categories: Category[];
  uploadCatImg: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingCat: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ editCId, setSection, setEditCId, setCForm, emptyCat, cMsg, hasSnapshot, handleRollbackCat, handleCatSubmit, cForm, handleCInput, categories, uploadCatImg, uploadingCat }) => {
  return (
<div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { setSection('all-categories'); setEditCId(null); setCForm({ ...emptyCat }); }} 
          className="p-2 text-[#5F1517]/50 hover:text-[#5F1517] bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] shadow-sm rounded-xl transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{editCId ? 'Edit Category' : 'Create Category'}</h2>
        {editCId && hasSnapshot && (
          <button type="button" onClick={handleRollbackCat} className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[#D4AF37] hover:text-[#5F1517] transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↩ Revert</button>
        )}
      </div>
      <Alert msg={cMsg} />
      <form onSubmit={handleCatSubmit}>
        <SCard icon={<Folder />} title="Category Settings">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category Name" name="name" value={cForm.name} onChange={handleCInput} required placeholder="e.g. Bridal Necklaces" />
              <Field label="Slug" name="slug" value={(cForm as any).slug || ''} onChange={handleCInput} placeholder="e.g. bridal-necklaces" hint="URL-friendly name" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Parent Category</label>
                <select
                  name="parent_id"
                  value={(cForm as any).parent_id || ''}
                  onChange={(e: any) => handleCInput(e)}
                  className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <option value="">— None (Top Level) —</option>
                  {categories.filter(c => c.id !== editCId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Display Type</label>
                <select
                  name="display_type"
                  value={(cForm as any).display_type || 'default'}
                  onChange={(e: any) => handleCInput(e)}
                  className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <option value="default">Default</option>
                  <option value="products">Products</option>
                  <option value="subcategories">Subcategories</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <Field label="Description" name="description" value={cForm.description} onChange={handleCInput} rows={4} placeholder="Describe this category..." />
            <ImgUpload label="Cover Image" url={cForm.image_url}
              onUpload={uploadCatImg}
              onClear={() => setCForm((p: any) => ({ ...p, image_url: '' }))}
              onChange={e => setCForm((p: any) => ({ ...p, image_url: e.target.value }))}
              loading={uploadingCat} name="image_url" />
          </div>
        </SCard>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-2xl uppercase tracking-[0.2em] text-sm hover:from-[#801416] hover:to-[#a01a1c] transition-all shadow-[0_4px_15px_rgba(95,21,23,0.3)] hover:shadow-[0_6px_20px_rgba(95,21,23,0.4)]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {editCId ? '💾 Save Category' : '+ Create Category'}
          </button>
          {editCId && (
            <button type="button" onClick={() => { setCForm({ ...emptyCat }); setEditCId(null); setSection('all-categories'); }} className="px-8 py-4 bg-white border border-[#D4AF37]/40 text-[#5F1517]/70 font-bold rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-[#FFF7F2] hover:text-[#5F1517] transition-all shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
          )}
        </div>
      </form>
    </div>
);
};

export default CategoryForm;
