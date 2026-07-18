export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  slug?: string;
  display_type?: string;
}

export interface Order {
  id: string;
  items: any[];
  total_amount: number;
  shipping_address: string;
  contact_phone: string;
  email?: string;
  full_name?: string;
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  user_username: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  disabled: boolean;
  auth_provider?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  discount_text?: string;
  ready_to_dispatch?: boolean;
  transit_insurance?: boolean;
  image_url?: string;
  gallery_urls?: string[];
  category_id?: string;
  is_on_sale?: boolean;
  sale_price?: number;
  sale_label?: string;
  price_breakup?: any;
  basic_info?: any;
  stone_info?: any;
  other_info?: any;
  return_policy?: any;
  status?: string;
  stock?: number;
  weight?: string;
  tags?: string;
  vendor?: string;
  seo_title?: string;
  seo_description?: string;
  description?: string;
  quantity?: number;
  // WooCommerce fields
  product_type?: string;
  slug?: string;
  short_description?: string;
  manage_stock?: boolean;
  allow_backorders?: string;
  low_stock_threshold?: number;
  sold_individually?: boolean;
  dimensions?: any;
  shipping_class?: string;
  upsells?: string[];
  cross_sells?: string[];
  attributes?: any[];
  purchase_note?: string;
  menu_order?: number;
  enable_reviews?: boolean;
}

export type Section =
  | 'dashboard'
  | 'all-products'
  | 'add-product'
  | 'all-categories'
  | 'add-category'
  | 'orders'
  | 'customers'
  | 'users'
  | 'change-password'
  | 'settings'
  | 'metal-prices'
  | 'virtual-bookings'
  | 'subscriptions';

export const emptyProduct = {
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

export const emptyCat = { name: '', description: '', image_url: '', parent_id: '', slug: '', display_type: 'default' };

export const exportToCSV = (data: any[], filename: string) => {
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
