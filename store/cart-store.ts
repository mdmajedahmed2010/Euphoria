import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id?: string;
  variantId: string;
  productId: string;
  title?: string;
  name?: string;
  productName?: string;
  productSlug?: string;
  variantSku?: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  sku?: string;
  stock?: number;
  maxStock?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.variantId === newItem.variantId
          );
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            if (existing) {
              existing.quantity += newItem.quantity || 1;
            }
            return { items: updatedItems, isOpen: true };
          }
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      },
    }),
    {
      name: "Euphoria-cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
