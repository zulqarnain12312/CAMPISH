import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add session ID for cart functionality
    const sessionId = localStorage.getItem('sessionId') || generateSessionId();
    config.headers['X-Session-ID'] = sessionId;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Generate session ID for guest users
function generateSessionId(): string {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
  return sessionId;
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/me'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: FormData) => 
    api.put('/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteAccount: () => api.delete('/users/account'),
};

// Product API
export const productAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  
  getProduct: (id: string) => api.get(`/products/${id}`),
  
  getProductBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  
  getFeaturedProducts: () => api.get('/products/featured/list'),
  
  searchProducts: (query: string, filters?: any) =>
    api.get('/products', { params: { search: query, ...filters } }),
};

// Category API
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  
  getCategory: (id: string) => api.get(`/categories/${id}`),
  
  getCategoryBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  
  addToCart: (data: { productId: string; quantity: number; variant?: any }) =>
    api.post('/cart/add', data),
  
  updateCartItem: (data: { productId: string; quantity: number; variant?: any }) =>
    api.put('/cart/update', data),
  
  removeFromCart: (productId: string, variant?: any) =>
    api.delete(`/cart/remove/${productId}`, { params: { variant: JSON.stringify(variant) } }),
  
  clearCart: () => api.delete('/cart/clear'),
  
  mergeCart: (guestSessionId: string) =>
    api.post('/cart/merge', { guestSessionId }),
};

// Order API
export const orderAPI = {
  createOrder: (data: any) => api.post('/orders/create', data),
  
  getOrders: (params?: any) => api.get('/orders/my-orders', { params }),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data: { orderId: string }) =>
    api.post('/payment/create-payment-intent', data),
  
  confirmPayment: (data: { paymentIntentId: string }) =>
    api.post('/payment/confirm-payment', data),
  
  getPaymentMethods: () => api.get('/payment/payment-methods'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  
  createProduct: (data: FormData) =>
    api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateProduct: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  getCategories: () => api.get('/admin/categories'),
  
  createCategory: (data: FormData) =>
    api.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateCategory: (id: string, data: FormData) =>
    api.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
  
  getOrders: (params?: any) => api.get('/orders/admin/all', { params }),
  
  updateOrderStatus: (id: string, data: any) =>
    api.put(`/orders/${id}/status`, data),
  
  getSalesAnalytics: (period?: string) =>
    api.get('/admin/analytics/sales', { params: { period } }),
};

export default api;