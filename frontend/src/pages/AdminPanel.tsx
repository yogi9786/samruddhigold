import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Package, Link as LinkIcon, Image as ImageIcon, Ruler, Gem, Calculator, DollarSign, Folder, Shield, TrendingUp } from 'lucide-react';
import api, { adminApi, getImageUrl } from '../api';
import logo from '../assets/samruddhi-logo.png';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
// Primary: #5F1517  Accent: #801416  Gold: #D4AF37  Cream: #FFF7F2

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; description?: string; image_url?: string; parent_id?: string; slug?: string; display_type?: string; }
interface Order { id: string; items: any[]; total_amount: number; shipping_address: string; contact_phone: string; email?: string; full_name?: string; payment_method: string; razorpay_order_id?: string; razorpay_payment_id?: string; user_username: string; status: string; created_at: string; updated_at: string; }
interface User { id: string; username: string; email?: string; full_name?: string; disabled: boolean; }
interface Product {
  id: string; name: string; sku: string; price: number; original_price?: number;
  discount_text?: string; ready_to_dispatch?: boolean; transit_insurance?: boolean;
  image_url?: string; gallery_urls?: string[]; category_id?: string;
  is_on_sale?: boolean; sale_price?: number; sale_label?: string;
  price_breakup?: any; basic_info?: any; stone_info?: any; other_info?: any; return_policy?: any;
  status?: string; stock?: number; weight?: string; tags?: string; vendor?: string; seo_title?: string; seo_description?: string;
  description?: string; quantity?: number;
  // WooCommerce fields
  product_type?: string; slug?: string; short_description?: string;
  manage_stock?: boolean; allow_backorders?: string; low_stock_threshold?: number;
  sold_individually?: boolean; dimensions?: any; shipping_class?: string;
  upsells?: string[]; cross_sells?: string[]; attributes?: any[];
  purchase_note?: string; menu_order?: number; enable_reviews?: boolean;
}

type Section = 'dashboard' | 'all-products' | 'add-product' | 'all-categories' | 'add-category' | 'orders' | 'customers' | 'users' | 'change-password' | 'settings' | 'metal-prices' | 'virtual-bookings' | 'subscriptions';

const emptyProduct = {
  name: '', sku: '', price: 0, original_price: 0, discount_text: '',
  ready_to_dispatch: false, transit_insurance: false, image_url: '',
  gallery_urls: [] as string[], category_id: '',
  is_on_sale: false, sale_price: 0, sale_label: '',
  status: 'active', stock: 0, weight: '', tags: '', vendor: '',
  seo_title: '', seo_description: '',
  description: '', quantity: 1,
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
  return_days: '',
  // WooCommerce fields
  product_type: 'simple', slug: '', short_description: '',
  manage_stock: false, allow_backorders: 'no', low_stock_threshold: 0,
  sold_individually: false, dimensions: { length: '', width: '', height: '' }, shipping_class: '',
  upsells: [] as string[], cross_sells: [] as string[], attributes: [] as any[],
  purchase_note: '', menu_order: 0, enable_reviews: true
};
const emptyCat = { name: '', description: '', image_url: '', parent_id: '', slug: '', display_type: 'default' };

