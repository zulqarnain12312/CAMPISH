import { Suspense } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import TrendingProducts from '@/components/home/TrendingProducts';
import NewsletterSignup from '@/components/home/NewsletterSignup';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Featured Categories */}
      <Suspense fallback={<div>Loading categories...</div>}>
        <FeaturedCategories />
      </Suspense>
      
      {/* Trending Products */}
      <Suspense fallback={<div>Loading products...</div>}>
        <TrendingProducts />
      </Suspense>
      
      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
}
