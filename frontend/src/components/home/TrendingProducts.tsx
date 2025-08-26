'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { apiClient } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const placeholderProducts: Product[] = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    originalPrice: 129.99,
    images: ['/images/products/headphones.jpg'],
    category: {
      _id: '1',
      name: 'Electronics',
      slug: 'electronics',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'AudioTech',
    sku: 'ATH-001',
    stock: 50,
    rating: 4.5,
    numReviews: 128,
    reviews: [],
    tags: ['wireless', 'bluetooth', 'headphones'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: 199.99,
    originalPrice: 249.99,
    images: ['/images/products/smartwatch.jpg'],
    category: {
      _id: '1',
      name: 'Electronics',
      slug: 'electronics',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'FitTech',
    sku: 'FTW-002',
    stock: 30,
    rating: 4.8,
    numReviews: 89,
    reviews: [],
    tags: ['fitness', 'smartwatch', 'health'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt',
    price: 29.99,
    originalPrice: 39.99,
    images: ['/images/products/tshirt.jpg'],
    category: {
      _id: '2',
      name: 'Fashion',
      slug: 'fashion',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'StyleCo',
    sku: 'SCT-003',
    stock: 100,
    rating: 4.3,
    numReviews: 256,
    reviews: [],
    tags: ['cotton', 't-shirt', 'casual'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Organic Coffee Maker',
    description: 'Automatic coffee maker with organic brewing',
    price: 149.99,
    originalPrice: 179.99,
    images: ['/images/products/coffeemaker.jpg'],
    category: {
      _id: '3',
      name: 'Home & Garden',
      slug: 'home-garden',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'BrewMaster',
    sku: 'BMC-004',
    stock: 25,
    rating: 4.6,
    numReviews: 67,
    reviews: [],
    tags: ['coffee', 'kitchen', 'appliance'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat for all types of workouts',
    price: 49.99,
    originalPrice: 69.99,
    images: ['/images/products/yogamat.jpg'],
    category: {
      _id: '4',
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'FitLife',
    sku: 'FLY-005',
    stock: 75,
    rating: 4.7,
    numReviews: 143,
    reviews: [],
    tags: ['yoga', 'fitness', 'mat'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Bestseller Novel',
    description: 'Award-winning fiction novel',
    price: 19.99,
    originalPrice: 24.99,
    images: ['/images/products/book.jpg'],
    category: {
      _id: '5',
      name: 'Books & Media',
      slug: 'books-media',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'BookWorld',
    sku: 'BWN-006',
    stock: 200,
    rating: 4.9,
    numReviews: 512,
    reviews: [],
    tags: ['fiction', 'novel', 'bestseller'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>(placeholderProducts);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get<Product[]>('/products/trending');
        if (response.success && response.data) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
        // Keep using placeholder products
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleWishlist = (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    toast.success(`${product.name} added to wishlist!`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trending Products
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Most popular products this week
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Trending Products
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Most popular products this week
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <Link href={`/product/${product._id}`}>
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                    <div className="text-6xl">
                      {product.category.name === 'Electronics' && '📱'}
                      {product.category.name === 'Fashion' && '👕'}
                      {product.category.name === 'Home & Garden' && '🏠'}
                      {product.category.name === 'Sports & Outdoors' && '⚽'}
                      {product.category.name === 'Books & Media' && '📚'}
                      {product.category.name === 'Health & Beauty' && '💄'}
                      {!['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors', 'Books & Media', 'Health & Beauty'].includes(product.category.name) && '🛍️'}
                    </div>
                  </div>
                  
                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleWishlist(product);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/product/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({product.numReviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Products Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}