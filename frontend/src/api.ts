import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://sirisamruddhigold.com/api';

export const getImageUrl = (url?: string) => {
  if (!url) return '';
  
  // If url is a JSON array string, parse it and use the first image
  let parsedUrl = url;
  if (url.startsWith('[') && url.endsWith(']')) {
    try {
      const arr = JSON.parse(url);
      if (Array.isArray(arr) && arr.length > 0) {
        parsedUrl = arr[0];
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  if (parsedUrl.startsWith('http://') || parsedUrl.startsWith('https://')) {
    return parsedUrl;
  }
  if (parsedUrl.startsWith('/api/')) {
    return `${BASE_URL.replace(/\/api$/, '')}${parsedUrl}`;
  }
  if (parsedUrl.startsWith('/')) {
    return `${BASE_URL.replace(/\/api$/, '')}${parsedUrl}`;
  }
  return `${BASE_URL}/uploads/${parsedUrl}`;
};

// ─── User API ────────────────────────────────────────────────────────────────
// Used by all user-facing components (login, signup, products, contact, header).
// Attaches access_token automatically when present.
// Does NOT touch admin_token.
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

// ─── Admin API ────────────────────────────────────────────────────────────────
// Used exclusively by AdminPanel.
// Injects admin_token and redirects to '/' on 401.
export const login = (data: any) => api.post('/auth/token', data, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
export const register = (data: any) => api.post('/users/', data);
export const googleLogin = (credential: string) => api.post('/auth/google', { credential });
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password });

export const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/siriadmin') || window.location.pathname.startsWith('/admin')) {
        window.location.reload();
      } else {
        window.location.href = '/siriadmin';
      }
    }
    return Promise.reject(error);
  }
);

// Cart User ID helper
export const getCartUserId = () => {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

// Cart API
export const getCart = () => api.get(`/cart/${getCartUserId()}`);
export const addToCart = (productId: string, quantity: number = 1, phone?: string) => api.post('/cart', { user_id: getCartUserId(), product_id: productId, quantity, phone });

export const updateCartItem = (id: string, quantity: number) => api.put(`/cart/${id}`, { quantity });
export const removeFromCart = (id: string) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete(`/cart?user_id=${getCartUserId()}`);

// Wishlist API
export const getWishlist = () => api.get('/wishlist/');
export const addToWishlist = (productId: string, userId: string) => api.post('/wishlist/', { product_id: productId, user_id: userId });
export const removeFromWishlist = (productId: string) => api.delete(`/wishlist/${productId}`);

// Order & Checkout API
export const checkoutOrder = (orderData: any) => api.post('/orders/checkout', orderData);
export const verifyPayment = (paymentData: any) => api.post('/orders/verify-payment', paymentData);

export default api;
