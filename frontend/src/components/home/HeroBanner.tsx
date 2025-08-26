'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    title: "Discover Premium Quality",
    subtitle: "Shop the latest trends with unbeatable prices",
    description: "Explore our curated collection of high-quality products designed to enhance your lifestyle.",
    image: "/images/hero-1.jpg",
    cta: "Shop Now",
    ctaLink: "/products",
    secondaryCta: "Learn More",
    secondaryCtaLink: "/about",
  },
  {
    id: 2,
    title: "Exclusive Deals",
    subtitle: "Limited time offers on trending products",
    description: "Don't miss out on our exclusive deals and discounts on the most popular items.",
    image: "/images/hero-2.jpg",
    cta: "View Deals",
    ctaLink: "/deals",
    secondaryCta: "Sign Up",
    secondaryCtaLink: "/register",
  },
  {
    id: 3,
    title: "Free Shipping",
    subtitle: "On orders over $50",
    description: "Enjoy free shipping on all orders over $50. Fast delivery to your doorstep.",
    image: "/images/hero-3.jpg",
    cta: "Start Shopping",
    ctaLink: "/products",
    secondaryCta: "Track Order",
    secondaryCtaLink: "/track",
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroSlides[currentSlide].image})`,
            backgroundBlendMode: 'overlay',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="text-white space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                  {heroSlides[currentSlide].subtitle}
                </h2>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  {heroSlides[currentSlide].title}
                </h1>
              </div>
              
              <p className="text-lg lg:text-xl text-gray-200 max-w-lg">
                {heroSlides[currentSlide].description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={heroSlides[currentSlide].ctaLink}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <span>{heroSlides[currentSlide].cta}</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
                
                <Link href={heroSlides[currentSlide].secondaryCtaLink}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>{heroSlides[currentSlide].secondaryCta}</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Image/Visual Content */}
            <motion.div
              key={`image-${currentSlide}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-96 h-96 mx-auto bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="text-xl font-semibold">Premium Shopping Experience</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}