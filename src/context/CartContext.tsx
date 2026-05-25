"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface CartItem {
  slug: string;
  title: string;
  price: string;
  imageUrl: string;
  selectedLength?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (slug: string, selectedLength?: string) => void;
  updateQuantity: (slug: string, quantity: number, selectedLength?: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CART_STORAGE_KEY = "ayya-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist cart to localStorage on change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.slug === item.slug && i.selectedLength === item.selectedLength
      );
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug && i.selectedLength === item.selectedLength
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((slug: string, selectedLength?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.slug === slug && i.selectedLength === selectedLength))
    );
  }, []);

  const updateQuantity = useCallback(
    (slug: string, quantity: number, selectedLength?: string) => {
      if (quantity <= 0) {
        removeFromCart(slug, selectedLength);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.slug === slug && i.selectedLength === selectedLength
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
