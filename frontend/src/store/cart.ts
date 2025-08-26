import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, CartItem, Product } from '@/types';
import { apiClient } from '@/lib/api';

interface CartStore extends CartState {
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  calculateTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isLoading: false,

      addItem: async (product: Product, quantity: number = 1) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<CartItem>('/cart/add', {
            productId: product._id,
            quantity,
          });

          if (response.success && response.data) {
            const { items } = get();
            const existingItem = items.find(item => item.product._id === product._id);
            
            if (existingItem) {
              const updatedItems = items.map(item =>
                item.product._id === product._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
              set({ items: updatedItems, isLoading: false });
            } else {
              const newItem: CartItem = {
                _id: response.data._id,
                product,
                quantity,
                price: product.price,
              };
              set({ items: [...items, newItem], isLoading: false });
            }
            
            get().calculateTotal();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.delete(`/cart/remove/${productId}`);

          if (response.success) {
            const { items } = get();
            const updatedItems = items.filter(item => item.product._id !== productId);
            set({ items: updatedItems, isLoading: false });
            get().calculateTotal();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.put<CartItem>(`/cart/update/${productId}`, {
            quantity,
          });

          if (response.success && response.data) {
            const { items } = get();
            const updatedItems = items.map(item =>
              item.product._id === productId
                ? { ...item, quantity, price: response.data.price }
                : item
            );
            set({ items: updatedItems, isLoading: false });
            get().calculateTotal();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.delete('/cart/clear');

          if (response.success) {
            set({ items: [], total: 0, isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.get<{ items: CartItem[]; total: number }>('/cart');

          if (response.success && response.data) {
            set({
              items: response.data.items,
              total: response.data.total,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      calculateTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ total });
        return total;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
      }),
    }
  )
);