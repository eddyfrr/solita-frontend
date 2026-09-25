"use client";

import { createContext, useContext, useCallback, useSyncExternalStore, type ReactNode } from "react";

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
  /** False until the cart has been read from localStorage on the client.
   *  Pages must not render an "empty cart" state while this is false — on the
   *  server `items` is always [], so doing so shows every customer with a full
   *  cart an empty one until React hydrates. */
  hydrated: boolean;
}

const CART_STORAGE_KEY = "ayya-cart";

// ── Cart store ──
// The cart lives in localStorage and is read through useSyncExternalStore:
// the server (and hydration) see an empty cart, the client sees the stored
// one, with no effect copying storage into state. Writes go straight to
// storage, so nothing added before hydration can be lost, and the "storage"
// event keeps a cart open in two tabs in sync.

const EMPTY_CART: CartItem[] = [];
const listeners = new Set<() => void>();
// Parsed snapshot, reused until the stored string changes (useSyncExternalStore
// needs a stable reference between renders).
let snapshot: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY_CART };
// Set if localStorage refuses writes (e.g. some private modes): the cart then
// lives in memory for the visit instead of silently emptying.
let memoryOnly = false;

function readCart(): CartItem[] {
  if (memoryOnly) return snapshot.items;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return snapshot.items;
  }
  if (raw !== snapshot.raw) {
    let items = EMPTY_CART;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) items = parsed as CartItem[];
    } catch {
      // corrupt entry — treat as empty
    }
    snapshot = { raw, items };
  }
  return snapshot.items;
}

function writeCart(update: (prev: CartItem[]) => CartItem[]) {
  const items = update(readCart());
  const raw = JSON.stringify(items);
  try {
    localStorage.setItem(CART_STORAGE_KEY, raw);
  } catch {
    memoryOnly = true;
  }
  snapshot = { raw, items };
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

const noSubscribe = () => () => {};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);
  // true only once rendering on the client, where the stored cart is readable
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    writeCart((prev) => {
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
    writeCart((prev) =>
      prev.filter((i) => !(i.slug === slug && i.selectedLength === selectedLength))
    );
  }, []);

  const updateQuantity = useCallback(
    (slug: string, quantity: number, selectedLength?: string) => {
      if (quantity <= 0) {
        removeFromCart(slug, selectedLength);
        return;
      }
      writeCart((prev) =>
        prev.map((i) =>
          i.slug === slug && i.selectedLength === selectedLength
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => writeCart(() => []), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, hydrated }}
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
