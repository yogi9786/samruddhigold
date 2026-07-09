import React, { useState, useEffect, useCallback, useRef } from 'react';
import api, { adminApi, getImageUrl } from '../api';
import logo from '../assets/samruddhi-logo.png';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
// Primary: #5F1517  Accent: #801416  Gold: #D4AF37  Cream: #FFF7F2

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; description?: string; image_url?: string; }
interface Order { id: string; items: any[]; total_amount: number; shipping_address: string; contact_phone: string; payment_method: string; user_username: string; status: string; created_at: string; updated_at: string; }
interface User { id: string; username: string; email?: string; full_name?: string; disabled: boolean; }
interface Product {
  id: string; name: string; sku: string; price: number; original_price?: number;
  discount_text?: string; ready_to_dispatch?: boolean; transit_insurance?: boolean;
  image_url?: string; gallery_urls?: string[]; category_id?: string;
  is_on_sale?: boolean; sale_price?: number; sale_label?: string;
  price_breakup?: any; basic_info?: any; stone_info?: any; other_info?: any; return_policy?: any;
  status?: string; stock?: number; weight?: string; tags?: string; vendor?: string; seo_title?: string; seo_description?: string;
}

type Section = 'dashboard' | 'all-products' | 'add-product' | 'all-categories' | 'add-category' | 'orders' | 'customers' | 'users' | 'change-password' | 'settings';

const emptyProduct = {
  name: '', sku: '', price: 0, original_price: 0, discount_text: '',
  ready_to_dispatch: false, transit_insurance: false, image_url: '',
  gallery_urls: [] as string[], category_id: '',
  is_on_sale: false, sale_price: 0, sale_label: '',
  status: 'active', stock: 0, weight: '', tags: '', vendor: '',
  seo_title: '', seo_description: '',
  // Price Breakup
  metal_value: 0, gold_rate: '', gold_weight: '', stone_value: 0, stone_weight: '',
  making_charges_value: 0, making_charges_discount: 0, making_charges_final: 0,
  sub_total_value: 0, sub_total_final: 0, tax_value: 0, tax_final: 0,
  grand_total_value: 0, grand_total_final: 0,
  // Basic Info
  height: '', material: '', metal: '', metal_purity: '', width: '', approx_gross_weight: '',
  // Stone Info
  stone_1_name: '', stone_1_weight: '', diamond_type: '', diamond_clarity: '', diamond_color: '', 
  total_diamond_weight: '', no_of_diamonds: '', stone_shape: '', stone_setting: '',
  // Other Info
  chain_included: '', earring_type: '', gold_certification: '', metal_finish: '', occasion: '',
  hallmark: '', gender: '', ring_size: '', bangle_size: '',
  // Return
  return_days: ''
};
const emptyCat = { name: '', description: '', image_url: '' };

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: { text: string; type: string }; onClose: () => void }> = ({ msg, onClose }) => {
  useEffect(() => { if (msg.text) { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); } }, [msg.text, onClose]);
  if (!msg.text) return null;
  const colors: Record<string, string> = {
    success: 'bg-[#5F1517] border-[#D4AF37] text-[#D4AF37]',
    error: 'bg-red-900 border-red-400 text-red-200',
    info: 'bg-[#3d1012] border-[#D4AF37]/50 text-[#D4AF37]/80',
  };
  return (
    <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl ${colors[msg.type] || colors.info} animate-fade-in`} style={{ fontFamily: 'Montserrat, sans-serif', minWidth: 280 }}>
      <span className="text-lg">{msg.type === 'success' ? '✓' : msg.type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="text-sm font-medium flex-1">{msg.text}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-2 text-lg">✕</button>
    </div>
  );
};

// ─── Inline Alert ──────────────────────────────────────────────────────────────
const Alert: React.FC<{ msg: { text: string; type: string } }> = ({ msg }) => {
  if (!msg.text) return null;
  const c = { success: 'bg-[#FFF7F2] border-[#D4AF37] text-[#5F1517]', error: 'bg-red-50 border-red-400 text-red-700', info: 'bg-amber-50 border-amber-400 text-amber-800' };
  return <div className={`border-l-4 px-4 py-3 rounded-r-lg text-sm mb-4 ${c[msg.type as keyof typeof c] || c.info}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{msg.text}</div>;
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; name: string; type?: string; value: any; onChange: any; required?: boolean; placeholder?: string; readOnly?: boolean; hint?: string; rows?: number; }> = ({ label, name, type = 'text', value, onChange, required, placeholder, readOnly, hint, rows }) => (
  <div>
    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {label}{required && <span className="text-[#D4AF37] ml-0.5">*</span>}
    </label>
    {rows ? (
      <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} readOnly={readOnly}
        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] resize-none transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} readOnly={readOnly}
        className={`w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm ${readOnly ? 'bg-[#FFF7F2] text-[#5F1517]/50 cursor-default' : 'bg-white'}`}
        style={{ fontFamily: 'Montserrat, sans-serif' }} />
    )}
    {hint && <p className="text-[10px] text-[#5F1517]/40 mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{hint}</p>}
  </div>
);

// ─── Gold Divider ──────────────────────────────────────────────────────────────
const GoldDivider = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
  </div>
);

// ─── Section Card ──────────────────────────────────────────────────────────────
const SCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 sm:p-8 mb-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl drop-shadow-sm">{icon}</span>
      <h3 className="font-semibold text-[#5F1517] text-sm sm:text-base uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h3>
    </div>
    <GoldDivider />
    <div className="mt-5">{children}</div>
  </div>
);

