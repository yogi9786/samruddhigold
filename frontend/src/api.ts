import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://147.93.110.125/api';

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
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
