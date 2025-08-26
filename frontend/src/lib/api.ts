import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  // File upload
  async upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', userData),
  
  googleAuth: (token: string) =>
    apiClient.post('/auth/google', { token }),
  
  logout: () => apiClient.post('/auth/logout'),
  
  me: () => apiClient.get('/auth/me'),
  
  refresh: () => apiClient.post('/auth/refresh'),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => apiClient.get('/products', params),
  
  getById: (id: string) => apiClient.get(`/products/${id}`),
  
  getFeatured: () => apiClient.get('/products/featured'),
  
  getTrending: () => apiClient.get('/products/trending'),
  
  search: (query: string, filters?: any) =>
    apiClient.get('/products/search', { query, ...filters }),
  
  getByCategory: (categoryId: string, params?: any) =>
    apiClient.get(`/products/category/${categoryId}`, params),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  
  getById: (id: string) => apiClient.get(`/categories/${id}`),
  
  getBySlug: (slug: string) => apiClient.get(`/categories/slug/${slug}`),
};

// Cart API
export const cartAPI = {
  get: () => apiClient.get('/cart'),
  
  addItem: (productId: string, quantity: number) =>
    apiClient.post('/cart/items', { productId, quantity }),
  
  updateItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),
  
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  
  clear: () => apiClient.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (orderData: any) => apiClient.post('/orders', orderData),
  
  getAll: (params?: any) => apiClient.get('/orders', params),
  
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  
  updateProfile: (userData: any) => apiClient.put('/users/profile', userData),
  
  getOrders: () => apiClient.get('/users/orders'),
  
  getWishlist: () => apiClient.get('/users/wishlist'),
  
  addToWishlist: (productId: string) =>
    apiClient.post('/users/wishlist', { productId }),
  
  removeFromWishlist: (productId: string) =>
    apiClient.delete(`/users/wishlist/${productId}`),
};

// Admin API
export const adminAPI = {
  // Products
  createProduct: (productData: any) => apiClient.post('/admin/products', productData),
  
  updateProduct: (id: string, productData: any) =>
    apiClient.put(`/admin/products/${id}`, productData),
  
  deleteProduct: (id: string) => apiClient.delete(`/admin/products/${id}`),
  
  uploadImage: (formData: FormData) => apiClient.upload('/admin/upload/image', formData),
  
  uploadVideo: (formData: FormData) => apiClient.upload('/admin/upload/video', formData),
  
  // Categories
  createCategory: (categoryData: any) => apiClient.post('/admin/categories', categoryData),
  
  updateCategory: (id: string, categoryData: any) =>
    apiClient.put(`/admin/categories/${id}`, categoryData),
  
  deleteCategory: (id: string) => apiClient.delete(`/admin/categories/${id}`),
  
  // Orders
  getAllOrders: (params?: any) => apiClient.get('/admin/orders', params),
  
  updateOrderStatus: (id: string, status: string) =>
    apiClient.patch(`/admin/orders/${id}/status`, { status }),
  
  // Users
  getAllUsers: (params?: any) => apiClient.get('/admin/users', params),
  
  updateUserRole: (id: string, role: string) =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),
  
  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  
  getSalesStats: (period: string) => apiClient.get('/admin/dashboard/sales', { period }),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (amount: number) =>
    apiClient.post('/payment/create-intent', { amount }),
  
  confirmPayment: (paymentData: any) =>
    apiClient.post('/payment/confirm', paymentData),
};