'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Star, 
  ShoppingCart, 
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, Category } from '@/types';
import { productsAPI, categoriesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
          productsAPI.getFeatured(),
          productsAPI.getTrending(),
          categoriesAPI.getAll()
        ]);

        if (featuredRes.success) setFeaturedProducts(featuredRes.data || []);
        if (trendingRes.success) setTrendingProducts(trendingRes.data || []);
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load homepage data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hero slides
  const heroSlides = [
    {
      id: 1,
      title: "New Collection 2024",
      subtitle: "Discover the latest trends in fashion and lifestyle",
      image: "/images/hero-1.jpg",
      cta: "Shop Now",
      link: "/products"
    },
    {
      id: 2,
      title: "Premium Quality",
      subtitle: "Handpicked products for the discerning customer",
      image: "/images/hero-2.jpg",
      cta: "Explore",
      link: "/categories"
    },
    {
      id: 3,
      title: "Special Offers",
      subtitle: "Up to 50% off on selected items",
      image: "/images/hero-3.jpg",
      cta: "View Deals",
      link: "/products?sale=true"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const addToCart = async (productId: string) => {
    try {
      // TODO: Implement add to cart functionality
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      // TODO: Implement add to wishlist functionality
      toast.success('Product added to wishlist!');
    } catch (error) {
      toast.error('Failed to add product to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="relative h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundColor: '#f3f4f6'
                }}
              ></div>
              <div className="relative z-20 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-200 mb-8">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.link}
                      className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Hero Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our wide range of categories and find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group block"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {category.image && (
                    <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Handpicked products that our customers love
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => addToWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product._id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trending Now
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The most popular products this week
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => addToWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product._id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new products, exclusive offers, and special events.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