// ─── Image Upload Field ───────────────────────────────────────────────────────
const ImgUpload: React.FC<{ label: string; url: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; loading: boolean; name: string }> =
  ({ label, url, onUpload, onClear, onChange, loading, name }) => (
  <div>
    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{label}</label>
    <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed ${loading ? 'border-[#D4AF37] bg-[#FFF7F2]' : 'border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#FFF7F2]/50'} rounded-2xl p-6 cursor-pointer transition-all`}>
      <input type="file" accept="image/*" onChange={onUpload} disabled={loading} className="hidden" />
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#D4AF37] font-medium tracking-wide uppercase">Uploading…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-[#5F1517]/40">
          <span className="text-3xl">📁</span>
          <span className="text-xs font-medium uppercase tracking-widest">Click to upload</span>
        </div>
      )}
    </label>
    {url && (
      <div className="mt-4 flex items-center gap-4 bg-[#FFF7F2] p-2 rounded-xl border border-[#D4AF37]/20">
        <div className="relative group flex-shrink-0">
          <img src={getImageUrl(url)} alt="preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-[#D4AF37]/30 shadow-sm" />
          <button type="button" onClick={onClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[#5F1517] text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110">✕</button>
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <input type="text" name={name} value={url} onChange={onChange} placeholder="Or paste URL"
            className="w-full px-3 py-2 border-b border-[#D4AF37]/30 text-xs bg-transparent text-[#5F1517] focus:outline-none focus:border-[#D4AF37] transition" style={{ fontFamily: 'Montserrat, sans-serif' }} />
        </div>
      </div>
    )}
    {!url && (
      <input type="text" name={name} value={url} onChange={onChange} placeholder="Or paste image URL…"
        className="w-full mt-3 px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-xs text-[#5F1517] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }} />
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminPanel: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [loginU, setLoginU] = useState('');
  const [loginP, setLoginP] = useState('');
  const [loginErr, setLoginErr] = useState('');
  
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile sidebar toggle

  // Toast
  const [toast, setToast] = useState({ text: '', type: '' });
  const showToast = (text: string, type: string = 'success') => setToast({ text, type });

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState({ products: false, categories: false, orders: false, users: false });

  // Product filters
  const [pSearch, setPSearch] = useState('');
  const [pCatFilter, setPCatFilter] = useState('');
  const [pStatusFilter, setPStatusFilter] = useState('');
  const [pSaleFilter, setPSaleFilter] = useState('');
  const [pSortBy, setPSortBy] = useState('name');

  // Category & Order filters
  const [cSearch, setCSearch] = useState('');
  const [oSearch, setOSearch] = useState('');
  const [oStatusFilter, setOStatusFilter] = useState('');

  // Product form
  const [pForm, setPForm] = useState({ ...emptyProduct });
  const [editPId, setEditPId] = useState<string | null>(null);
  const [pMsg, setPMsg] = useState({ text: '', type: '' });
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const pSnapshot = useRef<typeof emptyProduct | null>(null);

  // Category form
  const [cForm, setCForm] = useState({ ...emptyCat });
  const [editCId, setEditCId] = useState<string | null>(null);
  const [cMsg, setCMsg] = useState({ text: '', type: '' });
  const [uploadingCat, setUploadingCat] = useState(false);
  const cSnapshot = useRef<typeof emptyCat | null>(null);

  // Password
  const [pw, setPw] = useState({ cur: '', nw: '', conf: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

  // Stats
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0, onSale: 0, pending: 0, customers: 0 });

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(l => ({ ...l, products: true }));
    try {
      const r = await adminApi.get('/products');
      setProducts(r.data);
      const onSale = r.data.filter((p: Product) => p.is_on_sale).length;
      setStats(s => ({ ...s, products: r.data.length, onSale }));
    } catch { showToast('Failed to load products', 'error'); }
    finally { setLoading(l => ({ ...l, products: false })); }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(l => ({ ...l, categories: true }));
    try {
      const r = await adminApi.get('/categories');
      setCategories(r.data);
      setStats(s => ({ ...s, categories: r.data.length }));
    } catch { }
    finally { setLoading(l => ({ ...l, categories: false })); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(l => ({ ...l, orders: true }));
    try {
      const r = await adminApi.get('/orders');
      setOrders(r.data);
      const revenue = r.data.reduce((a: number, o: Order) => a + o.total_amount, 0);
      const pending = r.data.filter((o: Order) => o.status === 'Pending').length;
      setStats(s => ({ ...s, orders: r.data.length, revenue, pending }));
    } catch { }
    finally { setLoading(l => ({ ...l, orders: false })); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(l => ({ ...l, users: true }));
    try {
      const r = await adminApi.get('/users');
      setUsers(r.data);
    } catch { }
    finally { setLoading(l => ({ ...l, users: false })); }
  }, []);

  const refreshAll = useCallback(() => { fetchProducts(); fetchCategories(); fetchOrders(); fetchUsers(); }, [fetchProducts, fetchCategories, fetchOrders, fetchUsers]);

  useEffect(() => { 
    if (token) refreshAll(); 
  }, [token, refreshAll]);

  // Derived state for customers (users who have at least 1 order)
  const customers = users.filter(u => orders.some(o => o.user_username === u.username));
  useEffect(() => { setStats(s => ({ ...s, customers: customers.length })); }, [customers.length]);

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', loginU); params.append('password', loginP);
      const r = await api.post('/auth/token', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const tok = r.data.access_token;
      setToken(tok); localStorage.setItem('admin_token', tok); setLoginErr('');
    } catch { setLoginErr('Invalid credentials. Please try again.'); }
  };
  const handleLogout = () => { setToken(null); localStorage.removeItem('admin_token'); };

  // ─── Product Handlers ────────────────────────────────────────────────────────
  const handlePInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const t = e.target as HTMLInputElement;
    const { name, value, type } = t;
    setPForm(prev => ({ ...prev, [name]: type === 'checkbox' ? t.checked : type === 'number' ? Number(value) : value }));
  };

  const uploadMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append('file', e.target.files[0]);
    setUploadingMain(true);
    try {
      const r = await adminApi.post('/products/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPForm(p => ({ ...p, image_url: r.data.url })); showToast('Main image uploaded!');
    } catch { showToast('Failed to upload image', 'error'); }
    finally { setUploadingMain(false); }
  };

  const uploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fd = new FormData();
    Array.from(e.target.files).forEach(f => fd.append('files', f));
    setUploadingGallery(true);
    try {
      const r = await adminApi.post('/products/upload-gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPForm(p => ({ ...p, gallery_urls: [...(p.gallery_urls || []), ...r.data.urls] }));
      showToast(`${r.data.urls.length} gallery image(s) uploaded!`);
    } catch { showToast('Gallery upload failed', 'error'); }
    finally { setUploadingGallery(false); }
  };

  const buildPayload = () => ({
    name: pForm.name, sku: pForm.sku, price: pForm.price,
    original_price: pForm.original_price || null, discount_text: pForm.discount_text,
    ready_to_dispatch: pForm.ready_to_dispatch, transit_insurance: pForm.transit_insurance,
    image_url: pForm.image_url, gallery_urls: pForm.gallery_urls,
    category_id: pForm.category_id || null,
    is_on_sale: pForm.is_on_sale, sale_price: pForm.sale_price || null, sale_label: pForm.sale_label,
    status: pForm.status, stock: pForm.stock, weight: pForm.weight, tags: pForm.tags, vendor: pForm.vendor,
    seo_title: pForm.seo_title, seo_description: pForm.seo_description,
    price_breakup: { metal_value: pForm.metal_value, gold_rate: pForm.gold_rate, gold_weight: pForm.gold_weight, stone_value: pForm.stone_value, stone_weight: pForm.stone_weight, making_charges_value: pForm.making_charges_value, making_charges_discount: pForm.making_charges_discount, making_charges_final: pForm.making_charges_final, sub_total_value: pForm.sub_total_value, sub_total_final: pForm.sub_total_final, tax_value: pForm.tax_value, tax_final: pForm.tax_final, grand_total_value: pForm.grand_total_value, grand_total_final: pForm.grand_total_final },
    basic_info: { height: pForm.height, material: pForm.material, metal: pForm.metal, metal_purity: pForm.metal_purity, width: pForm.width, approx_gross_weight: pForm.approx_gross_weight },
    stone_info: { stone_1_name: pForm.stone_1_name, stone_1_weight: pForm.stone_1_weight, diamond_type: pForm.diamond_type, diamond_clarity: pForm.diamond_clarity, diamond_color: pForm.diamond_color, total_diamond_weight: pForm.total_diamond_weight, no_of_diamonds: pForm.no_of_diamonds, stone_shape: pForm.stone_shape, stone_setting: pForm.stone_setting },
    other_info: { chain_included: pForm.chain_included, earring_type: pForm.earring_type, gold_certification: pForm.gold_certification, metal_finish: pForm.metal_finish, occasion: pForm.occasion, hallmark: pForm.hallmark, gender: pForm.gender, ring_size: pForm.ring_size, bangle_size: pForm.bangle_size },
    return_policy: { return_days: pForm.return_days }
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPMsg({ text: 'Saving…', type: 'info' });
    try {
      if (editPId) {
        await adminApi.put(`/products/${editPId}`, buildPayload());
        showToast('Product updated successfully!');
      } else {
        await adminApi.post('/products', buildPayload());
        showToast('Product added successfully!');
      }
      setPMsg({ text: '', type: '' }); setPForm({ ...emptyProduct }); setEditPId(null); pSnapshot.current = null;
      fetchProducts(); setSection('all-products');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message;
      setPMsg({ text: 'Error: ' + msg, type: 'error' }); showToast('Save failed: ' + msg, 'error');
    }
  };

  const startEditProduct = (p: Product) => {
    const form = {
      name: p.name || '', sku: p.sku || '', price: p.price || 0,
      original_price: p.original_price || 0, discount_text: p.discount_text || '',
      ready_to_dispatch: p.ready_to_dispatch || false, transit_insurance: p.transit_insurance || false,
      image_url: p.image_url || '', gallery_urls: p.gallery_urls || [],
      category_id: p.category_id || '',
      is_on_sale: p.is_on_sale || false, sale_price: p.sale_price || 0, sale_label: p.sale_label || '',
      status: p.status || 'active', stock: p.stock || 0, weight: p.weight || '',
      tags: p.tags || '', vendor: p.vendor || '',
      seo_title: p.seo_title || '', seo_description: p.seo_description || '',
      
      metal_value: p.price_breakup?.metal_value || 0, gold_rate: p.price_breakup?.gold_rate || '',
      gold_weight: p.price_breakup?.gold_weight || '', stone_value: p.price_breakup?.stone_value || 0,
      stone_weight: p.price_breakup?.stone_weight || '',
      making_charges_value: p.price_breakup?.making_charges_value || 0,
      making_charges_discount: p.price_breakup?.making_charges_discount || 0,
      making_charges_final: p.price_breakup?.making_charges_final || 0,
      sub_total_value: p.price_breakup?.sub_total_value || 0, sub_total_final: p.price_breakup?.sub_total_final || 0,
      tax_value: p.price_breakup?.tax_value || 0, tax_final: p.price_breakup?.tax_final || 0,
      grand_total_value: p.price_breakup?.grand_total_value || 0, grand_total_final: p.price_breakup?.grand_total_final || 0,
      
      height: p.basic_info?.height || '', material: p.basic_info?.material || '',
      metal: p.basic_info?.metal || '', metal_purity: p.basic_info?.metal_purity || '',
      width: p.basic_info?.width || '', approx_gross_weight: p.basic_info?.approx_gross_weight || '',
      
      stone_1_name: p.stone_info?.stone_1_name || '', stone_1_weight: p.stone_info?.stone_1_weight || '',
      diamond_type: p.stone_info?.diamond_type || '', diamond_clarity: p.stone_info?.diamond_clarity || '',
      diamond_color: p.stone_info?.diamond_color || '', total_diamond_weight: p.stone_info?.total_diamond_weight || '',
      no_of_diamonds: p.stone_info?.no_of_diamonds || '', stone_shape: p.stone_info?.stone_shape || '', stone_setting: p.stone_info?.stone_setting || '',
      
      chain_included: p.other_info?.chain_included || '', earring_type: p.other_info?.earring_type || '',
      gold_certification: p.other_info?.gold_certification || '', metal_finish: p.other_info?.metal_finish || '',
      occasion: p.other_info?.occasion || '', hallmark: p.other_info?.hallmark || '', gender: p.other_info?.gender || '',
      ring_size: p.other_info?.ring_size || '', bangle_size: p.other_info?.bangle_size || '',
      
      return_days: p.return_policy?.return_days || ''
    };
    pSnapshot.current = form;
    setPForm(form); setEditPId(p.id); setPMsg({ text: '', type: '' }); setSection('add-product');
  };

  const handleRollbackProduct = () => {
    if (pSnapshot.current) { setPForm(pSnapshot.current); showToast('Rolled back to original values', 'info'); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try { await adminApi.delete(`/products/${id}`); fetchProducts(); showToast('Product deleted'); }
    catch (err: any) { showToast('Delete failed: ' + (err.response?.data?.detail || err.message), 'error'); }
  };

  // ─── Category Handlers ───────────────────────────────────────────────────────
  const handleCInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCForm(prev => ({ ...prev, [name]: value }));
  };

  const uploadCatImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append('file', e.target.files[0]);
    setUploadingCat(true);
    try {
      const r = await adminApi.post('/products/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCForm(p => ({ ...p, image_url: r.data.url })); showToast('Category image uploaded!');
    } catch { showToast('Image upload failed', 'error'); }
    finally { setUploadingCat(false); }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: cForm.name, description: cForm.description, image_url: cForm.image_url };
      if (editCId) { await adminApi.put(`/categories/${editCId}`, payload); showToast('Category updated!'); }
      else { await adminApi.post('/categories', payload); showToast('Category added!'); }
      setCForm({ ...emptyCat }); setEditCId(null); cSnapshot.current = null;
      fetchCategories(); setSection('all-categories');
    } catch (err: any) { showToast('Error: ' + (err.response?.data?.detail || err.message), 'error'); }
  };

  const startEditCat = (c: Category) => {
    const form = { name: c.name, description: c.description || '', image_url: c.image_url || '' };
    cSnapshot.current = form; setCForm(form); setEditCId(c.id); setSection('add-category');
  };
  const handleRollbackCat = () => { if (cSnapshot.current) { setCForm(cSnapshot.current); showToast('Rolled back', 'info'); } };
  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await adminApi.delete(`/categories/${id}`); fetchCategories(); showToast('Category deleted'); }
    catch (err: any) { showToast('Delete failed', 'error'); }
  };

  // ─── Orders ──────────────────────────────────────────────────────────────────
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await adminApi.patch(`/orders/${id}`, { status });
      fetchOrders(); showToast(`Order marked as ${status}`);
    } catch { showToast('Update failed', 'error'); }
  };

  // ─── Password ────────────────────────────────────────────────────────────────
  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.nw !== pw.conf) { setPwMsg({ text: 'Passwords do not match', type: 'error' }); return; }
    if (pw.nw.length < 6) { setPwMsg({ text: 'Min. 6 characters required', type: 'error' }); return; }
    try {
      await adminApi.post('/auth/change-password', { current_password: pw.cur, new_password: pw.nw });
      setPwMsg({ text: 'Password changed! Restart server to persist.', type: 'success' });
      showToast('Password changed successfully!'); setPw({ cur: '', nw: '', conf: '' });
    } catch (err: any) { setPwMsg({ text: err.response?.data?.detail || 'Failed', type: 'error' }); }
  };

  // ─── Filtered Products ───────────────────────────────────────────────────────
  const filteredProducts = products
    .filter(p => {
      const matchSearch = !pSearch || p.name.toLowerCase().includes(pSearch.toLowerCase()) || p.sku.toLowerCase().includes(pSearch.toLowerCase());
      const matchCat = !pCatFilter || p.category_id === pCatFilter;
      const matchStatus = !pStatusFilter || (pStatusFilter === 'active' ? p.status !== 'archived' : p.status === pStatusFilter);
      const matchSale = !pSaleFilter || (pSaleFilter === 'sale' ? p.is_on_sale : !p.is_on_sale);
      return matchSearch && matchCat && matchStatus && matchSale;
    })
    .sort((a, b) => {
      if (pSortBy === 'price_asc') return a.price - b.price;
      if (pSortBy === 'price_desc') return b.price - a.price;
      if (pSortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const filteredOrders = orders.filter(o => {
    const ms = !oSearch || o.id.includes(oSearch) || o.user_username.toLowerCase().includes(oSearch.toLowerCase());
    const mst = !oStatusFilter || o.status === oStatusFilter;
    return ms && mst;
  });

  const getCatName = (id?: string) => categories.find(c => c.id === id)?.name || '—';

  const STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  // ─── SIDEBAR NAV ITEM ─────────────────────────────────────────────────────────
  const NavItem = ({ id, icon, label, count }: { id: Section; icon: string; label: string; count?: number }) => (
    <button onClick={() => { setSection(id); setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 ${section === id ? 'bg-[#D4AF37] text-[#5F1517] shadow-lg shadow-[#D4AF37]/20 font-bold' : 'text-[#FFF7F2]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
      style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <span className="text-lg w-6 text-center flex-shrink-0 drop-shadow-md">{icon}</span>
      {(sidebarOpen || mobileMenuOpen) && <span className="flex-1 text-left text-xs tracking-wide">{label}</span>}
      {(sidebarOpen || mobileMenuOpen) && count !== undefined && count > 0 && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${section === id ? 'bg-[#5F1517] text-[#D4AF37]' : 'bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]'}`}>{count}</span>
      )}
    </button>
  );

  const NavLabel = ({ label }: { label: string }) => (sidebarOpen || mobileMenuOpen) ? (
    <div className="px-4 pt-5 pb-2 text-[9px] font-bold uppercase tracking-[4px] text-[#D4AF37]/40 drop-shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{label}</div>
  ) : <div className="my-3 border-t border-white/5 mx-2" />;

  // ─── LOGIN ────────────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a0305 0%, #3a0c0e 40%, #5F1517 70%, #3a0c0e 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#D4AF37]/8 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-sm z-10">
          <div className="text-center mb-10">
            <img src={logo} alt="Siri Samruddhi Gold" className="w-24 h-auto object-contain mx-auto mb-5 drop-shadow-2xl" />
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
              <span className="text-[#D4AF37]/80 text-[10px] uppercase tracking-[5px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Admin Portal</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
            </div>
            <h1 className="text-3xl text-[#FFF7F2] font-semibold tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Siri Samruddhi</h1>
          </div>
          <div className="bg-[#1a0305]/60 backdrop-blur-2xl rounded-3xl border border-[#D4AF37]/20 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
            {loginErr && <div className="bg-red-900/40 border border-red-500/40 text-red-300 p-3 rounded-xl mb-5 text-xs text-center font-medium tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>{loginErr}</div>}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] text-[#D4AF37]/70 uppercase tracking-widest mb-2 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Username</label>
                <input type="text" value={loginU} onChange={e => setLoginU(e.target.value)} required
                  className="w-full px-4 py-3.5 bg-black/20 border border-[#D4AF37]/20 rounded-xl text-[#FFF7F2] placeholder-[#FFF7F2]/20 focus:outline-none focus:border-[#D4AF37]/80 focus:ring-1 focus:ring-[#D4AF37]/30 transition text-sm shadow-inner"
                  style={{ fontFamily: 'Montserrat, sans-serif' }} placeholder="Enter username" />
              </div>
              <div>
                <label className="block text-[10px] text-[#D4AF37]/70 uppercase tracking-widest mb-2 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Password</label>
                <input type="password" value={loginP} onChange={e => setLoginP(e.target.value)} required
                  className="w-full px-4 py-3.5 bg-black/20 border border-[#D4AF37]/20 rounded-xl text-[#FFF7F2] placeholder-[#FFF7F2]/20 focus:outline-none focus:border-[#D4AF37]/80 focus:ring-1 focus:ring-[#D4AF37]/30 transition text-sm shadow-inner"
                  style={{ fontFamily: 'Montserrat, sans-serif' }} placeholder="Enter password" />
              </div>
              <button type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#e8c547] to-[#D4AF37] text-[#3a0c0e] font-bold rounded-xl text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] mt-4"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>Sign In</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Overview</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Welcome back to your store</p>
        </div>
        <button onClick={refreshAll} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          ↺ Refresh Dashboard
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: `₹${(stats.revenue / 1000).toFixed(1)}K`, icon: '💰', action: () => setSection('orders'), sub: 'Lifetime' },
          { label: 'Pending Orders', value: stats.pending, icon: '📦', action: () => setSection('orders'), sub: 'Requires action' },
          { label: 'Total Products', value: stats.products, icon: '💎', action: () => setSection('all-products'), sub: `${stats.onSale} on sale` },
          { label: 'Customers', value: stats.customers, icon: '🛍️', action: () => setSection('customers'), sub: 'Purchased' },
        ].map((s, i) => (
          <button key={i} onClick={s.action}
            className="group bg-white border border-[#D4AF37]/20 rounded-2xl p-6 hover:border-[#D4AF37]/60 shadow-sm hover:shadow-lg hover:shadow-[#D4AF37]/10 transition-all text-left relative overflow-hidden"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-3xl drop-shadow-sm">{s.icon}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]/70 border border-[#D4AF37]/20 bg-[#FFF7F2] px-2.5 py-1 rounded-full">{s.sub}</span>
            </div>
            <div className="text-3xl font-bold text-[#5F1517] tracking-tight relative z-10" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{s.value}</div>
            <div className="text-[11px] font-semibold text-[#5F1517]/50 mt-1 uppercase tracking-widest relative z-10">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl">⚡</span>
            <h3 className="text-sm font-bold text-[#5F1517] uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Actions</h3>
          </div>
          <GoldDivider />
          <div className="grid grid-cols-1 gap-3 mt-5">
            {[
              { label: '+ Add New Product', s: 'add-product' as Section, bg: 'bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] hover:shadow-lg' },
              { label: '+ Add Collection', s: 'add-category' as Section, bg: 'bg-[#FFF7F2] text-[#5F1517] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10' },
              { label: '📦 Manage Orders', s: 'orders' as Section, bg: 'bg-[#FFF7F2] text-[#5F1517] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10' },
            ].map(a => (
              <button key={a.label} onClick={() => { if (a.s === 'add-product') { setPForm({ ...emptyProduct }); setEditPId(null); } setSection(a.s); }}
                className={`w-full px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${a.bg}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}>{a.label}</button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛍️</span>
              <h3 className="text-sm font-bold text-[#5F1517] uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Recent Orders</h3>
            </div>
            <button onClick={() => setSection('orders')} className="text-xs font-bold text-[#D4AF37] hover:text-[#5F1517] uppercase tracking-widest transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>View All</button>
          </div>
          <GoldDivider />
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF7F2] transition border border-transparent hover:border-[#D4AF37]/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFF7F2] border border-[#D4AF37]/30 flex items-center justify-center text-[#5F1517] font-bold text-xs">
                    {o.user_username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#5F1517] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.user_username}</div>
                    <div className="text-[10px] text-[#5F1517]/40 font-mono tracking-tight mt-0.5">#{o.id.slice(0, 8)} • {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{o.total_amount.toLocaleString()}</span>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-[#5F1517]/40 text-center py-6 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>No orders placed yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── ALL PRODUCTS ─────────────────────────────────────────────────────────────
  const renderAllProducts = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Products</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{filteredProducts.length} items found</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchProducts} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺ Refresh</button>
          <button onClick={() => { setPForm({ ...emptyProduct }); setEditPId(null); setPMsg({ text: '', type: '' }); setSection('add-product'); }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] text-xs font-bold rounded-xl hover:shadow-lg transition uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>+ Add Product</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#D4AF37]/20 shadow-sm rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Search</label>
          <input value={pSearch} onChange={e => setPSearch(e.target.value)} placeholder="Search by Name or SKU…"
            className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner" style={{ fontFamily: 'Montserrat, sans-serif' }} />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Collection</label>
          <select value={pCatFilter} onChange={e => setPCatFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner font-semibold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">All Collections</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Status</label>
          <select value={pStatusFilter} onChange={e => setPStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner font-semibold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Sort By</label>
          <select value={pSortBy} onChange={e => setPSortBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner font-semibold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="name">Name (A-Z)</option>
            <option value="price_asc">Price (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
          </select>
        </div>
        {(pSearch || pCatFilter || pStatusFilter || pSaleFilter) && (
          <button onClick={() => { setPSearch(''); setPCatFilter(''); setPStatusFilter(''); setPSaleFilter(''); }}
            className="px-4 py-2.5 text-xs font-bold text-[#5F1517]/50 uppercase tracking-widest border border-[#D4AF37]/20 rounded-xl hover:bg-[#FFF7F2] transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>✕ Clear</button>
        )}
      </div>

      {loading.products ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading catalogue…</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                  {['Product', 'Inventory', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#FFF7F2]/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#FFF7F2] flex-shrink-0 shadow-sm">
                          {p.image_url
                            ? <img src={getImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                            : <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">💎</div>
                          }
                        </div>
                        <div>
                          <div className="font-bold text-[#5F1517] text-sm max-w-[180px] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.name}</div>
                          <div className="text-[10px] text-[#5F1517]/40 font-mono mt-1 tracking-wider">{p.sku}</div>
                          {p.is_on_sale && <span className="inline-block mt-1 text-[9px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{p.sale_label || 'SALE'}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.stock} in stock</div>
                      <div className="text-[10px] text-[#5F1517]/50 uppercase tracking-widest mt-1 font-semibold">{p.weight || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F1517]/70 bg-[#FFF7F2] px-3 py-1.5 rounded-lg border border-[#D4AF37]/20" style={{ fontFamily: 'Montserrat, sans-serif' }}>{getCatName(p.category_id)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{p.price.toLocaleString()}</div>
                      {p.original_price && p.original_price > p.price && (
                        <div className="text-xs text-[#5F1517]/40 line-through mt-0.5">₹{p.original_price.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest ${p.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : p.status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => startEditProduct(p)}
                          className="px-3 py-2 text-[10px] font-bold text-[#5F1517] bg-white border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-xl transition uppercase tracking-widest shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Edit</button>
                        <button onClick={() => deleteProduct(p.id)}
                          className="px-3 py-2 text-[10px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition shadow-sm uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-24">
                    <div className="text-5xl mb-4 opacity-50">💍</div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#5F1517]/40" style={{ fontFamily: 'Montserrat, sans-serif' }}>No products found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ─── ADD / EDIT PRODUCT ───────────────────────────────────────────────────────
  const renderProductForm = () => (
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
          {editPId && pSnapshot.current && (
            <button type="button" onClick={handleRollbackProduct}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[#D4AF37] hover:text-[#5F1517] transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              ↩ Revert
            </button>
          )}
          <button onClick={fetchProducts} className="px-3 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 rounded-xl hover:border-[#D4AF37] hover:text-[#5F1517] transition" title="Refresh Data">↺</button>
        </div>
      </div>
      
      <Alert msg={pMsg} />
      
      <form onSubmit={handleProductSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info */}
            <SCard icon="📋" title="General Information">
              <div className="space-y-4">
                <Field label="Product Title" name="name" value={pForm.name} onChange={handlePInput} required placeholder="e.g. 22K Gold Antique Choker" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="SKU (Stock Keeping Unit)" name="sku" value={pForm.sku} onChange={handlePInput} required hint="Unique product code" />
                  <div>
                    <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Collection / Category</label>
                    <select name="category_id" value={pForm.category_id} onChange={handlePInput}
                      className="w-full px-4 py-3 border border-[#D4AF37]/30 shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:border-[#D4AF37] bg-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <option value="">— Select Collection —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Tags" name="tags" value={pForm.tags} onChange={handlePInput} placeholder="wedding, necklace, bridal" hint="Comma separated" />
                  <Field label="Vendor / Brand" name="vendor" value={pForm.vendor} onChange={handlePInput} placeholder="Siri Samruddhi Gold" />
                </div>
                <Field label="SEO Description" name="seo_description" value={pForm.seo_description} onChange={handlePInput} rows={3} hint="Meta description for search engines (150-160 chars)" />
              </div>
            </SCard>

            {/* Images */}
            <SCard icon="🖼️" title="Media & Gallery">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImgUpload label="Primary Thumbnail" url={pForm.image_url} onUpload={uploadMain}
                  onClear={() => setPForm(p => ({ ...p, image_url: '' }))}
                  onChange={e => setPForm(p => ({ ...p, image_url: e.target.value }))}
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
                    {(pForm.gallery_urls || []).map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={getImageUrl(url)} alt={`g${idx}`} className="w-20 h-20 object-cover rounded-xl border border-[#D4AF37]/30 shadow-sm" />
                        <button type="button" onClick={() => setPForm(p => ({ ...p, gallery_urls: p.gallery_urls.filter((_, i) => i !== idx) }))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110 border border-white">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SCard>

            {/* Physical Properties */}
            <SCard icon="📏" title="Jewelry Specifications">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <Field label="Gross Weight" name="approx_gross_weight" value={pForm.approx_gross_weight} onChange={handlePInput} placeholder="e.g. 15.5g" />
                <Field label="Metal" name="metal" value={pForm.metal} onChange={handlePInput} placeholder="e.g. Yellow Gold" />
                <Field label="Purity" name="metal_purity" value={pForm.metal_purity} onChange={handlePInput} placeholder="e.g. 22K" />
                <Field label="Gender" name="gender" value={pForm.gender} onChange={handlePInput} placeholder="Women / Men / Unisex" />
                <Field label="Ring Size" name="ring_size" value={pForm.ring_size} onChange={handlePInput} placeholder="e.g. 12 (Indian)" />
                <Field label="Bangle Size" name="bangle_size" value={pForm.bangle_size} onChange={handlePInput} placeholder="e.g. 2.4" />
                <Field label="Hallmark" name="hallmark" value={pForm.hallmark} onChange={handlePInput} placeholder="e.g. BIS Hallmarked" />
                <Field label="Finish" name="metal_finish" value={pForm.metal_finish} onChange={handlePInput} placeholder="e.g. Matte / Antique" />
                <Field label="Certification" name="gold_certification" value={pForm.gold_certification} onChange={handlePInput} />
              </div>
            </SCard>

            {/* Stones / Diamonds */}
            <SCard icon="💎" title="Diamond & Stone Details">
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
            <SCard icon="💰" title="Price Breakup Details">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Metal Value" name="metal_value" type="number" value={pForm.metal_value} onChange={handlePInput} />
                <Field label="Stone Value" name="stone_value" type="number" value={pForm.stone_value} onChange={handlePInput} />
                <Field label="Making Charges" name="making_charges_value" type="number" value={pForm.making_charges_value} onChange={handlePInput} />
                <Field label="Tax (GST)" name="tax_value" type="number" value={pForm.tax_value} onChange={handlePInput} />
                <Field label="Grand Total (Final)" name="grand_total_final" type="number" value={pForm.grand_total_final} onChange={handlePInput} />
              </div>
            </SCard>
          </div>

          <div className="space-y-6">
            {/* Pricing Status (Sidebar) */}
            <SCard icon="💵" title="Pricing & Status">
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
                <Field label="Final Price (₹)" name="price" type="number" value={pForm.price} onChange={handlePInput} required />
                <Field label="MRP / Original (₹)" name="original_price" type="number" value={pForm.original_price} onChange={handlePInput} hint="Strikethrough price" />
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
            <SCard icon="📦" title="Inventory & Shipping">
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

  // ─── ALL CATEGORIES ───────────────────────────────────────────────────────────
  const renderAllCategories = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Collections</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{categories.length} active categories</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={cSearch} onChange={e => setCSearch(e.target.value)} placeholder="Search collections…"
            className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-56" style={{ fontFamily: 'Montserrat, sans-serif' }} />
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
                {['Thumbnail', 'Collection Details', 'Products', 'Actions'].map(h => (
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
                    <div className="font-bold text-[#5F1517] text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>{c.name}</div>
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
              {categories.length === 0 && <tr><td colSpan={4} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No collections found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── ADD / EDIT CATEGORY ──────────────────────────────────────────────────────
  const renderCategoryForm = () => (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { setSection('all-categories'); setEditCId(null); setCForm({ ...emptyCat }); }} 
          className="p-2 text-[#5F1517]/50 hover:text-[#5F1517] bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] shadow-sm rounded-xl transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{editCId ? 'Edit Collection' : 'Create Collection'}</h2>
        {editCId && cSnapshot.current && (
          <button type="button" onClick={handleRollbackCat} className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[#D4AF37] hover:text-[#5F1517] transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↩ Revert</button>
        )}
      </div>
      <Alert msg={cMsg} />
      <form onSubmit={handleCatSubmit}>
        <SCard icon="📂" title="Collection Settings">
          <div className="space-y-5">
            <Field label="Collection Name" name="name" value={cForm.name} onChange={handleCInput} required placeholder="e.g. Bridal Necklaces" />
            <Field label="Description" name="description" value={cForm.description} onChange={handleCInput} rows={4} placeholder="Describe this collection..." />
            <ImgUpload label="Cover Image" url={cForm.image_url}
              onUpload={uploadCatImg}
              onClear={() => setCForm(p => ({ ...p, image_url: '' }))}
              onChange={e => setCForm(p => ({ ...p, image_url: e.target.value }))}
              loading={uploadingCat} name="image_url" />
          </div>
        </SCard>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-2xl uppercase tracking-[0.2em] text-sm hover:from-[#801416] hover:to-[#a01a1c] transition-all shadow-[0_4px_15px_rgba(95,21,23,0.3)] hover:shadow-[0_6px_20px_rgba(95,21,23,0.4)]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {editCId ? '💾 Save Collection' : '+ Create Collection'}
          </button>
          {editCId && (
            <button type="button" onClick={() => { setCForm({ ...emptyCat }); setEditCId(null); setSection('all-categories'); }} className="px-8 py-4 bg-white border border-[#D4AF37]/40 text-[#5F1517]/70 font-bold rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-[#FFF7F2] hover:text-[#5F1517] transition-all shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  );

  // ─── ORDERS ───────────────────────────────────────────────────────────────────
  const renderOrders = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Orders</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{filteredOrders.length} records found</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={oSearch} onChange={e => setOSearch(e.target.value)} placeholder="Search Order ID / Customer…" className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-56" style={{ fontFamily: 'Montserrat, sans-serif' }} />
          <select value={oStatusFilter} onChange={e => setOStatusFilter(e.target.value)} className="px-4 py-2.5 border border-[#D4AF37]/30 shadow-sm rounded-xl text-xs bg-white font-semibold text-[#5F1517] focus:outline-none focus:border-[#D4AF37]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">All Statuses</option>
            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={fetchOrders} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺</button>
        </div>
      </div>
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                {['Order ID & Date', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-[#FFF7F2]/60 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs text-[#5F1517] font-bold">#{o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-[10px] font-semibold text-[#5F1517]/50 mt-1 uppercase tracking-wider">{new Date(o.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5F1517] to-[#801416] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-inner">
                        {o.user_username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-[#5F1517] font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.user_username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-[#5F1517]/70" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.items?.length || 0}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{o.total_amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.payment_method}</td>
                  <td className="px-5 py-4">
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                      className={`px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer ${STATUS_COLORS[o.status] || 'bg-white text-gray-700'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && <tr><td colSpan={6} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── CUSTOMERS (Buyers) ───────────────────────────────────────────────────────
  const renderCustomers = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Customers</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Users with at least 1 order</p>
        </div>
        <button onClick={fetchUsers} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺ Refresh Data</button>
      </div>
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                {['Profile', 'Full Name', 'Contact Info', 'Lifetime Value', 'Orders'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {customers.map((u) => {
                const userOrders = orders.filter(o => o.user_username === u.username);
                const ltv = userOrders.reduce((acc, o) => acc + o.total_amount, 0);
                return (
                  <tr key={u.id} className="hover:bg-[#FFF7F2]/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5F1517] to-[#801416] flex items-center justify-center text-[#D4AF37] font-bold text-lg shadow-inner">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#5F1517] text-sm tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#5F1517]/80" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.full_name || '—'}</td>
                    <td className="px-5 py-4 text-xs font-medium text-[#5F1517]/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.email || '—'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{ltv.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs font-bold text-[#5F1517]/70 bg-[#FFF7F2] rounded-lg inline-block my-3 ml-2 border border-[#D4AF37]/20 px-3 py-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{userOrders.length}</td>
                  </tr>
                );
              })}
              {customers.length === 0 && <tr><td colSpan={5} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No purchasing customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── USERS (All registered users) ─────────────────────────────────────────────
  const renderUsers = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>All Users</h2>
          <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{users.length} registered accounts</p>
        </div>
        <button onClick={fetchUsers} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺ Refresh Data</button>
      </div>
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
              {['User', 'Full Name', 'Email', 'Account Status'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#FFF7F2]/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFF7F2] border border-[#D4AF37]/40 flex items-center justify-center text-[#5F1517] font-bold text-xs">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#5F1517] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.username}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#5F1517]/70" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.full_name || '—'}</td>
                <td className="px-5 py-4 text-xs font-medium text-[#5F1517]/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.email || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${u.disabled ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{u.disabled ? 'Disabled' : 'Active'}</span>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>No accounts registered yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
  const renderChangePw = () => (
    <div className="max-w-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-[#5F1517] mb-6 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Security Settings</h2>
      <Alert msg={pwMsg} />
      <SCard icon="🛡️" title="Change Admin Password">
        <form onSubmit={handleChangePw} className="space-y-5">
          {[{ l: 'Current Password', k: 'cur' }, { l: 'New Password', k: 'nw', h: 'Min. 6 characters required for security' }, { l: 'Confirm New Password', k: 'conf' }].map(f => (
            <div key={f.k}>
              <label className="block text-xs font-semibold text-[#5F1517]/70 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.l}</label>
              <input type="password" value={(pw as any)[f.k]} onChange={e => setPw(p => ({ ...p, [f.k]: e.target.value }))} required
                className="w-full px-4 py-3 border border-[#D4AF37]/30 shadow-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] bg-white transition" style={{ fontFamily: 'Montserrat, sans-serif' }} />
              {f.h && <p className="text-[10px] font-medium text-[#5F1517]/40 uppercase tracking-widest mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.h}</p>}
            </div>
          ))}
          {pw.nw && pw.conf && pw.nw !== pw.conf && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200" style={{ fontFamily: 'Montserrat, sans-serif' }}>⚠️ Passwords do not match</p>
          )}
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] font-bold rounded-2xl uppercase tracking-[0.2em] text-sm hover:from-[#801416] hover:to-[#a01a1c] transition-all shadow-[0_4px_15px_rgba(95,21,23,0.3)] hover:shadow-[0_6px_20px_rgba(95,21,23,0.4)] mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Update Password
          </button>
        </form>
        <div className="mt-6 p-4 bg-[#FFF7F2] border border-[#D4AF37]/30 rounded-xl text-xs font-semibold text-[#5F1517]/70 shadow-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <span className="text-lg mr-2">⚠️</span> The new password takes effect immediately for this session. <span className="text-[#D4AF37]">You must restart the backend server</span> for the change to persist permanently in the configuration file.
        </div>
      </SCard>
    </div>
  );

  // ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#FFF7F2] relative">
      <Toast msg={toast} onClose={() => setToast({ text: '', type: '' })} />

      {/* Mobile Sidebar Overlay Background */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#5F1517]/80 backdrop-blur-sm z-40 sm:hidden transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed sm:relative top-0 left-0 h-full z-50 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full sm:translate-x-0'} ${sidebarOpen ? 'sm:w-64' : 'sm:w-20'}`}
        style={{ background: '#5F1517', borderRight: '1px solid rgba(212,175,55,0.3)' }}>

        {/* Logo */}
        <div className={`flex items-center gap-3 p-5 border-b border-[#D4AF37]/15 ${(sidebarOpen || mobileMenuOpen) ? '' : 'justify-center'}`}>
          <img src={logo} alt="Siri Samruddhi" className="w-10 h-10 object-contain flex-shrink-0 drop-shadow-lg" />
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="overflow-hidden">
              <div className="text-[#D4AF37] font-bold text-base tracking-tight whitespace-nowrap" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Siri Samruddhi</div>
              <div className="text-[#D4AF37]/50 text-[9px] uppercase font-bold tracking-[0.3em] whitespace-nowrap mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Admin Portal</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} className={`hidden sm:block ${sidebarOpen ? 'ml-auto' : ''} text-[#D4AF37]/40 hover:text-[#D4AF37] transition p-1.5 text-xs flex-shrink-0 bg-white/5 rounded-full hover:bg-white/10`}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="sm:hidden ml-auto text-[#D4AF37]/70 text-xl font-bold p-1">×</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          <NavItem id="dashboard" icon="📊" label="Dashboard" />
          <NavLabel label="Catalogue" />
          <NavItem id="all-products" icon="💎" label="All Products" count={stats.products} />
          <NavItem id="add-product" icon="➕" label={editPId ? 'Edit Product' : 'Add Product'} />
          <NavItem id="all-categories" icon="📂" label="Collections" count={stats.categories} />
          <NavItem id="add-category" icon="🗂️" label={editCId ? 'Edit Collection' : 'Add Collection'} />
          <NavLabel label="Commerce" />
          <NavItem id="orders" icon="📦" label="Orders" count={stats.pending} />
          <NavItem id="customers" icon="🛍️" label="Customers" count={stats.customers} />
          <NavItem id="users" icon="👥" label="Users" />
          <NavLabel label="Account" />
          <NavItem id="change-password" icon="🛡️" label="Security" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#D4AF37]/15 bg-black/10">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[#FFF7F2]/40 hover:text-red-300 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition ${(sidebarOpen || mobileMenuOpen) ? '' : 'justify-center'}`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="text-xl flex-shrink-0">🚪</span>
            {(sidebarOpen || mobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col relative z-10 w-full">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="sm:hidden text-[#5F1517] p-1 focus:outline-none">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#5F1517] capitalize tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {section === 'all-products' ? 'Products' : section === 'add-product' ? (editPId ? 'Edit Product' : 'Add Product') : section === 'all-categories' ? 'Collections' : section === 'add-category' ? (editCId ? 'Edit Collection' : 'Add Collection') : section === 'change-password' ? 'Security Settings' : section === 'customers' ? 'Customers' : section === 'users' ? 'All Users' : section.charAt(0).toUpperCase() + section.slice(1)}
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#5F1517]/40 uppercase tracking-[0.2em] mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Siri Samruddhi Gold Palace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#FFF7F2] border border-[#D4AF37]/30 pl-2 pr-4 py-1.5 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5F1517] to-[#801416] flex items-center justify-center text-[#D4AF37] text-[10px] font-bold shadow-inner">A</div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
          {section === 'dashboard' && renderDashboard()}
          {section === 'all-products' && renderAllProducts()}
          {section === 'add-product' && renderProductForm()}
          {section === 'all-categories' && renderAllCategories()}
          {section === 'add-category' && renderCategoryForm()}
          {section === 'orders' && renderOrders()}
          {section === 'customers' && renderCustomers()}
          {section === 'users' && renderUsers()}
          {section === 'change-password' && renderChangePw()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
