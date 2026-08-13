import { create } from "zustand";

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category?: string;
  isNew?: boolean;
  isSoldOut?: boolean;
  description?: string;
  images?: string[];
  stock?: number;
}

interface QuickViewStore {
  isOpen: boolean;
  product: QuickViewProduct | null;
  openQuickView: (product: QuickViewProduct) => void;
  closeQuickView: () => void;
}

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  isOpen: false,
  product: null,
  openQuickView: (product) => set({ isOpen: true, product }),
  closeQuickView: () => set({ isOpen: false, product: null }),
}));
