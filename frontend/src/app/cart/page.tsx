'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, total, removeItem, updateQuantity, fetchCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Your cart is empty
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </motion.button>
              </Link>
              
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  <ArrowLeft className="inline h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Cart Items
                  </h2>
                  
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                            <div className="text-2xl">
                              {item.product.category.name === 'Electronics' && '📱'}
                              {item.product.category.name === 'Fashion' && '👕'}
                              {item.product.category.name === 'Home & Garden' && '🏠'}
                              {item.product.category.name === 'Sports & Outdoors' && '⚽'}
                              {item.product.category.name === 'Books & Media' && '📚'}
                              {item.product.category.name === 'Health & Beauty' && '💄'}
                              {!['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors', 'Books & Media', 'Health & Beauty'].includes(item.product.category.name) && '🛍️'}
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.product._id}`}>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.product.category.name}
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-12 text-center text-gray-900 dark:text-white font-medium">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">
                      {total >= 50 ? 'Free' : '$5.99'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">
                      ${(total * 0.08).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">
                        ${(total + (total >= 50 ? 0 : 5.99) + (total * 0.08)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-6"
                >
                  Proceed to Checkout
                </motion.button>

                <div className="mt-4 text-center">
                  <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    <ArrowLeft className="inline h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}