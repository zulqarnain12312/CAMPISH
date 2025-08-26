'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  categories?: any[];
}

export default function Layout({ children, categories = [] }: LayoutProps) {
  const { mode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  // Fetch cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header categories={categories} />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: mode === 'dark' ? '#374151' : '#fff',
            color: mode === 'dark' ? '#fff' : '#374151',
            border: `1px solid ${mode === 'dark' ? '#4B5563' : '#E5E7EB'}`,
          },
        }}
      />
    </div>
  );
}