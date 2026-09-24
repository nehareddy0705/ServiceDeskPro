import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('servicedesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors.join(', ')) ||
      error.message ||
      'An unexpected error occurred';
    
    // Auto clear credentials if 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('servicedesk_token');
      localStorage.removeItem('servicedesk_user');
      // If not on login page, redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
