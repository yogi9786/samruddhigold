import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dashboard from './views/Dashboard';
import ProductList from './views/ProductList';
import ProductForm from './views/ProductForm';
import CategoryList from './views/CategoryList';
import CategoryForm from './views/CategoryForm';
import OrderList from './views/OrderList';
import CustomerList from './views/CustomerList';
import UserList from './views/UserList';
import MetalPrices from './views/MetalPrices';
import VirtualBookings from './views/VirtualBookings';
import Subscriptions from './views/Subscriptions';
import Settings from './views/Settings';
import { Toast } from './components/UIComponents';
import api, { adminApi } from '../../api';
import logo from '../../assets/samruddhi-logo.png';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
// Primary: #5F1517  Accent: #801416  Gold: #D4AF37  Cream: #FFF7F2

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; description?: string; image_url?: string; parent_id?: string; slug?: string; display_type?: string; }
interface Order { id: string; items: any[]; total_amount: number; shipping_address: string; contact_phone: string; email?: string; full_name?: string; payment_method: string; razorpay_order_id?: string; razorpay_payment_id?: string; user_username: string; status: string; created_at: string; updated_at: string; }
interface User { id: string; username: string; email?: string; full_name?: string; disabled: boolean; auth_provider?: string; }
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
  // Product filters
  const [pSearch, setPSearch] = useState('');
  const [pCatFilter, setPCatFilter] = useState('');

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

  const [loading, setLoading] = useState({
    products: false,
    categories: false,
    orders: false,
    users: false
  });

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

  const filteredOrders = orders.filter(o => {
    const ms = !oSearch || o.id.includes(oSearch) || o.user_username.toLowerCase().includes(oSearch.toLowerCase());
    const mst = !oStatusFilter || o.status === oStatusFilter;
    return ms && mst;
  });

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
              {(loading.products || loading.categories || loading.orders || loading.users) && (
                <div className="w-3 h-3 border-2 border-[#5F1517] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">

          {section === 'dashboard' && <Dashboard stats={stats} orders={orders} setSection={setSection} refreshAll={refreshAll} setPForm={setPForm} setEditPId={setEditPId} emptyProduct={emptyProduct} />}
          {section === 'all-products' && <ProductList products={products} categories={categories} pSearch={pSearch} setPSearch={setPSearch} pCatFilter={pCatFilter} setPCatFilter={setPCatFilter} exportToCSV={exportToCSV} fetchProducts={fetchProducts} emptyProduct={emptyProduct} setPForm={setPForm} setEditPId={setEditPId} setPMsg={setPMsg} setSection={setSection} startEditProduct={startEditProduct} deleteProduct={deleteProduct} />}
          {section === 'add-product' && <ProductForm editPId={editPId} setSection={setSection} setEditPId={setEditPId} setPForm={setPForm} emptyProduct={emptyProduct} setPMsg={setPMsg} hasSnapshot={!!pSnapshot.current} handleRollbackProduct={handleRollbackProduct} pMsg={pMsg} handlePSubmit={handleProductSubmit} pForm={pForm} handlePInput={handlePInput} categories={categories} uploadMain={uploadMain} uploadingMain={uploadingMain} uploadGallery={uploadGallery} uploadingGallery={uploadingGallery} fetchProducts={fetchProducts} />}
          {section === 'all-categories' && <CategoryList categories={categories} cSearch={cSearch} setCSearch={setCSearch} exportToCSV={exportToCSV} fetchCategories={fetchCategories} emptyCat={emptyCat} setCForm={setCForm} setEditCId={setEditCId} setCMsg={setCMsg} setSection={setSection} startEditCat={startEditCat} deleteCat={deleteCat} products={products} />}
          {section === 'add-category' && <CategoryForm editCId={editCId} setSection={setSection} setEditCId={setEditCId} setCForm={setCForm} emptyCat={emptyCat} cMsg={cMsg} hasSnapshot={!!cSnapshot.current} handleRollbackCat={handleRollbackCat} handleCatSubmit={handleCatSubmit} cForm={cForm} handleCInput={handleCInput} categories={categories} uploadCatImg={uploadCatImg} uploadingCat={uploadingCat} />}
          {section === 'orders' && <OrderList filteredOrders={filteredOrders} oSearch={oSearch} setOSearch={setOSearch} oStatusFilter={oStatusFilter} setOStatusFilter={setOStatusFilter} exportToCSV={exportToCSV} fetchOrders={fetchOrders} updateOrderStatus={updateOrderStatus} />}
          {section === 'virtual-bookings' && <VirtualBookings virtualBookings={virtualBookings} vSearch={vSearch} setVSearch={setVSearch} vStatusFilter={vStatusFilter} setVStatusFilter={setVStatusFilter} exportToCSV={exportToCSV} fetchVirtualBookings={fetchVirtualBookings} loadingBookings={loadingBookings} updateBookingStatus={updateBookingStatus} viewBookingDetails={viewBookingDetails} deleteBooking={deleteBooking} />}
          {section === 'subscriptions' && <Subscriptions subscriptions={subscriptions} subSearch={subSearch} setSubSearch={setSubSearch} exportToCSV={exportToCSV} fetchSubscriptions={fetchSubscriptions} loadingSubscriptions={loadingSubscriptions} />}
          {section === 'customers' && <CustomerList customers={customers} orders={orders} exportToCSV={exportToCSV} fetchUsers={fetchUsers} />}
          {section === 'users' && <UserList users={users} exportToCSV={exportToCSV} fetchUsers={fetchUsers} />}
          {section === 'change-password' && <Settings pwMsg={pwMsg} pw={pw} setPw={setPw} handleChangePw={handleChangePw} />}
          {section === 'metal-prices' && <MetalPrices editMId={editMId} setEditMId={setEditMId} mForm={mForm} setMForm={setMForm} handleMInput={handleMInput} handleMetalSubmit={handleMetalSubmit} metalPrices={metalPrices} startEditMetal={startEditMetal} deleteMetalPrice={deleteMetalPrice} />}

        </div>
      </main>
    </div>
  );
};




export default AdminPanel;
