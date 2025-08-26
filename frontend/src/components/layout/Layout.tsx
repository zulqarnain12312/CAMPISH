'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  cartItemCount?: number;
  onLogout?: () => void;
}

export default function Layout({ children, user, cartItemCount = 0, onLogout }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference or default to system preference
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true');
    } else {
      setIsDarkMode(systemPrefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header 
        user={user} 
        cartItemCount={cartItemCount} 
        onLogout={onLogout}
      />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 z-50"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#374151' : '#fff',
            color: isDarkMode ? '#fff' : '#374151',
            border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}