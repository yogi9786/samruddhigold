import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://147.93.110.125/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Use admin_token or access_token if available
  const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle 401 Unauthorized
      localStorage.removeItem('access_token');
      localStorage.removeItem('admin_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
