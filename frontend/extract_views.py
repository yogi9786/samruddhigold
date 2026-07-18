import re
import os

filepath = r'c:\Users\wheny\OneDrive\Desktop\samruddhigoldpalace\frontend\src\pages\AdminPanel.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def extract_section(content, start_marker, end_marker, fn_name):
    start = content.find(start_marker)
    if start == -1: return ''
    end = content.find(end_marker, start) if end_marker else content.find('// ───', start + len(start_marker))
    if end == -1: end = len(content)
    
    section = content[start:end]
    
    decl_start = section.find('const ' + fn_name)
    if decl_start != -1:
        arrow_idx = section.find('=>', decl_start)
        
        after_arrow = section[arrow_idx+2:].strip()
        if after_arrow.startswith('{'):
            body_start = section.find('{', arrow_idx) + 1
            body = section[body_start:]
            last_brace = body.rfind('}')
            body = body[:last_brace]
            return body.strip()
        elif after_arrow.startswith('('):
            body_start = section.find('(', arrow_idx) + 1
            body = section[body_start:]
            last_paren = body.rfind(';')
            if last_paren != -1:
                body = body[:last_paren]
            last_paren = body.rfind(')')
            if last_paren != -1:
                body = body[:last_paren]
            return 'return (\n' + body.strip() + '\n);'
    
    return ''

views = {
    'CategoryList': {
        'start': '// ─── ALL CATEGORIES',
        'fn': 'renderAllCategories',
        'props': '''interface CategoryListProps {
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
}''',
        'args': '{ categories, cSearch, setCSearch, exportToCSV, fetchCategories, emptyCat, setCForm, setEditCId, setCMsg, setSection, startEditCat, deleteCat, products }'
    },
    'CategoryForm': {
        'start': '// ─── ADD / EDIT CATEGORY',
        'fn': 'renderCategoryForm',
        'props': '''interface CategoryFormProps {
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
}''',
        'args': '{ editCId, setSection, setEditCId, setCForm, emptyCat, cMsg, hasSnapshot, handleRollbackCat, handleCatSubmit, cForm, handleCInput, categories, uploadCatImg, uploadingCat }'
    },
    'OrderList': {
        'start': '// ─── ORDERS',
        'fn': 'renderOrders',
        'props': '''interface OrderListProps {
  filteredOrders: any[];
  oSearch: string;
  setOSearch: (s: string) => void;
  oStatusFilter: string;
  setOStatusFilter: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchOrders: () => void;
  updateOrderStatus: (id: string, status: string) => void;
}''',
        'args': '{ filteredOrders, oSearch, setOSearch, oStatusFilter, setOStatusFilter, exportToCSV, fetchOrders, updateOrderStatus }',
        'pre': '''const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};'''
    },
    'CustomerList': {
        'start': '// ─── CUSTOMERS',
        'fn': 'renderCustomers',
        'props': '''interface CustomerListProps {
  customers: any[];
  orders: any[];
  exportToCSV: (data: any[], filename: string) => void;
  fetchUsers: () => void;
}''',
        'args': '{ customers, orders, exportToCSV, fetchUsers }'
    },
    'UserList': {
        'start': '// ─── USERS',
        'fn': 'renderUsers',
        'props': '''interface UserListProps {
  users: any[];
  exportToCSV: (data: any[], filename: string) => void;
  fetchUsers: () => void;
}''',
        'args': '{ users, exportToCSV, fetchUsers }'
    },
    'MetalPrices': {
        'start': '// ─── METAL PRICES',
        'fn': 'renderMetalPrices',
        'props': '''interface MetalPricesProps {
  editMId: string | null;
  setEditMId: (id: string | null) => void;
  mForm: any;
  setMForm: (m: any) => void;
  handleMInput: (e: React.ChangeEvent<any>) => void;
  handleMetalSubmit: (e: React.FormEvent) => void;
  metalPrices: any[];
  startEditMetal: (m: any) => void;
  deleteMetalPrice: (id: string) => void;
}''',
        'args': '{ editMId, setEditMId, mForm, setMForm, handleMInput, handleMetalSubmit, metalPrices, startEditMetal, deleteMetalPrice }'
    },
    'VirtualBookings': {
        'start': '// ─── VIRTUAL BOOKINGS',
        'fn': 'renderVirtualBookings',
        'props': '''interface VirtualBookingsProps {
  virtualBookings: any[];
  vSearch: string;
  setVSearch: (s: string) => void;
  vStatusFilter: string;
  setVStatusFilter: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchVirtualBookings: () => void;
  loadingBookings: boolean;
  updateBookingStatus: (id: string, status: string) => void;
  viewBookingDetails: (id: string) => void;
  deleteBooking: (id: string) => void;
}''',
        'args': '{ virtualBookings, vSearch, setVSearch, vStatusFilter, setVStatusFilter, exportToCSV, fetchVirtualBookings, loadingBookings, updateBookingStatus, viewBookingDetails, deleteBooking }'
    },
    'Subscriptions': {
        'start': '// ─── SUBSCRIPTIONS',
        'fn': 'renderSubscriptions',
        'props': '''interface SubscriptionsProps {
  subscriptions: any[];
  subSearch: string;
  setSubSearch: (s: string) => void;
  exportToCSV: (data: any[], filename: string) => void;
  fetchSubscriptions: () => void;
  loadingSubscriptions: boolean;
}''',
        'args': '{ subscriptions, subSearch, setSubSearch, exportToCSV, fetchSubscriptions, loadingSubscriptions }'
    },
    'Settings': {
        'start': '// ─── CHANGE PASSWORD',
        'fn': 'renderChangePw',
        'props': '''interface SettingsProps {
  pwMsg: any;
  pw: any;
  setPw: React.Dispatch<React.SetStateAction<any>>;
  handleChangePw: (e: React.FormEvent) => void;
}''',
        'args': '{ pwMsg, pw, setPw, handleChangePw }'
    }
}

for name, meta in views.items():
    body = extract_section(content, meta['start'], None, meta['fn'])
    if not body:
        print(f"Failed to extract {name}")
        continue
        
    out_content = f'''import React from 'react';
import {{ Section, Category }} from '../types';
import {{ Alert, SCard, Field, ImgUpload }} from '../components/UIComponents';
import {{ Folder, Shield, TrendingUp, FileText }} from 'lucide-react';
import {{ getImageUrl }} from '../../utils';

{meta.get('pre', '')}

{meta['props']}

const {name}: React.FC<{name}Props> = ({meta['args']}) => {{
  {body}
}};

export default {name};
'''
    with open(f'c:\\Users\\wheny\\OneDrive\\Desktop\\samruddhigoldpalace\\frontend\\src\\pages\\admin\\views\\{name}.tsx', 'w', encoding='utf-8') as f:
        f.write(out_content)
    print(f"Generated {name}.tsx")