const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    alert('No data to export');
    return;
  }
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map((row: any) => keys.map((k: string) => {
      let val = row[k];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      if (typeof val === 'string') val = val.replace(/"/g, '""');
      return `"${val}"`;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
const SCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
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

  const [metalPrices, setMetalPrices] = useState<any[]>([]);
  const [virtualBookings, setVirtualBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [vSearch, setVSearch] = useState('');
  const [vStatusFilter, setVStatusFilter] = useState('');

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  const fetchVirtualBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const r = await adminApi.get('/virtual-shopping');
      setVirtualBookings(r.data);
    } catch {
      showToast('Failed to load video shopping bookings', 'error');
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubscriptions(true);
    try {
      const r = await adminApi.get('/subscriptions');
      setSubscriptions(r.data);
    } catch {
      showToast('Failed to load subscriptions', 'error');
    } finally {
      setLoadingSubscriptions(false);
    }
  }, []);

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

  const fetchMetalPrices = useCallback(async () => {
    try {
      const r = await adminApi.get('/metal-prices');
      setMetalPrices(r.data);
    } catch { showToast('Failed to load metal rates', 'error'); }
  }, []);

  const refreshAll = useCallback(() => { 
    fetchProducts(); 
    fetchCategories(); 
    fetchOrders(); 
    fetchUsers(); 
    fetchMetalPrices(); 
    fetchVirtualBookings();
    fetchSubscriptions();
  }, [fetchProducts, fetchCategories, fetchOrders, fetchUsers, fetchMetalPrices, fetchVirtualBookings, fetchSubscriptions]);

  useEffect(() => { 
    if (token) refreshAll(); 
  }, [token, refreshAll]);

  // Derived state for customers (users who have at least 1 order)
  const customers = users.filter(u => orders.some(o => o.user_username === u.username));
  useEffect(() => { setStats(s => ({ ...s, customers: customers.length })); }, [customers.length]);

  // Auto price calculation based on daily live rates & category purity
  useEffect(() => {
    const selectedCat = categories.find(c => c.id === pForm.category_id);
    const catNameLower = selectedCat ? selectedCat.name.toLowerCase() : '';
    
    let rateKey = 'gold_22k';
    if (catNameLower.includes('silver')) {
      rateKey = 'silver';
    } else if (catNameLower.includes('24k') || pForm.metal_purity?.toLowerCase().includes('24')) {
      rateKey = 'gold_24k';
    } else if (catNameLower.includes('18k') || pForm.metal_purity?.toLowerCase().includes('18')) {
      rateKey = 'gold_18k';
    }

    const rateItem = metalPrices.find(m => m.id === rateKey) || metalPrices.find(m => m.id.includes('gold')) || metalPrices[0];
    const goldRateVal = rateItem ? rateItem.price : 13275;

    const goldWeight = Number(pForm.gold_weight) || 0;
    const metalVal = Math.round(goldRateVal * goldWeight);
    const stoneVal = Number(pForm.stone_value) || 0;
    const makingChargesBase = Number(pForm.making_charges_value) || 0;
    const makingChargesDisc = Number(pForm.making_charges_discount) || 0;
    const makingChargesFinalVal = Math.max(0, makingChargesBase - makingChargesDisc);

    const subTotalVal = metalVal + stoneVal + makingChargesBase;
    const subTotalFinalVal = metalVal + stoneVal + makingChargesFinalVal;

    const gstVal = Math.round(subTotalVal * 0.03);
    const gstFinalVal = Math.round(subTotalFinalVal * 0.03);

    const grandTotalVal = subTotalVal + gstVal;
    const grandTotalFinalVal = subTotalFinalVal + gstFinalVal;

    setPForm(prev => {
      if (
        prev.metal_value === metalVal &&
        prev.gold_rate === String(goldRateVal) &&
        prev.making_charges_final === makingChargesFinalVal &&
        prev.sub_total_value === subTotalVal &&
        prev.sub_total_final === subTotalFinalVal &&
        prev.tax_value === gstVal &&
        prev.tax_final === gstFinalVal &&
        prev.grand_total_value === grandTotalVal &&
        prev.grand_total_final === grandTotalFinalVal &&
        prev.price === grandTotalFinalVal &&
        prev.original_price === grandTotalVal
      ) {
        return prev;
      }
      return {
        ...prev,
        metal_value: metalVal,
        gold_rate: String(goldRateVal),
        making_charges_final: makingChargesFinalVal,
        sub_total_value: subTotalVal,
        sub_total_final: subTotalFinalVal,
        tax_value: gstVal,
        tax_final: gstFinalVal,
        grand_total_value: grandTotalVal,
        grand_total_final: grandTotalFinalVal,
        price: grandTotalFinalVal,
        original_price: grandTotalVal,
      };
    });
  }, [
    pForm.category_id,
    pForm.metal_purity,
    pForm.gold_weight,
    pForm.stone_value,
    pForm.making_charges_value,
    pForm.making_charges_discount,
    metalPrices,
  ]);

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
    description: pForm.description, quantity: pForm.quantity,
    price_breakup: { metal_value: pForm.metal_value, gold_rate: pForm.gold_rate, gold_weight: pForm.gold_weight, stone_value: pForm.stone_value, stone_weight: pForm.stone_weight, making_charges_value: pForm.making_charges_value, making_charges_discount: pForm.making_charges_discount, making_charges_final: pForm.making_charges_final, sub_total_value: pForm.sub_total_value, sub_total_final: pForm.sub_total_final, tax_value: pForm.tax_value, tax_final: pForm.tax_final, grand_total_value: pForm.grand_total_value, grand_total_final: pForm.grand_total_final },
    basic_info: { height: pForm.height, material: pForm.material, metal: pForm.metal, metal_purity: pForm.metal_purity, width: pForm.width, approx_gross_weight: pForm.approx_gross_weight },
    stone_info: { stone_1_name: pForm.stone_1_name, stone_1_weight: pForm.stone_1_weight, diamond_type: pForm.diamond_type, diamond_clarity: pForm.diamond_clarity, diamond_color: pForm.diamond_color, total_diamond_weight: pForm.total_diamond_weight, no_of_diamonds: pForm.no_of_diamonds, stone_shape: pForm.stone_shape, stone_setting: pForm.stone_setting },
    other_info: { chain_included: pForm.chain_included, earring_type: pForm.earring_type, gold_certification: pForm.gold_certification, metal_finish: pForm.metal_finish, occasion: pForm.occasion, hallmark: pForm.hallmark, gender: pForm.gender, ring_size: pForm.ring_size, bangle_size: pForm.bangle_size },
    return_policy: { return_days: pForm.return_days },
    product_type: pForm.product_type, slug: pForm.slug || null, short_description: pForm.short_description || null,
    manage_stock: pForm.manage_stock, allow_backorders: pForm.allow_backorders, low_stock_threshold: pForm.low_stock_threshold || null,
    sold_individually: pForm.sold_individually, dimensions: pForm.dimensions, shipping_class: pForm.shipping_class || null,
    upsells: pForm.upsells, cross_sells: pForm.cross_sells, attributes: pForm.attributes,
    purchase_note: pForm.purchase_note || null, menu_order: pForm.menu_order, enable_reviews: pForm.enable_reviews
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
      description: p.description || '', quantity: p.quantity || 1,
      
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
      
      return_days: p.return_policy?.return_days || '',
      
      product_type: p.product_type || 'simple', slug: p.slug || '', short_description: p.short_description || '',
      manage_stock: p.manage_stock || false, allow_backorders: p.allow_backorders || 'no', low_stock_threshold: p.low_stock_threshold || 0,
      sold_individually: p.sold_individually || false, dimensions: p.dimensions || { length: '', width: '', height: '' },
      shipping_class: p.shipping_class || '', upsells: p.upsells || [], cross_sells: p.cross_sells || [],
      attributes: p.attributes || [], purchase_note: p.purchase_note || '', menu_order: p.menu_order || 0,
      enable_reviews: p.enable_reviews !== undefined ? p.enable_reviews : true
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
      const payload = { name: cForm.name, description: cForm.description, image_url: cForm.image_url, parent_id: (cForm as any).parent_id || null, slug: (cForm as any).slug || null, display_type: (cForm as any).display_type || 'default' };
      if (editCId) { await adminApi.put(`/categories/${editCId}`, payload); showToast('Category updated!'); }
      else { await adminApi.post('/categories', payload); showToast('Category added!'); }
      setCForm({ ...emptyCat }); setEditCId(null); cSnapshot.current = null;
      fetchCategories(); setSection('all-categories');
    } catch (err: any) { showToast('Error: ' + (err.response?.data?.detail || err.message), 'error'); }
  };

  const startEditCat = (c: Category) => {
    const form = { name: c.name, description: c.description || '', image_url: c.image_url || '', parent_id: c.parent_id || '', slug: c.slug || '', display_type: c.display_type || 'default' };
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

  // ─── Virtual Shopping Bookings Handlers ──────────────────────────────────────
  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await adminApi.put(`/virtual-shopping/${id}`, { status });
      fetchVirtualBookings();
      showToast(`Booking marked as ${status}`);
    } catch {
      showToast('Failed to update booking status', 'error');
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this video shopping booking? This action cannot be undone.')) return;
    try {
      await adminApi.delete(`/virtual-shopping/${id}`);
      fetchVirtualBookings();
      showToast('Booking deleted successfully');
    } catch {
      showToast('Failed to delete booking', 'error');
    }
  };

  const viewBookingDetails = async (id: string) => {
    try {
      const r = await adminApi.get(`/virtual-shopping/${id}`);
      setSelectedBooking(r.data);
      setIsDetailModalOpen(true);
    } catch {
      showToast('Failed to load booking details', 'error');
    }
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

  // ─── Metal Prices Handlers ──────────────────────────────────────────────────
  const [mForm, setMForm] = useState({ id: '', name: '', price: 0, unit: '1g' });
  const [editMId, setEditMId] = useState<string | null>(null);

  const handleMInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMForm(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleMetalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMId) {
        await adminApi.put(`/metal-prices/${editMId}`, { price: mForm.price, name: mForm.name, unit: mForm.unit });
        showToast('Metal rate updated successfully!');
      } else {
        await adminApi.post('/metal-prices', mForm);
        showToast('Metal rate added successfully!');
      }
      setMForm({ id: '', name: '', price: 0, unit: '1g' });
      setEditMId(null);
      fetchMetalPrices();
    } catch (err: any) {
      showToast('Error: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const deleteMetalPrice = async (id: string) => {
    if (!confirm('Delete this metal rate? It will no longer display in the header.')) return;
    try {
      await adminApi.delete(`/metal-prices/${id}`);
      fetchMetalPrices();
      showToast('Metal rate deleted successfully!');
    } catch (err: any) {
      showToast('Delete failed: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const startEditMetal = (mp: any) => {
    setMForm({ id: mp.id, name: mp.name, price: mp.price, unit: mp.unit });
    setEditMId(mp.id);
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
  const NavItem = ({ id, icon, label, count }: { id: Section; icon: React.ReactNode; label: string; count?: number }) => {
    const isActive = section === id;
    return (
      <button
        onClick={() => { setSection(id); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${
          isActive
            ? 'bg-gradient-to-r from-[#D4AF37] to-[#c9a32e] text-[#3a0c0e] shadow-md font-semibold'
            : 'text-[#FFF7F2]/60 hover:text-[#FFF7F2] hover:bg-white/8'
        }`}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {/* Active left indicator */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#3a0c0e] rounded-r-full" />
        )}
        <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${
          isActive ? 'text-[#3a0c0e]' : 'text-[#FFF7F2]/50 group-hover:text-[#D4AF37]'
        } transition-colors duration-200`}>
          {icon}
        </span>
        {(sidebarOpen || mobileMenuOpen) && (
          <span className="flex-1 text-left text-[11px] font-medium tracking-wide truncate">{label}</span>
        )}
        {(sidebarOpen || mobileMenuOpen) && count !== undefined && count > 0 && (
          <span className={`text-[9px] min-w-[18px] h-[18px] px-1 rounded-full font-bold flex items-center justify-center ${
            isActive
              ? 'bg-[#3a0c0e]/20 text-[#3a0c0e]'
              : 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
          }`}>{count}</span>
        )}
      </button>
    );
  };

  const NavLabel = ({ label }: { label: string }) => (sidebarOpen || mobileMenuOpen) ? (
    <div className="px-3 pt-5 pb-1.5 text-[9px] font-bold uppercase tracking-[3px] text-[#D4AF37]/35" style={{ fontFamily: 'Montserrat, sans-serif' }}>{label}</div>
  ) : <div className="my-4 mx-3 border-t border-white/8" />;

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
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Dashboard
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          {
            label: 'Total Revenue', value: `₹${(stats.revenue / 1000).toFixed(1)}K`,
            action: () => setSection('orders'), sub: 'Lifetime',
            color: 'from-emerald-50 to-white', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Pending Orders', value: stats.pending,
            action: () => setSection('orders'), sub: 'Requires action',
            color: 'from-amber-50 to-white', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ),
          },
          {
            label: 'Total Products', value: stats.products,
            action: () => setSection('all-products'), sub: `${stats.onSale} on sale`,
            color: 'from-violet-50 to-white', iconBg: 'bg-violet-100', iconColor: 'text-violet-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ),
          },
          {
            label: 'Customers', value: stats.customers,
            action: () => setSection('customers'), sub: 'Purchased',
            color: 'from-sky-50 to-white', iconBg: 'bg-sky-100', iconColor: 'text-sky-600',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5c-1.657 0-3 1.343-3 3s1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5C6.343 5 5 6.343 5 8s1.343 3 3 3zm8 2c2.209 0 4 1.791 4 4H4c0-2.209 1.791-4 4-4h8z" />
              </svg>
            ),
          },
        ].map((s, i) => (
          <button key={i} onClick={s.action}
            className={`group bg-gradient-to-br ${s.color} border border-[#D4AF37]/15 rounded-2xl p-5 hover:border-[#D4AF37]/40 shadow-sm hover:shadow-md hover:shadow-[#D4AF37]/10 transition-all text-left relative overflow-hidden`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="absolute -right-3 -top-3 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/8 to-transparent rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} ${s.iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                {s.icon}
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#5F1517]/40 border border-[#D4AF37]/15 bg-white/60 px-2 py-1 rounded-full leading-tight text-right">{s.sub}</span>
            </div>
            <div className="text-2xl font-bold text-[#5F1517] tracking-tight relative z-10" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{s.value}</div>
            <div className="text-[10px] font-semibold text-[#5F1517]/45 mt-1 uppercase tracking-widest relative z-10">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF7F2] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[#5F1517] uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Actions</h3>
          </div>
          <GoldDivider />
          <div className="grid grid-cols-1 gap-3 mt-5">
            {[
              { label: 'Add New Product', s: 'add-product' as Section, bg: 'bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] hover:shadow-lg', withPlus: true },
              { label: 'Add Collection', s: 'add-category' as Section, bg: 'bg-[#FFF7F2] text-[#5F1517] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10', withPlus: true },
              { label: 'Manage Orders', s: 'orders' as Section, bg: 'bg-[#FFF7F2] text-[#5F1517] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10', withBox: true },
            ].map(a => (
              <button key={a.label} onClick={() => { if (a.s === 'add-product') { setPForm({ ...emptyProduct }); setEditPId(null); } setSection(a.s); }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${a.bg}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {a.withPlus && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {a.withBox && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFF7F2] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5c-1.657 0-3 1.343-3 3s1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5C6.343 5 5 6.343 5 8s1.343 3 3 3zm8 2c2.209 0 4 1.791 4 4H4c0-2.209 1.791-4 4-4h8z" />
                </svg>
              </div>
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
                    {String(o.full_name || o.user_username || 'Guest').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#5F1517] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.full_name || o.user_username || 'Guest Customer'}</div>
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
          <button onClick={() => exportToCSV(filteredProducts, 'products.csv')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
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
          <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Category</label>
          <select value={pCatFilter} onChange={e => setPCatFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-[#D4AF37]/30 rounded-xl text-xs bg-white text-[#5F1517] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">All Categories</option>
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
  const renderProductForm = () => {
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
                      <select name="manage_stock" value={pForm.manage_stock ? 'true' : 'false'} onChange={(e) => setPForm(p => ({ ...p, manage_stock: e.target.value === 'true' }))}
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
                      <select name="sold_individually" value={pForm.sold_individually ? 'true' : 'false'} onChange={(e) => setPForm(p => ({ ...p, sold_individually: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 border border-[#D4AF37]/30 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <option value="false">No</option>
                        <option value="true">Yes (Max 1 per order)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#D4AF37]/20 pt-4 mt-4">
                    <h4 className="text-xs font-bold text-[#5F1517]/70 uppercase tracking-widest mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Shipping Dimensions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <Field label="Length" name="length" value={pForm.dimensions?.length || ''} onChange={(e: any) => setPForm(p => ({ ...p, dimensions: { ...p.dimensions, length: e.target.value } }))} placeholder="cm" />
                      <Field label="Width" name="width" value={pForm.dimensions?.width || ''} onChange={(e: any) => setPForm(p => ({ ...p, dimensions: { ...p.dimensions, width: e.target.value } }))} placeholder="cm" />
                      <Field label="Height" name="height" value={pForm.dimensions?.height || ''} onChange={(e: any) => setPForm(p => ({ ...p, dimensions: { ...p.dimensions, height: e.target.value } }))} placeholder="cm" />
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
                      <select name="enable_reviews" value={pForm.enable_reviews ? 'true' : 'false'} onChange={(e) => setPForm(p => ({ ...p, enable_reviews: e.target.value === 'true' }))}
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

  // ─── ALL CATEGORIES ───────────────────────────────────────────────────────────
  const renderAllCategories = () => (
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

  // ─── ADD / EDIT CATEGORY ──────────────────────────────────────────────────────
  const renderCategoryForm = () => (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { setSection('all-categories'); setEditCId(null); setCForm({ ...emptyCat }); }} 
          className="p-2 text-[#5F1517]/50 hover:text-[#5F1517] bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] shadow-sm rounded-xl transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{editCId ? 'Edit Category' : 'Create Category'}</h2>
        {editCId && cSnapshot.current && (
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
              onClear={() => setCForm(p => ({ ...p, image_url: '' }))}
              onChange={e => setCForm(p => ({ ...p, image_url: e.target.value }))}
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
          <button onClick={() => exportToCSV(filteredOrders, 'orders.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button onClick={fetchOrders} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺</button>
        </div>
      </div>
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                {['Order ID & Date', 'Customer', 'Address', 'Total', 'Payment', 'Status'].map(h => (
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5F1517] to-[#801416] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-inner flex-shrink-0">
                        {String(o.full_name || o.user_username || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm text-[#5F1517] font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.full_name || o.user_username || 'Guest Customer'}</div>
                        <div className="text-[10px] text-[#5F1517]/60 mt-0.5">{o.email || 'No email'}</div>
                        <div className="text-[10px] text-[#5F1517]/60">{o.contact_phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[10px] font-medium text-[#5F1517]/80 max-w-[200px] whitespace-pre-wrap break-words">{o.shipping_address}</div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>₹{o.total_amount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>{o.payment_method}</div>
                    {o.razorpay_payment_id && (
                      <div className="text-[9px] mt-1 text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full inline-block">
                        Paid: {o.razorpay_payment_id}
                      </div>
                    )}
                  </td>
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
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => exportToCSV(customers, 'customers.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
          <button onClick={fetchUsers} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺ Refresh Data</button>
        </div>
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
                          {String(u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#5F1517] text-sm tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.username || 'Unknown User'}</span>
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
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => exportToCSV(users, 'users.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
          <button onClick={fetchUsers} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>↺ Refresh Data</button>
        </div>
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
                      {String(u.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#5F1517] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{u.username || 'Unknown User'}</span>
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

  // ─── METAL PRICES MANAGEMENT ────────────────────────────────────────────────
  const renderMetalPrices = () => (
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

  // ─── VIRTUAL BOOKINGS ─────────────────────────────────────────────────────────
  const renderVirtualBookings = () => {
    const filteredBookings = virtualBookings.filter(b => {
      const matchSearch = !vSearch || 
        b.name.toLowerCase().includes(vSearch.toLowerCase()) || 
        b.email.toLowerCase().includes(vSearch.toLowerCase()) || 
        b.phone.includes(vSearch) ||
        b.city_or_country.toLowerCase().includes(vSearch.toLowerCase());
      const matchStatus = !vStatusFilter || b.status === vStatusFilter;
      return matchSearch && matchStatus;
    });

    const BOOKING_STATUS_COLORS: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
      Confirmed: 'bg-green-100 text-green-700 border border-green-200',
      Completed: 'bg-blue-100 text-blue-700 border border-blue-200',
      Cancelled: 'bg-red-100 text-red-700 border border-red-200',
    };

    return (
      <div className="animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Video Shopping Bookings</h2>
            <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {filteredBookings.length} appointments scheduled
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => exportToCSV(filteredBookings, 'virtual-bookings.csv')} className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button 
              onClick={fetchVirtualBookings} 
              disabled={loadingBookings}
              className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition disabled:opacity-50 flex items-center gap-1.5" 
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loadingBookings ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-[#5F1517]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Refreshing...
                </>
              ) : (
                '↺ Refresh Data'
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#D4AF37]/20 shadow-sm rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Search Bookings</label>
            <input 
              value={vSearch} 
              onChange={e => setVSearch(e.target.value)} 
              placeholder="Search by Name, Email, Phone, City..."
              className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner" 
              style={{ fontFamily: 'Montserrat, sans-serif' }} 
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Status</label>
            <select 
              value={vStatusFilter} 
              onChange={e => setVStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner font-semibold text-[#5F1517]" 
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                  {['Date & Time', 'Customer Details', 'Location', 'Category & Lang', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FFF7F2]/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-[#5F1517]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{b.booking_date}</div>
                      <div className="text-xs text-[#A56B25] font-semibold flex items-center gap-1 mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <span className="text-xs">🕒</span> {b.booking_time} (IST)
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#5F1517] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{b.name}</div>
                      <div className="text-xs text-[#5F1517]/60 mt-0.5">{b.email}</div>
                      <div className="text-xs text-[#5F1517]/60 font-mono mt-0.5">{b.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#5F1517]/80" style={{ fontFamily: 'Montserrat, sans-serif' }}>{b.city_or_country}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-[#5F1517]">{b.category}</div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">Lang: {b.language}</div>
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        value={b.status} 
                        onChange={e => updateBookingStatus(b.id, e.target.value)}
                        className={`px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer ${BOOKING_STATUS_COLORS[b.status] || 'bg-white text-gray-700'}`} 
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewBookingDetails(b.id)} 
                          className="px-3 py-1.5 text-[10px] font-bold text-[#5F1517] bg-white border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-lg transition uppercase tracking-widest shadow-sm"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => deleteBooking(b.id)} 
                          className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition uppercase tracking-widest shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      No video shopping bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
  const renderSubscriptions = () => {
    const filteredSubs = subscriptions.filter(sub => {
      const matchSearch = !subSearch || 
        (sub.email && sub.email.toLowerCase().includes(subSearch.toLowerCase())) || 
        (sub.phone && sub.phone.includes(subSearch));
      return matchSearch;
    });

    return (
      <div className="animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#5F1517] tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Newsletter Subscriptions</h2>
            <p className="text-xs text-[#5F1517]/50 mt-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {filteredSubs.length} subscribers found
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => exportToCSV(filteredSubs, 'subscriptions.csv')} className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>
            <button 
              onClick={fetchSubscriptions} 
              disabled={loadingSubscriptions}
              className="px-5 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517] text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition disabled:opacity-50 flex items-center gap-1.5" 
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loadingSubscriptions ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-[#5F1517]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Refreshing...
                </>
              ) : (
                '↺ Refresh Data'
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#D4AF37]/20 shadow-sm rounded-2xl p-5 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em] mb-1.5">Search Subscribers</label>
            <input 
              value={subSearch} 
              onChange={e => setSubSearch(e.target.value)} 
              placeholder="Search by Email or Phone..."
              className="w-full px-4 py-2.5 border border-[#D4AF37]/20 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] bg-[#FFF7F2] shadow-inner" 
              style={{ fontFamily: 'Montserrat, sans-serif' }} 
            />
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 bg-[#FFF7F2]">
                  {['Date Subscribed', 'Email Address', 'Phone Number'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-[#5F1517]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FFF7F2]/40 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-500 font-semibold">
                      {new Date(sub.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#5F1517]">
                      {sub.email || <span className="text-gray-400 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-700">
                      {sub.phone || <span className="text-gray-400 font-normal">—</span>}
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-16 text-[#5F1517]/40 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
  const renderChangePw = () => (
    <div className="max-w-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-[#5F1517] mb-6 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Security Settings</h2>
      <Alert msg={pwMsg} />
      <SCard icon={<Shield />} title="Change Admin Password">
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

      {/* Booking Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/30 shadow-2xl max-w-lg w-full overflow-hidden relative" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#5F1517] to-[#801416]" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#5F1517]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Video Booking Details</h3>
                  <p className="text-[10px] text-gray-500 font-mono tracking-tight mt-0.5">ID: {selectedBooking.id}</p>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
              </div>
              <div className="flex-1 h-px bg-gray-100 my-4" />
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-[#5F1517]/80">
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Customer Name</span>
                  <span className="text-sm font-bold text-[#5F1517]">{selectedBooking.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Phone Number</span>
                  <span className="text-sm font-bold text-[#5F1517]">{selectedBooking.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Email Address</span>
                  <span className="break-all">{selectedBooking.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">City or Country</span>
                  <span>{selectedBooking.city_or_country}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Preferred Language</span>
                  <span>{selectedBooking.language}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Requested Date</span>
                  <span className="text-sm font-bold text-[#801416]">{selectedBooking.booking_date}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Requested Time Slot</span>
                  <span className="text-sm font-bold text-[#801416]">{selectedBooking.booking_time} (IST)</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Shopping Category</span>
                  <span>{selectedBooking.category}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5F1517]/40 uppercase tracking-wider mb-0.5">Current Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    selectedBooking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    selectedBooking.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>{selectedBooking.status}</span>
                </div>
                <div className="col-span-2 bg-[#FFF7F2] p-4 rounded-xl border border-[#D4AF37]/20 mt-2">
                  <span className="block text-[10px] text-[#5F1517]/50 uppercase tracking-wider mb-1 font-bold">Requirement Details / Notes</span>
                  <p className="text-xs leading-relaxed text-[#5F1517] whitespace-pre-wrap font-medium">
                    {selectedBooking.requirement_details || 'No details provided.'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 bg-gradient-to-r from-[#5F1517] to-[#801416] text-[#D4AF37] text-xs font-bold rounded-xl uppercase tracking-widest hover:brightness-110 transition shadow">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay Background */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#5F1517]/80 backdrop-blur-sm z-40 sm:hidden transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed sm:relative top-0 left-0 h-full z-50 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full sm:translate-x-0'} ${sidebarOpen ? 'sm:w-64' : 'sm:w-[72px]'}`}
        style={{ background: 'linear-gradient(180deg, #4a1012 0%, #5F1517 40%, #5a1315 100%)', borderRight: '1px solid rgba(212,175,55,0.15)' }}>

        {/* Logo Header */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-[#D4AF37]/10 ${(sidebarOpen || mobileMenuOpen) ? '' : 'justify-center'}`}>
          <div className="relative flex-shrink-0">
            <img src={logo} alt="Siri Samruddhi" className="w-9 h-9 object-contain drop-shadow-lg" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#5F1517]" />
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="flex-1 overflow-hidden">
              <div className="text-[#D4AF37] font-bold text-sm tracking-tight whitespace-nowrap" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Siri Samruddhi</div>
              <div className="text-[#D4AF37]/40 text-[9px] uppercase font-semibold tracking-[0.25em] whitespace-nowrap mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Admin Portal</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`hidden sm:flex items-center justify-center ${sidebarOpen ? 'ml-auto' : ''} w-6 h-6 text-[#D4AF37]/30 hover:text-[#D4AF37] transition-colors flex-shrink-0 rounded-md hover:bg-white/8`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              {sidebarOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              }
            </svg>
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="sm:hidden ml-auto flex items-center justify-center w-7 h-7 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors rounded-md hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-4 overflow-y-auto scrollbar-hide space-y-0.5 ${(sidebarOpen || mobileMenuOpen) ? 'px-3' : 'px-2'}`}>
          <NavItem id="dashboard" label="Dashboard" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          } />

          <NavLabel label="Catalogue" />

          <NavItem id="all-products" label="All Products" count={stats.products} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          } />

          <NavItem id="add-product" label={editPId ? 'Edit Product' : 'Add Product'} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          } />

          <NavItem id="all-categories" label="Categories" count={stats.categories} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h7l2-3h7M3 12h18M3 17h7l2 3h7" />
            </svg>
          } />

          <NavItem id="add-category" label={editCId ? 'Edit Category' : 'Add Category'} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          } />

          <NavItem id="metal-prices" label="Metal Rates" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />

          <NavLabel label="Commerce" />

          <NavItem id="orders" label="Orders" count={stats.pending} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          } />

          <NavItem id="virtual-bookings" label="Video Shopping" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          } />

          <NavItem id="subscriptions" label="Subscriptions" count={subscriptions.length} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-4.902-5.902A2.001 2.001 0 0012 3a2.001 2.001 0 00-1.098 2.098A6.02 6.02 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          } />

          <NavItem id="customers" label="Customers" count={stats.customers} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5c-1.657 0-3 1.343-3 3s1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5C6.343 5 5 6.343 5 8s1.343 3 3 3zm8 2c2.209 0 4 1.791 4 4H4c0-2.209 1.791-4 4-4h8z" />
            </svg>
          } />

          <NavItem id="users" label="Users" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } />

          <NavLabel label="Account" />

          <NavItem id="change-password" label="Security" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          } />
        </nav>

        {/* Footer / Logout */}
        <div className={`p-3 border-t border-[#D4AF37]/10 ${(sidebarOpen || mobileMenuOpen) ? '' : 'flex justify-center'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[#FFF7F2]/35 hover:text-red-400 hover:bg-white/6 transition-all duration-200 group ${
              !(sidebarOpen || mobileMenuOpen) ? 'justify-center' : ''
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <svg className="w-4 h-4 flex-shrink-0 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {(sidebarOpen || mobileMenuOpen) && (
              <span className="text-[11px] font-semibold tracking-wide">Sign Out</span>
            )}
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
                {section === 'all-products' ? 'Products' : section === 'add-product' ? (editPId ? 'Edit Product' : 'Add Product') : section === 'all-categories' ? 'Categories' : section === 'add-category' ? (editCId ? 'Edit Category' : 'Add Category') : section === 'change-password' ? 'Security Settings' : section === 'customers' ? 'Customers' : section === 'users' ? 'All Users' : section === 'metal-prices' ? 'Metal Rates' : section === 'virtual-bookings' ? 'Video Shopping' : section === 'subscriptions' ? 'Subscriptions' : section.charAt(0).toUpperCase() + section.slice(1)}
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
          {section === 'virtual-bookings' && renderVirtualBookings()}
          {section === 'subscriptions' && renderSubscriptions()}
          {section === 'customers' && renderCustomers()}
          {section === 'users' && renderUsers()}
          {section === 'change-password' && renderChangePw()}
          {section === 'metal-prices' && renderMetalPrices()}
        </div>
      </main>
    </div>
  );
};




export default AdminPanel;
