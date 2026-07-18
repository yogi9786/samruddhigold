import React from 'react';
import { SCard, Field } from '../components/UIComponents';
import { TrendingUp, FileText } from 'lucide-react';



interface MetalPricesProps {
  editMId: string | null;
  setEditMId: (id: string | null) => void;
  mForm: any;
  setMForm: (m: any) => void;
  handleMInput: (e: React.ChangeEvent<any>) => void;
  handleMetalSubmit: (e: React.FormEvent) => void;
  metalPrices: any[];
  startEditMetal: (m: any) => void;
  deleteMetalPrice: (id: string) => void;
}

const MetalPrices: React.FC<MetalPricesProps> = ({ editMId, setEditMId, mForm, setMForm, handleMInput, handleMetalSubmit, metalPrices, startEditMetal, deleteMetalPrice }) => {
  return (
<div className="animate-fade-in pb-10">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Metal Rates Manager</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1">
          <form onSubmit={handleMetalSubmit}>
            <SCard icon={<TrendingUp />} title={editMId ? 'Edit Rate' : 'Add New Rate'}>
              <div className="space-y-4">
                {!editMId && (
                  <Field 
                    label="Rate ID (slug)" 
                    name="id" 
                    value={mForm.id} 
                    onChange={handleMInput} 
                    required 
                    placeholder="e.g. gold_22k, gold_24k, silver" 
                    hint="Lowercase, letters/underscores only. Used as unique key." 
                  />
                )}
                {editMId && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate ID</label>
                    <input type="text" value={mForm.id} readOnly className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-[#FFF7F2] text-[#5F1517]/50 focus:outline-none" />
                  </div>
                )}
                <Field label="Metal Name" name="name" value={mForm.name} onChange={handleMInput} required placeholder="e.g. Gold 22 KT" />
                <Field label="Price per Gram (₹)" name="price" type="number" value={mForm.price} onChange={handleMInput} required placeholder="e.g. 13230" />
                <Field label="Unit" name="unit" value={mForm.unit} onChange={handleMInput} required placeholder="e.g. 1g" />
                
                <div className="pt-3 flex gap-2">
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] text-xs font-bold rounded-xl uppercase tracking-widest hover:brightness-110 transition shadow">
                    {editMId ? 'Save' : 'Add Rate'}
                  </button>
                  {editMId && (
                    <button type="button" onClick={() => { setEditMId(null); setMForm({ id: '', name: '', price: 0, unit: '1g' }); }} className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </SCard>
          </form>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2">
          <SCard icon={<FileText />} title="Daily Live Rates">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]/50 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]">
                    <th className="px-4 py-3">Metal / ID</th>
                    <th className="px-4 py-3">Price / Unit</th>
                    <th className="px-4 py-3">Last Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-semibold">
                  {metalPrices.map((mp) => (
                    <tr key={mp.id} className="hover:bg-[#FFF7F2]/40 transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-[#5F1517] font-bold">{mp.name}</div>
                        <div className="text-[10px] text-[#5F1517]/40 font-mono mt-0.5">{mp.id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#5F1517] font-bold">₹{mp.price.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-[#5F1517]/50 uppercase tracking-widest font-semibold mt-0.5">Per {mp.unit}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#5F1517]/75 font-sans text-xs font-semibold">
                          {mp.updated_at ? new Date(mp.updated_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => startEditMetal(mp)} className="px-3 py-1.5 text-[10px] font-bold text-[#5F1517] bg-white border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-lg transition uppercase tracking-widest shadow-sm">Edit</button>
                          <button onClick={() => deleteMetalPrice(mp.id)} className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition uppercase tracking-widest shadow-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {metalPrices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400 font-medium">No rates defined. Add one above!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SCard>
        </div>
      </div>
    </div>
);
};

export default MetalPrices;
