import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', sku: '', price: 0, original_price: 0, discount_text: '',
    ready_to_dispatch: false, transit_insurance: false, image_url: '',
    // Price Breakup
    metal_value: 0, gold_rate: '', gold_weight: '', stone_value: 0, stone_weight: '',
    making_charges_value: 0, making_charges_discount: 0, making_charges_final: 0,
    sub_total_value: 0, sub_total_final: 0, tax_value: 0, tax_final: 0,
    grand_total_value: 0, grand_total_final: 0,
    // Basic Info
    height: '', material: '', metal: '', metal_purity: '', width: '', approx_gross_weight: '',
    // Stone Info
    stone_1_name: '', stone_1_weight: '',
    // Other Info
    chain_included: '', earring_type: '', gold_certification: '', metal_finish: '', occasion: '',
    // Return Policy
    return_days: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    
    setUploading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/upload-image`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
      setMessage({ text: 'Image uploaded successfully!', type: 'success' });
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
      setMessage({ text: 'Failed to upload image: ' + (error.response?.data?.detail || error.message), type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('admin_token', newToken);
      setLoginError('');
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: 'Submitting...', type: 'info' });
    
    // Construct nested object
    const payload = {
      name: formData.name,
      sku: formData.sku,
      price: formData.price,
      original_price: formData.original_price,
      discount_text: formData.discount_text,
      ready_to_dispatch: formData.ready_to_dispatch,
      transit_insurance: formData.transit_insurance,
      image_url: formData.image_url,
      price_breakup: {
        metal_value: formData.metal_value,
        gold_rate: formData.gold_rate,
        gold_weight: formData.gold_weight,
        stone_value: formData.stone_value,
        stone_weight: formData.stone_weight,
        making_charges_value: formData.making_charges_value,
        making_charges_discount: formData.making_charges_discount,
        making_charges_final: formData.making_charges_final,
        sub_total_value: formData.sub_total_value,
        sub_total_final: formData.sub_total_final,
        tax_value: formData.tax_value,
        tax_final: formData.tax_final,
        grand_total_value: formData.grand_total_value,
        grand_total_final: formData.grand_total_final,
      },
      basic_info: {
        height: formData.height,
        material: formData.material,
        metal: formData.metal,
        metal_purity: formData.metal_purity,
        width: formData.width,
        approx_gross_weight: formData.approx_gross_weight,
      },
      stone_info: {
        stone_1_name: formData.stone_1_name,
        stone_1_weight: formData.stone_1_weight,
      },
      other_info: {
        chain_included: formData.chain_included,
        earring_type: formData.earring_type,
        gold_certification: formData.gold_certification,
        metal_finish: formData.metal_finish,
        occasion: formData.occasion,
      },
      return_policy: {
        return_days: formData.return_days,
      }
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Product added successfully!', type: 'success' });
      // Reset main fields
      setFormData(prev => ({ ...prev, name: '', sku: '', price: 0 }));
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
      setMessage({ text: 'Failed to add product: ' + (error.response?.data?.detail || error.message), type: 'error' });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#5F1517] mb-6">Admin Login</h2>
          {loginError && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border rounded focus:ring-[#801416] focus:border-[#801416]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded focus:ring-[#801416] focus:border-[#801416]" />
            </div>
            <button type="submit" className="w-full bg-[#801416] text-white py-2 rounded hover:bg-[#5F1517] transition-colors">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#5F1517]">Add New Product</h1>
          <button onClick={handleLogout} className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">Logout</button>
        </div>

        {message.text && (
          <div className={`p-4 rounded mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* Top Level Info */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">SKU *</label><input type="text" name="sku" value={formData.sku} onChange={handleInputChange} required className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Price *</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Original Price</label><input type="number" name="original_price" value={formData.original_price} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Discount Text</label><input type="text" name="discount_text" value={formData.discount_text} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div className="col-span-full md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Image Upload</label>
                <div className="flex gap-4 items-center">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="border rounded p-1.5 w-full max-w-xs" disabled={uploading} />
                  {uploading && <span className="text-sm text-blue-600 font-medium">Uploading...</span>}
                </div>
                <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full border rounded p-2 mt-2 bg-gray-50 text-gray-500" placeholder="Image URL will appear here" readOnly />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" name="ready_to_dispatch" checked={formData.ready_to_dispatch} onChange={handleInputChange} className="w-4 h-4" />
                <label className="text-sm text-gray-600">Ready to Dispatch</label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" name="transit_insurance" checked={formData.transit_insurance} onChange={handleInputChange} className="w-4 h-4" />
                <label className="text-sm text-gray-600">Transit Insurance</label>
              </div>
            </div>
          </section>

          {/* Price Breakup */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Price Breakup</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Metal Value</label><input type="number" name="metal_value" value={formData.metal_value} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Gold Rate</label><input type="text" name="gold_rate" value={formData.gold_rate} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Gold Weight</label><input type="text" name="gold_weight" value={formData.gold_weight} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Stone Value</label><input type="number" name="stone_value" value={formData.stone_value} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Stone Weight</label><input type="text" name="stone_weight" value={formData.stone_weight} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Making Charges Value</label><input type="number" name="making_charges_value" value={formData.making_charges_value} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Making Charges Discount</label><input type="number" name="making_charges_discount" value={formData.making_charges_discount} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Making Charges Final</label><input type="number" name="making_charges_final" value={formData.making_charges_final} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Sub Total Value</label><input type="number" name="sub_total_value" value={formData.sub_total_value} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Sub Total Final</label><input type="number" name="sub_total_final" value={formData.sub_total_final} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Tax Value</label><input type="number" name="tax_value" value={formData.tax_value} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Tax Final</label><input type="number" name="tax_final" value={formData.tax_final} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Grand Total Value</label><input type="number" name="grand_total_value" value={formData.grand_total_value} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Grand Total Final</label><input type="number" name="grand_total_final" value={formData.grand_total_final} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
            </div>
          </section>

          {/* Basic Info */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Height</label><input type="text" name="height" value={formData.height} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Material</label><input type="text" name="material" value={formData.material} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Metal</label><input type="text" name="metal" value={formData.metal} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Metal Purity</label><input type="text" name="metal_purity" value={formData.metal_purity} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Width</label><input type="text" name="width" value={formData.width} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Approx Gross Weight</label><input type="text" name="approx_gross_weight" value={formData.approx_gross_weight} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
            </div>
          </section>

          {/* Stone Info */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Stone Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Stone 1 Name</label><input type="text" name="stone_1_name" value={formData.stone_1_name} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Stone 1 Weight</label><input type="text" name="stone_1_weight" value={formData.stone_1_weight} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
            </div>
          </section>

          {/* Other Info */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Other Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Chain Included</label><input type="text" name="chain_included" value={formData.chain_included} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Earring Type</label><input type="text" name="earring_type" value={formData.earring_type} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Gold Certification</label><input type="text" name="gold_certification" value={formData.gold_certification} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Metal Finish</label><input type="text" name="metal_finish" value={formData.metal_finish} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Occasion</label><input type="text" name="occasion" value={formData.occasion} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
            </div>
          </section>

          {/* Return Policy */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Return Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Return Days</label><input type="text" name="return_days" value={formData.return_days} onChange={handleInputChange} className="w-full border rounded p-2" /></div>
            </div>
          </section>

          <div className="pt-4 border-t">
            <button type="submit" className="w-full bg-[#801416] text-white py-3 rounded text-lg font-semibold hover:bg-[#5F1517] transition-colors">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
