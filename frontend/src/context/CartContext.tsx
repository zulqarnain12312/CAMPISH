'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem, Product } from '@/types';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (product: Product, quantity: number, variant?: any) => Promise<void>;
  updateCartItem: (productId: string, quantity: number, variant?: any) => Promise<void>;
  removeFromCart: (productId: string, variant?: any) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Initialize empty cart
      setCart({
        _id: '',
        items: [],
        totalAmount: 0,
        totalItems: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number, variant?: any) => {
    try {
      const response = await cartAPI.addToCart({
        productId: product._id,
        quantity,
        variant,
      });
      
      setCart(response.data.cart);
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      throw new Error(message);
    }
  };

  const updateCartItem = async (productId: string, quantity: number, variant?: any) => {
    try {
      const response = await cartAPI.updateCartItem({
        productId,
        quantity,
        variant,
      });
      
      setCart(response.data.cart);
      
      if (quantity === 0) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      throw new Error(message);
    }
  };

  const removeFromCart = async (productId: string, variant?: any) => {
    try {
      const response = await cartAPI.removeFromCart(productId, variant);
      setCart(response.data.cart);
      toast.success('Item removed from cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      toast.error(message);
      throw new Error(message);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({
        _id: '',
        items: [],
        totalAmount: 0,
        totalItems: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Cart cleared');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      throw new Error(message);
    }
  };

  const getTotalItems = () => {
    return cart?.totalItems || 0;
  };

  const getTotalAmount = () => {
    return cart?.totalAmount || 0;
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};