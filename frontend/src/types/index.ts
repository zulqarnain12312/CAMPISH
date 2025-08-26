// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
}

// Product types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVideo {
  url: string;
  thumbnail: string;
}

export interface ProductVariant {
  name: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: Category;
  tags: string[];
  images: ProductImage[];
  videos: ProductVideo[];
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Cart {
  _id: string;
  user?: string;
  sessionId?: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentDetails {
  method: 'stripe' | 'paypal' | 'cod';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  email: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentDetails: PaymentDetails;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProductForm {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: string;
  tags: string[];
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  images?: FileList;
  videos?: FileList;
}

export interface CategoryForm {
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  image?: FileList;
}

// Filter types
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'name' | 'price' | 'rating' | 'createdAt';
  order?: 'asc' | 'desc';
  featured?: boolean;
  page?: number;
  limit?: number;
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  recentOrders: Order[];
  topProducts: Product[];
}

export interface SalesData {
  _id: string;
  totalRevenue: number;
  orderCount: number;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Payment types
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}