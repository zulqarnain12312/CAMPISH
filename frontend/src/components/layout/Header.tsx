'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">ShopifyClone</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBagIcon className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <Button variant="ghost" size="icon">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                      {user.name}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Wishlist
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </form>

              {/* Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Auth Links for Mobile */}
              {!user && (
                <div className="pt-4 border-t border-border">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Theme Toggle for Mobile */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                >
                  {theme === 'dark' ? (
                    <>
                      <SunIcon className="h-5 w-5 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5 mr-2" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;