export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  video?: string;
  category: Category;
  stock: number;
  quality: 'new' | 'used' | 'refurbished';
  rating: number;
  reviewCount: number;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  _id: string;
  user: User;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  _id: string;
  user: string;
  product: Product;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  quality?: string[];
  rating?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
}