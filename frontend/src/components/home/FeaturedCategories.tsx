'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';
import { apiClient } from '@/lib/api';

const placeholderCategories: Category[] = [
  {
    _id: '1',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: '/images/categories/electronics.jpg',
    slug: 'electronics',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: '/images/categories/fashion.jpg',
    slug: 'fashion',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    image: '/images/categories/home.jpg',
    slug: 'home-garden',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Sports & Outdoors',
    description: 'Equipment for sports and outdoor activities',
    image: '/images/categories/sports.jpg',
    slug: 'sports-outdoors',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Books & Media',
    description: 'Books, movies, and entertainment',
    image: '/images/categories/books.jpg',
    slug: 'books-media',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Health & Beauty',
    description: 'Personal care and wellness products',
    image: '/images/categories/health.jpg',
    slug: 'health-beauty',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>(placeholderCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>('/categories/featured');
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep using placeholder categories
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover products in your favorite categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Discover products in your favorite categories
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/category/${category.slug}`}>
                <div className="group cursor-pointer">
                  {/* Category Image */}
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                    <div className="aspect-square w-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                      <div className="text-4xl">
                        {category.name === 'Electronics' && '📱'}
                        {category.name === 'Fashion' && '👕'}
                        {category.name === 'Home & Garden' && '🏠'}
                        {category.name === 'Sports & Outdoors' && '⚽'}
                        {category.name === 'Books & Media' && '📚'}
                        {category.name === 'Health & Beauty' && '💄'}
                        {!['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors', 'Books & Media', 'Health & Beauty'].includes(category.name) && '🛍️'}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>

                  {/* Category Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}